import {reactive, computed, set} from '@vue/composition-api';
import merge from 'lodash-es/merge';
import {getProviderByChain, web3Utils, subscribeTransaction, toErcDecimals} from '~/api/web3.js';
import {postTx} from '~/api/gate.js';
import {HUB_BUY_STAGE as LOADING_STAGE} from '~/assets/variables.js';
import {ensurePromise} from '~/assets/utils.js';


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
    /** @type {Object.<LOADING_STAGE, SequenceStepItem>}*/
    steps: {},
});

/**
 * last finished
 * @type {ComputedRef<LOADING_STAGE>}
 */
const lastFinishedStage = computed(() => {
    const step = Object.values(state.steps).reverse()
        .find((step) => step.finished);
    return step?.loadingStage;
});
/**
 * @type {ComputedRef<SequenceStepItem>}
 */
const lastFinishesStep = computed(() => {
    return state.steps[lastFinishedStage.value];
});
/**
 * first unfinished or last finished
 * @type {ComputedRef<LOADING_STAGE>}
 */
const currentLoadingStage = computed(() => {
    const step = Object.values(state.steps)
        .find((step) => !step.finished);
    return step ? step.loadingStage : lastFinishedStage.value;
});
/**
 * @type {ComputedRef<SequenceStepItem>}
 */
const currentStep = computed(() => {
    return state.steps[currentLoadingStage.value];
});

/**
 * @typedef {object} SequenceStepItem
 * @property {SequenceStepTx} [tx]
 * @property {Array<SequenceStepTx>} [txList]
 * @property {boolean} [finished]
 * @property {LOADING_STAGE} loadingStage
 * @property {number} index
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
 * @param {ByteArray} [privateKey]
 * @return {Promise<PostTxResponse>}
 */
function sendMinterTx(txParams, privateKey = props.privateKey) {
    return postTx(txParams, {privateKey})
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

    let signedTx;
    try {
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
        signedTx = await web3Eth.accounts.signTransaction(txParams, props.privateKey);

        // @TODO maybe wait sendSignedTransaction().on('transactionHash') to ensure additional checks (e.g. tx underpriced) but then error will not be written to step.tx (no hash to find tx to write) and waitPendingStep will hang

        console.log(signedTx.transactionHash);
        addStepData(loadingStage, {
            tx: {
                hash: signedTx.transactionHash,
                timestamp: (new Date()).toISOString(),
                params: {to, value, data, nonce, gasPrice, gasLimit, chainId: props.chainId},
            },
        });
    } catch (error) {
        addStepData(loadingStage, {
            error,
        });
        return Promise.reject(error);
    }

    // @TODO return tx from `steps` so it will have full data, instead of just receipt
    return web3Eth.sendSignedTransaction(signedTx.rawTransaction)
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
            addStepData(loadingStage, {tx: {hash: signedTx.transactionHash, error}});
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

/**
 * @typedef {object} SendSequenceItem
 * @property {TxParams} txParams
 * @property {function: Promise} [prepare]
 * @property {function: Promise} [finalize]
 *
 * @param {Array<SendSequenceItem>} list
 * @return {Promise}
 */
async function sendTxSequence(list) {
    let result;
    for (const {txParams, prepare, finalize} of list) {
        const txParamsAddition = await ensurePromise(prepare, result);
        const preparedTxParams = merge({}, txParams, txParamsAddition);
        let result = await sendMinterTx(preparedTxParams);
        result = await ensurePromise(finalize, result);
    }

    return result;
}

function waitPendingStep(loadingStage) {
    if (!state.steps[loadingStage]) {
        return Promise.reject();
    }
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const step = state.steps[loadingStage];
            // reject before tx
            if (step.error) {
                reject(step.error);
                clearInterval(interval);
                return;
            }
            const txList = step?.txList || (step?.tx ? [step.tx] : []);
            // reject on tx error
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

/**
 * @param {LOADING_STAGE} loadingStage
 * @param {object} [data]
 * @param {boolean} [finishPrev] - mark all previous steps as finished
 */
function addStepData(loadingStage, data, finishPrev) {
    if (finishPrev) {
        for (const step of Object.values(state.steps)) {
            if (step.loadingStage !== loadingStage && !step.finished) {
                set(state.steps, loadingStage, Object.freeze({
                    ...step,
                    finished: true,
                }));
            } else {
                break;
            }
        }
    }
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
    set(state.steps, loadingStage, Object.freeze({
        ...state.steps[loadingStage],
        ...txData,
        ...otherData,
        loadingStage,
        // init index if no step found
        ...(state.steps[loadingStage] ? {index: Object.keys(state.steps).length} : undefined),
    }));
    const needSaveRecovery = loadingStage !== LOADING_STAGE.FINISH;
    console.log('addStepData result', {needSaveRecovery}, state.steps[loadingStage]);
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
        lastFinishedStage,
        lastFinishesStep,
        currentLoadingStage,
        currentStep,
        setTxServiceProps: setProps,
        sendMinterTx,
        sendEthTx,
        estimateTxGas,
        waitPendingStep,
        addStepData,
    };
}
