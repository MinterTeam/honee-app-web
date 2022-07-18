import { ref, reactive, computed, watch } from '@vue/composition-api';
import Big from '~/assets/big.js';
import {FeePrice} from 'minterjs-util/src/fee.js';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import decorateTxParams from 'minter-js-sdk/src/tx-decorator/index.js';
import getTxData from 'minter-js-sdk/src/tx-data/index.js';
import {FEE_PRECISION_SETTING} from 'minter-js-sdk/src/api/estimate-tx-commission.js';
import {isCoinId} from 'minter-js-sdk/src/utils.js';
import {BASE_COIN, CHAIN_ID} from '~/assets/variables.js';
import {estimateTxCommission, replaceCoinSymbol} from '~/api/gate.js';
import {getCoinList} from '~/api/explorer.js';
import {getErrorText} from '~/assets/server-error.js';
import CancelError from '~/assets/utils/error-cancel.js';


/**
 * @typedef {Object} FeeData
 * @property {Array<FeeData>} resultList
 * @property {Coin} priceCoin
 * @property {boolean} isBaseCoin
 * @property {boolean} isBaseCoinEnough
 * @property {number|string} priceCoinValue
 * @property {number|string} baseCoinValue
 * @property {number|string} value
 * @property {string|number} coin
 * @property {string|number} coinSymbol
 * @property {string} error
 * @property {boolean} isHighFee
 * @property {boolean} isLoading
 */

/**
 * @return {{fee: ComputedRef<FeeData>, feeProps: feeProps}}
 */

export default function useFee(/*{txParams, baseCoinAmount = 0, fallbackToCoinToSpend, isOffline}*/) {
    const idPrimary = Math.random().toString();
    const idSecondary = Math.random().toString();
    const feeProps = reactive({
        /** @type {TxParams} */
        txParams: {},
        /** @type {Array<TxParams>} */
        txParamsList: [],
        baseCoinAmount: 0,
        /** @type {Boolean} - by default fallback to baseCoin, additionally it can try to fallback to coinToSpend, if baseCoin is not enough */
        fallbackToCoinToSpend: false,
        isOffline: false,
        //@TODO throttle is used but we should use exact estimation only before confirmation
        precision: FEE_PRECISION_SETTING.PRECISE,
    });
    /** @type {Object.<number, string>}*/
    const coinMap = ref({});
    const state = reactive({
        resultList: [],
        priceCoinCommission: 0,
        baseCoinCommission: 0,
        isBaseCoinEnough: true,
        gasCoin: BASE_COIN,
        commission: '',
        feeError: '',
        /** @type CommissionPriceData|null */
        commissionPriceData: null,
        isLoading: false,
    });

    const fee = computed(() => {
        const sendFee = (() => {
            if (!state.commissionPriceData) {
                return false;
            }
            const feePrice = new FeePrice(state.commissionPriceData);

            return feePrice.getFeeValue(TX_TYPE.SEND);
        })();
        const getIsHighFee = (priceCoinCommission) => {
            return sendFee && priceCoinCommission / sendFee >= 10000;
        };
        const getGasCoinSymbol = (gasCoin) => {
            if (isCoinId(gasCoin)) {
                return coinMap.value[gasCoin];
            } else {
                return gasCoin;
            }
        };

        return {
            resultList: state.resultList.map((item) => ({
                priceCoinValue: item.priceCoinCommission,
                priceCoin: state.commissionPriceData?.coin || {},
                baseCoinValue: item.baseCoinCommission,
                isBaseCoin: isBaseCoin(item.gasCoin),
                isBaseCoinEnough: item.isBaseCoinEnough,
                value: item.commission,
                coin: item.gasCoin,
                coinSymbol: getGasCoinSymbol(item.gasCoin),
                isHighFee: getIsHighFee(item.priceCoinCommission),
            })),
            priceCoinValue: state.priceCoinCommission,
            priceCoin: state.commissionPriceData?.coin || {},
            baseCoinValue: state.baseCoinCommission,
            isBaseCoin: isBaseCoin(state.gasCoin),
            isBaseCoinEnough: state.isBaseCoinEnough,
            value: state.commission,
            coin: state.gasCoin,
            coinSymbol: getGasCoinSymbol(state.gasCoin),
            isHighFee: getIsHighFee(state.priceCoinCommission),
            error: state.feeError,
            isLoading: state.isLoading,
        };
    });

    // watching feeProps directly leads to strange behavior (newVal and oldVal are always same)
    watch(() => JSON.stringify(feeProps), handleChangedProps, {deep: true/*, immediate: true*/});
    watch(() => feeProps.isOffline, () => {
        if (feeProps.isOffline || coinMap.value[0]) {
            return;
        }
        getCoinList({skipMeta: true})
            .then((coinList) => {
                let result = {};
                coinList.forEach((coinInfo) => {
                    result[coinInfo.id] = coinInfo.symbol;
                });
                coinMap.value = Object.freeze(result);
            });
    }, {deep: true, immediate: true});

    // --- methods
    async function handleChangedProps(newVal, oldVal) {
        // sometimes watcher fires on same value
        if (newVal === oldVal) {
            return;
        }
        if (feeProps.isOffline) {
            state.gasCoin = 0;
            return;
        }

        state.isLoading = true;
        state.feeError = '';

        try {
            const txParamsList = feeProps.txParamsList?.length ? feeProps.txParamsList : [feeProps.txParams];
            const promiseList = txParamsList.map((txParams,  index) => {
                const precision = index > 1 ? FEE_PRECISION_SETTING.IMPRECISE : feeProps.precision;

                const estimatePromise = estimateFeeWithFallback(txParams, feeProps.fallbackToCoinToSpend, feeProps.baseCoinAmount, precision, idPrimary + index, idSecondary + index);
                return ensurePropsNotChanged(estimatePromise);
            });
            const resultList = await Promise.all(promiseList);
            state.resultList = resultList;
            state.priceCoinCommission = sumBy(resultList, 'priceCoinCommission');
            state.baseCoinCommission = sumBy(resultList, 'baseCoinCommission');
            const isBaseCoinNotEnough = resultList.some(({isBaseCoinEnough}) => !isBaseCoinEnough);
            state.isBaseCoinEnough = !isBaseCoinNotEnough;
            const isDifferentGasCoins = resultList.some(({gasCoin}) => gasCoin !== resultList[0].gasCoin);
            state.gasCoin = isDifferentGasCoins ? '' : resultList[0].gasCoin;
            state.commission = isDifferentGasCoins ? '' : sumBy(resultList, 'commission');
            state.commissionPriceData = resultList[0].commissionPriceData;
/*
            const estimatePromise = estimateFeeWithFallback(feeProps.txParams, feeProps.fallbackToCoinToSpend, feeProps.baseCoinAmount, feeProps.precision, idPrimary, idSecondary);
            const {feeData, isBaseCoinEnough} = await ensurePropsNotChanged(estimatePromise);

            state.priceCoinCommission = feeData.priceCoinCommission;
            state.baseCoinCommission = feeData.baseCoinCommission;
            state.isBaseCoinEnough = isBaseCoinEnough;
            state.gasCoin = feeData.gasCoin;
            state.commission = feeData.commission;
            state.commissionPriceData = feeData.commissionPriceData;
 */
            // feeError must be cleaned after promise because several promises can be processed parallel and some may fail
            state.feeError = '';
            state.isLoading = false;
        } catch (error) {
            if (error.isCanceled) {
                return;
            }
            state.feeError = getErrorText(error);
            if (state.feeError.toLowerCase() === 'not possible to exchange') {
                state.feeError += ' to pay fee';
            }
            state.isLoading = false;
            console.debug(error);
        }
    }

    /**
     * @template T
     * @param {Promise<T>} promise
     * @return {Promise<T>}
     */
    function ensurePropsNotChanged(promise) {
        // save current coins to check if it will be actual after resolution
        const savedPropsString = JSON.stringify(feeProps);

        return promise
            .then((result) => {
                if (savedPropsString !== JSON.stringify(feeProps)) {
                    return Promise.reject(new CancelError());
                }

                return result;
            });
    }

    return {
        feeProps,
        fee,
    };
}

/**
 * Primary it will check explicitly defined gasCoin or base coin
 * @pure
 * @nosideeffects
 * @param {TxParams} txParams
 * @return {string}
 */
function getPrimaryCoinToCheck(txParams) {
    if (isCoinDefined(txParams.gasCoin)) {
        return txParams.gasCoin;
    }

    return BASE_COIN;
}

/**
 * Secondary it will try to check coinToSpend and use if primary coin is not enough to pay fee
 * @pure
 * @nosideeffects
 * @param {TxParams} txParams
 * @param {boolean} fallbackToCoinToSpend
 * @return {string}
 */
function getSecondaryCoinToCheck(txParams, fallbackToCoinToSpend) {
    // 1. only check if fallback flag activated
    // 2. if gasCoin is defined - no need to guess
    if (!fallbackToCoinToSpend || isCoinDefined(txParams.gasCoin)) {
        return '';
    }

    try {
        const txParamsClone = cloneObject(txParams);
        const {gasCoin} = decorateTxParams(txParamsClone, {setGasCoinAsCoinToSpend: true});
        if (typeof gasCoin !== 'undefined' && !isBaseCoin(gasCoin)) {
            return gasCoin;
        }
    } catch (e) {

    }
    return '';
}

/**
 * @pure
 * @nosideeffects
 * @param {TxParams} txParams
 * @param {FEE_PRECISION_SETTING} precision
 * @param {string} idDebounce
 * @return {Promise<MinterFeeEstimation&{gasCoin: string|number}>}
 */
async function estimateFee(txParams, precision, idDebounce) {
    // clone is needed because clean doesn't handle arrays
    const cleanTxParams = await replaceCoinSymbol(cloneObject(cleanObject(txParams)));
    let needGasCoinFee;
    if (precision === FEE_PRECISION_SETTING.AUTO) {
        needGasCoinFee = isValidTxData(cleanTxParams.type, cleanTxParams.data) ? FEE_PRECISION_SETTING.PRECISE : FEE_PRECISION_SETTING.IMPRECISE;
    } else {
        needGasCoinFee = precision;
    }

    return estimateTxCommission({
        ...cleanTxParams,
        chainId: CHAIN_ID,
    }, {
        needGasCoinFee,
        needBaseCoinFee: FEE_PRECISION_SETTING.IMPRECISE,
        needPriceCoinFee: FEE_PRECISION_SETTING.PRECISE,
    }, {idDebounce})
        .then((result) => {
            return {...result, gasCoin: txParams.gasCoin};
        });
}

/**
 * @pure
 * @nosideeffects
 * @param {TxParams} txParams
 * @param {boolean} fallbackToCoinToSpend
 * @param {number|string} baseCoinAmount
 * @param {FEE_PRECISION_SETTING} precision
 * @param {string} idDebouncePrimary
 * @param {string} idDebounceSecondary
 * @return {Promise<{isBaseCoinEnough: boolean}&MinterFeeEstimation&{gasCoin: string|number}>}
 */
async function estimateFeeWithFallback(txParams, fallbackToCoinToSpend, baseCoinAmount, precision, idDebouncePrimary, idDebounceSecondary) {
    const primaryCoinToCheck = getPrimaryCoinToCheck(txParams);
    const secondaryCoinToCheck = getSecondaryCoinToCheck(txParams, fallbackToCoinToSpend);

    let feeData = await estimateFee({...txParams, gasCoin: primaryCoinToCheck}, precision, idDebouncePrimary);

    const isBaseCoinEnough = new Big(baseCoinAmount || 0).gte(feeData.baseCoinCommission || 0);
    // select between primary fallback and secondary fallback
    // secondaryFeeData may be defined only if primary is fallback base coin
    const isSecondarySelected = !isBaseCoinEnough && secondaryCoinToCheck && secondaryCoinToCheck !== primaryCoinToCheck;

    if (isSecondarySelected) {
        feeData = await estimateFee({...txParams, gasCoin: secondaryCoinToCheck}, precision, idDebounceSecondary)
            .catch((error) => {
                if (error.isCanceled) {
                    throw error;
                } else {
                    // restore primaryCoinToCheck
                    return feeData;
                }
            });
    }

    return {
        ...feeData,
        isBaseCoinEnough,
    };
}

/**
 * @pure
 * @nosideeffects
 * @param {string|number} coinIdOrSymbol
 * @return {boolean}
 */
function isCoinDefined(coinIdOrSymbol) {
    return !!coinIdOrSymbol || coinIdOrSymbol === 0;
}
/**
 * @pure
 * @nosideeffects
 * @param {string|number} coinIdOrSymbol
 * @return {boolean}
 */
function isBaseCoin(coinIdOrSymbol) {
    return coinIdOrSymbol === BASE_COIN || coinIdOrSymbol === 0 || coinIdOrSymbol === '0';
}

/**
 * @pure
 * @nosideeffects
 * @param txType
 * @param txData
 * @return {boolean}
 */
function isValidTxData(txType, txData) {
    try {
        const TxDataConstructor = getTxData(txType);
        new TxDataConstructor(txData);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * @pure
 * @nosideeffects
 * @param {object} txParams
 * @return {object}
 */
function cleanObject(txParams) {
    let clean = {};
    for (const key in txParams) {
        if (isEmpty(txParams[key])) {
            clean[key] = undefined;
        } else if (isObject(txParams[key])) {
            clean[key] = cleanObject(txParams[key]);
        } else {
            clean[key] = txParams[key];
        }
    }

    return clean;

    function isEmpty(value) {
        return value === '' || value === null;
    }

    function isObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }
}

/**
 * @pure
 * @nosideeffects
 * @template {object} T
 * @param {T} obj
 * @return {T}
 */
function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * @param {Array<object>} arr
 * @param {string} key
 * @return {number|string}
 */
function sumBy(arr, key) {
    return arr
        .reduce((accumulator, item) => {
            return accumulator.plus(item[key]);
        }, new Big(0))
        .toString();
}
