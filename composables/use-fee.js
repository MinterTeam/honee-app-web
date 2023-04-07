import { ref, reactive, computed, watch, set } from 'vue';
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
 * @typedef {object} FeeItemData
 * @property {Coin} priceCoin
 * @property {boolean} isBaseCoin
 * @property {boolean} isBaseCoinEnough
 * @property {number|string} priceCoinValue
 * @property {number|string} baseCoinValue
 * @property {number|string} value
 * @property {string|number} coin
 * @property {string|number} coinSymbol
 * @property {boolean} isHighFee
 */
/**
 * @typedef {FeeItemData} FeeData
 * @property {Array<FeeItemData|null>} resultList
 * @property {string} error
 * @property {boolean} isLoading
 */

/**
 * @return {{fee: ComputedRef<FeeData>, feeProps: feeProps, setFeeProps: setProps, refineByIndex: (index: number) => Promise<FeeItemData>}}
 */
export default function useFee(/*{txParams, baseCoinAmount = 0, fallbackToCoinToSpend, isOffline}*/) {
    const idPrimary = Math.random().toString();
    const idSecondary = Math.random().toString();
    const feeProps = reactive({
        /** @type {TxParams} */
        txParams: {},
        /** @type {Array<TxParams>} */
        txParamsList: [],
        //@TODO invalid behavior with TxSequence with different privateKey
        baseCoinAmount: 0,
        /** @type {boolean} - by default fallback to baseCoin, additionally it can try to fallback to coinToSpend, if baseCoin is not enough */
        fallbackToCoinToSpend: false,
        isOffline: false,
        isLocked: false,
        //@TODO throttle is used but we should use exact estimation only before confirmation
        precision: FEE_PRECISION_SETTING.PRECISE,
    });

    /**
     * @param {Partial<feeProps>} newProps
     */
    function setProps(newProps) {
        Object.assign(feeProps, newProps);
    }


    /** @type {Ref<UnwrapRef<Record<number, string>>>}*/
    const coinMap = ref({});
    const state = reactive({
        resultListSource: [],
        /** @type {string|number} */
        priceCoinCommission: 0,
        /** @type {string|number} */
        baseCoinCommission: 0,
        isBaseCoinEnough: true,
        /** @type {string|number} */
        gasCoin: BASE_COIN,
        /** @type {string|number} */
        commission: '',
        feeError: '',
        /** @type CommissionPriceData|null */
        commissionPriceData: null,
        isLoading: false,
    });

    /**
     * @param {FeeEstimationWithFallback} item
     * @return {FeeItemData}
     */
    function mapFeeFields(item) {
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

        return Object.freeze({
            priceCoinValue: item.priceCoinCommission,
            priceCoin: state.commissionPriceData?.coin || {},
            baseCoinValue: item.baseCoinCommission,
            isBaseCoin: isBaseCoin(item.gasCoin),
            isBaseCoinEnough: item.isBaseCoinEnough,
            value: item.commission,
            coin: item.gasCoin,
            coinSymbol: getGasCoinSymbol(item.gasCoin),
            isHighFee: getIsHighFee(item.priceCoinCommission),
        });
    }

    const fee = computed(() => {
        return {
            resultList: state.resultListSource.map((item) => item ? mapFeeFields(item) : item),
            ...mapFeeFields(state),
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
        if (feeProps.isLocked) {
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
                const precision = index > 0 ? FEE_PRECISION_SETTING.IMPRECISE : feeProps.precision;

                const estimatePromise = txParams?.type
                    ? estimateFeeWithFallback(txParams, feeProps.fallbackToCoinToSpend, feeProps.baseCoinAmount, precision, idPrimary + index, idSecondary + index)
                    : Promise.resolve(null);
                return ensurePropsNotChanged(estimatePromise);
            });
            // some result item may be null if sequence item is skipped
            state.resultListSource = await Promise.all(promiseList);
            const resultList = state.resultListSource.filter((item) => !!item);
            if (resultList.length === 0) {
                state.isLoading = false;
                return;
            }
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
            handleError(error);
        }
    }

    function handleError(error) {
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

    /**
     * Fetch new fee item in fee.resultList. Useful to update required fee before new tx in sequence
     * @param {number} index
     * @return {Promise<{FeeDataItem}|null>}
     */
    async function refineByIndex(index) {
        const txParams = feeProps.txParamsList?.[index];
        if (!txParams) {
            // resolve with null
            return null;
        }
        if (feeProps.isOffline) {
            return Promise.reject('Can\'t calculate fee when offline');
        }

        // state.isLoading = true;
        // state.feeError = '';

        // eslint-disable-next-line no-useless-catch
        try {
            const feeData = await estimateFeeWithFallback(txParams, feeProps.fallbackToCoinToSpend, feeProps.baseCoinAmount, feeProps.precision, idPrimary + index, idSecondary + index);

            // total fee not updated here yet
            set(state.resultListSource, index, feeData);
            // state.isLoading = false;

            return mapFeeFields(feeData);
        } catch (error) {
            // handleError(error);
            throw error;
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

        setFeeProps: setProps,
        refineByIndex,
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
 * @typedef {MinterFeeEstimation} FeeEstimation
 * @property {string|number} gasCoin
 */

/**
 * @pure
 * @nosideeffects
 * @param {TxParams} txParams
 * @param {FEE_PRECISION_SETTING} precision
 * @param {string} idDebounce
 * @return {Promise<FeeEstimation>}
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
 * @typedef {FeeEstimation} FeeEstimationWithFallback
 * @property {boolean} isBaseCoinEnough
 */

/**
 * @pure
 * @nosideeffects
 * @param {TxParams} txParams
 * @param {boolean} fallbackToCoinToSpend
 * @param {number|string} baseCoinAmount
 * @param {FEE_PRECISION_SETTING} precision
 * @param {string} idDebouncePrimary
 * @param {string} idDebounceSecondary
 * @return {Promise<FeeEstimationWithFallback>}
 */
async function estimateFeeWithFallback(txParams, fallbackToCoinToSpend, baseCoinAmount, precision, idDebouncePrimary, idDebounceSecondary) {
    // console.debug('estimateFeeWithFallback', JSON.parse(JSON.stringify(txParams)), {fallbackToCoinToSpend, baseCoinAmount, precision});
    const isGasCoinDefined = isCoinDefined(txParams.gasCoin);
    const primaryCoinToCheck = isGasCoinDefined ? txParams.gasCoin : BASE_COIN;
    const secondaryCoinToCheck = getSecondaryCoinToCheck(txParams, fallbackToCoinToSpend);

    const isFallbackMode = !isGasCoinDefined;
    const hasBaseCoinAmount = Number(baseCoinAmount) > 0;
    const skipFallbackToBaseCoin = isFallbackMode && !hasBaseCoinAmount && secondaryCoinToCheck;

    let feeData;
    if (!skipFallbackToBaseCoin) {
        feeData = await estimateFee({...txParams, gasCoin: primaryCoinToCheck}, precision, idDebouncePrimary);
    }

    const isBaseCoinEnough = new Big(baseCoinAmount || 0).gte(feeData?.baseCoinCommission || 0);
    // select between primary fallback and secondary fallback
    // secondaryFeeData may be defined only if primary is fallback base coin
    const isSecondaryFallbackBetter = isFallbackMode && !isBaseCoinEnough && secondaryCoinToCheck && secondaryCoinToCheck !== primaryCoinToCheck;
    const isSecondarySelected = skipFallbackToBaseCoin || isSecondaryFallbackBetter;

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
 * @param {TX_TYPE} txType
 * @param {TxData} txData
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
