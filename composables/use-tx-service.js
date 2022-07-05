import {reactive, set} from '@vue/composition-api';
import {getProviderByChain, web3Utils, subscribeTransaction, toErcDecimals} from '~/api/web3.js';
import {postTx} from '~/api/gate.js';
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
    // @TODO convert loading stage to computed on steps
    /** @type {HUB_BUY_STAGE|string}*/
    loadingStage: '',
    /** @type {Object.<LOADING_STAGE, SequenceStepItem>}*/
    steps: {},
});

/**
 * @typedef {object} SequenceStepItem
 * @property {SequenceStepTx} [tx]
 * @property {Array<SequenceStepTx>} [txList]
 * @property {boolean} [finished]
 */

/**
 * @typedef {TransactionReceipt&{hash: string, timestamp: string, params: object, error?: Error}} SequenceStepTx
 */

/**
 * @typedef {PostTxResponse} PostTxResponse
 * @property {string} timestamp
 */

/**
 * @param {TxParams} txParams
 * @return {Promise<PostTxResponse>}
 */
function sendMinterTx(txParams) {
    return postTx(txParams, {privateKey: props.privateKey})
        .then((tx) => {
            tx = Object.freeze({...tx, timestamp: (new Date()).toISOString()});
            return tx;
        });
}

/**
 * @param {object} txConfig
 * @param {string} txConfig.to
 * @param {number|string} txConfig.value
 * @param {string} txConfig.data
 * @param {number|string} txConfig.nonce
 * @param {number|string} txConfig.gasPrice
 * @param {number|string} [txConfig.gasLimit]
 * @param {LOADING_STAGE} loadingStage
 * @param {boolean} [isSpeedup=false]
 * @return {PromiEvent<TransactionReceipt>}
 */
async function sendEthTx({to, value, data, nonce, gasPrice, gasLimit}, loadingStage, isSpeedup = false) {
    const web3Eth = getProviderByChain(props.chainId);
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

    nonce = (nonce || nonce === 0) ? nonce : await web3Eth.getTransactionCount(props.accountAddress, 'latest');
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
        gasPrice: web3Utils.toWei(gasPrice, 'gwei'),
        gas: gasLimit,
        chainId: props.chainId,
    };
    console.log('send', txParams);
    const { rawTransaction, transactionHash } = await web3Eth.accounts.signTransaction(txParams, props.privateKey);

    // @TODO maybe wait sendSignedTransaction().on('transactionHash') to ensure additional checks (e.g. tx underpriced) but then error will not be written to step.tx (no hash to find tx to write) and waitPendingStep will hang
    console.log(transactionHash);
    const txHash = transactionHash;
    addStepData(loadingStage, {
        tx: {
            hash: txHash,
            timestamp: (new Date()).toISOString(),
            params: {to, value, data, nonce, gasPrice, gasLimit, chainId: props.chainId},
        },
    });

    // @TODO return tx from `steps` so it will have full data, instead of just receipt
    return web3Eth.sendSignedTransaction(rawTransaction)
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
    const web3Eth = getProviderByChain(props.chainId);
    const txParams = {
        from: props.accountAddress,
        to,
        value: value ? toErcDecimals(value) : "0x00",
        data,
    };

    return web3Eth.estimateGas(txParams)
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
            const txList = step?.txList || (step?.tx ? [step.tx] : []);
            // reject
            const erroredTxList = txList.filter((item) => item.error);
            if (txList.length && erroredTxList.length === txList.length) {
                const sortedTxList = txList.length > 1
                    ? txList.slice().sort((a, b) => b.gasPrice - a.gasPrice)
                    : txList;
                reject(sortedTxList[0].error);
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
    if (newTx?.hash || newTx?.transactionHash) {
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
    console.log('addStepData result', {loadingStage, needSaveRecovery}, {...state.steps[loadingStage], ...txData, ...otherData});
    if (needSaveRecovery) {
        let stepsToSave = JSON.parse(JSON.stringify(state.steps));
        // remove errored tx from recovery, so they will not cause subscribe for them on repeat
        Object.values(stepsToSave).forEach((step) => {
            if (step.tx?.error) {
                delete step.tx;
            }
            if (step.txList?.length > 0) {
                step.txList = step.txList.filter((tx) => !tx.error);
            }
        });
        window.localStorage.setItem('hub-buy-recovery', JSON.stringify({
            steps: stepsToSave,
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
        sendMinterTx,
        sendEthTx,
        estimateTxGas,
        waitPendingStep,
        addStepData,
    };
}
