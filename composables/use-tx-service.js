import {reactive, set} from '@vue/composition-api';
import {subscribeTransaction, toErcDecimals} from '~/api/web3.js';
import * as web3 from '~/api/web3.js';
import {HUB_BUY_STAGE as LOADING_STAGE} from '~/assets/variables.js';


/**
 * @type {import('@vue/composition-api').UnwrapRef<{privateKey: string, accountAddress: string, chainId: number, form: Object}>}
 */
const props = reactive({
    privateKey: '',
    accountAddress: '',
    chainId: 0,
    form: {},
});

/**
 * @param {{privateKey?: string, accountAddress?: string, chainId?: number, form?: any}} newProps
 */
function setProps(newProps) {
    Object.assign(props, newProps);
}

const state = reactive({
    /** @type {HUB_BUY_STAGE|string}*/
    loadingStage: '',
    steps: {},
});

async function sendEthTx({to, value, data, nonce, gasPrice, gasLimit}, loadingStage, isSpeedup = false) {
    // @TODO check recovery earlier
    const currentStep = state.steps[loadingStage];
    if (currentStep?.finished) {
        return currentStep.tx;
    } else if (currentStep?.tx && !isSpeedup) {
        return subscribeTransaction(currentStep.tx.hash, {confirmationCount: 0})
            .then((receipt) => {
                console.log('subscribeTransaction', receipt);
                addStepData(loadingStage, {tx: receipt, finished: true});
                return state.steps[loadingStage].tx;
            });
    }

    nonce = (nonce || nonce === 0) ? nonce : await web3.eth.getTransactionCount(props.accountAddress, 'latest');
    // force estimation to prevent smart contract errors
    const forceGasLimitEstimation = loadingStage === LOADING_STAGE.SEND_BRIDGE && !isSpeedup;
    gasLimit = gasLimit && !forceGasLimitEstimation ? gasLimit : await estimateTxGas({to, value, data});
    //@TODO fetch gasPrice
    gasPrice = (gasPrice /*|| this.ethGasPriceGwei*/ || 1).toString();
    const txParams = {
        to,
        value: value ? toErcDecimals(value, 18) : "0x00",
        data,
        nonce,
        gasPrice: web3.utils.toWei(gasPrice, 'gwei'),
        gas: gasLimit,
        chainId: props.chainId,
    };
    console.log('send', txParams);
    const { rawTransaction } = await web3.eth.accounts.signTransaction(txParams, props.privateKey);

    let txHash;
    // @TODO return tx from `steps` so it will have full data, instead of just receipt
    return web3.eth.sendSignedTransaction(rawTransaction)
        .on('transactionHash', (hash) => {
            txHash = hash;
            console.log(txHash);
            const tx = {
                hash: txHash,
                timestamp: (new Date()).toISOString(),
                params: {to, value, data, nonce, gasPrice, gasLimit, chainId: props.chainId},
            };
            addStepData(loadingStage, {tx});
        })
        .on('receipt', (receipt) => {
            console.log("receipt:", receipt);
            addStepData(loadingStage, {tx: receipt, finished: true});
        })
        // .on('confirmation', function (confirmationNumber, receipt) {
        //     if (confirmationNumber < 2) {
        //         console.log("confirmationNumber:" + confirmationNumber + " receipt:", receipt);
        //     }
        // })
        .on('error', (error) => {
            console.log(error);
            addStepData(loadingStage, {tx: {hash: txHash, error}});
        });
}

function estimateTxGas({to, value, data}) {
    const txParams = {
        from: props.accountAddress,
        to,
        value: value ? toErcDecimals(value) : "0x00",
        data,
    };

    return web3.eth.estimateGas(txParams)
        .then((gasLimit) => {
            if (gasLimit > 1000000) {
                throw new Error(`Gas limit estimate is too high: ${gasLimit}. Probably tx will be failed.`);
            }
            return gasLimit;
        });
}

function waitPendingStep(loadingStage) {
    if (!state.steps[loadingStage]) {
        return Promise.reject();
    }
    //@TODO store error in tx and reject on it
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const step = state.steps[loadingStage];
            const txList = step?.txList || step?.tx ? [step.tx] : [];
            // reject
            const erroredTxList = txList.filter((item) => item.error);
            if (txList.length && erroredTxList.length === txList.length) {
                if (txList.length > 1) {
                    reject(txList.slice().sort((a, b) => b.gasPrice - a.gasPrice)[0].error);
                } else {
                    reject(txList[0].error);
                }
                clearInterval(interval);
                return;
            }
            // resolve
            const finishedTx = txList.find((item) => item.blockHash);
            if (finishedTx) {
                resolve(finishedTx);
                clearInterval(interval);
            }
        }, 1000);
    });
}

function addStepData(loadingStage, data) {
    let {tx: newTx, ...otherData} = data;
    let txData;
    if (newTx && (newTx.hash || newTx.transactionHash)) {
        const step = state.steps[loadingStage];
        let txList = step?.txList || step?.tx ? [step.tx] : [];
        const oldMatchingTxIndex = txList.findIndex((item) => {
            const newTxHash = newTx.hash || newTx.transactionHash;
            return item?.hash === newTxHash;
        });
        if (oldMatchingTxIndex > -1) {
            newTx = {...txList[oldMatchingTxIndex], ...newTx};
        }
        if (data.finished) {
            txList = [newTx];
        } else if (oldMatchingTxIndex > -1) {
            txList[oldMatchingTxIndex] = newTx;
        } else {
            txList.push(newTx);
        }
        if (txList.length > 1) {
            const fastestTx = txList.slice().sort((a, b) => b.params?.gasPrice - a.params?.gasPrice)[0];
            txData = {
                txList,
                tx: fastestTx,
            };
        } else if (txList.length === 1) {
            txData = {
                tx: txList[0],
                // it overwrite old value
                txList: undefined,
            };
        }
    }
    set(state.steps, loadingStage, Object.freeze({...state.steps[loadingStage], ...txData, ...otherData}));
    const needSaveRecovery = loadingStage !== LOADING_STAGE.FINISH;
    console.log({loadingStage, needSaveRecovery}, {...state.steps[loadingStage], ...txData, ...otherData});
    if (needSaveRecovery) {
        window.localStorage.setItem('hub-buy-recovery', JSON.stringify({
            steps: state.steps,
            form: props.form,
            address: props.accountAddress.replace('0x', 'Mx'),
        }));
    } else {
        window.localStorage.removeItem('hub-buy-recovery');
    }
}

export default function useTxService() {
    return {
        txServiceState: state,
        setTxServiceProps: setProps,
        sendEthTx,
        estimateTxGas,
        waitPendingStep,
        addStepData,
    };
}
