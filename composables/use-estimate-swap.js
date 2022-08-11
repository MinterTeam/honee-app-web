import {reactive, computed, toRefs} from '@vue/composition-api';
import {ESTIMATE_SWAP_TYPE} from 'minter-js-sdk/src/variables.js';
import {estimateCoinBuy, estimateCoinSell} from '~/api/gate.js';
import debounce from '~/assets/debounce-promise.js';
import {getErrorText} from '~/assets/server-error.js';
import {decreasePrecisionSignificant} from '~/assets/utils.js';


export default function useEstimateSwap({idPreventConcurrency, $td} = {}) {
    $td = typeof $td === 'function' ? $td : (val) => val;

    const state = reactive({
        estimation: null,
        estimationType: null,
        isEstimationTypePool: false,
        isEstimationTypeBancor: false,
        estimationRoute: null,
        estimationTxDataCoinsRoute: [],
        estimationTxDataPartial: {},
        isEstimationLoading: false,
        estimationError: '',
        isEstimationPending: false,
    });

    const isEstimationWaiting = computed(() => {
        return state.isEstimationPending || state.isEstimationLoading;
    });

    /**
     * @typedef {object} EstimateSwapOptions
     * @property {string} coinToSell
     * @property {number|string} [valueToSell]
     * @property {string} coinToBuy
     * @property {number|string} [valueToBuy]
     * @property {boolean} [isSelling = true]
     * @property {boolean} [throwOnError = false]
     *
     * @param {EstimateSwapOptions} options
     * @return {Promise}
     */
    function getEstimation({coinToSell, valueToSell, coinToBuy, valueToBuy, isSelling = true, throwOnError = false, ...otherArgs}) {
        state.isEstimationPending = false;
        state.isEstimationLoading = true;
        state.estimationError = '';

        let estimatePromise;
        if (isSelling) {
            estimatePromise = estimateCoinSell({
                coinToSell,
                valueToSell,
                coinToBuy,
                findRoute: true,
                // gasCoin: this.fee.coin || 0,
                ...otherArgs,
            }, {
                idPreventConcurrency,
            });
        } else {
            estimatePromise = estimateCoinBuy({
                coinToSell,
                valueToBuy,
                coinToBuy,
                findRoute: true,
                // gasCoin: this.fee.coin || 0,
                ...otherArgs,
            }, {
                idPreventConcurrency,
            });
        }
        return estimatePromise
            .then((result) => {
                if (isSelling) {
                    state.estimation = result.will_get;
                } else {
                    state.estimation = result.will_pay;
                }
                state.estimationType = result.swap_from;
                state.isEstimationTypePool = result.swap_from === ESTIMATE_SWAP_TYPE.POOL;
                state.isEstimationTypeBancor = result.swap_from === ESTIMATE_SWAP_TYPE.BANCOR;
                state.estimationRoute = result.route;
                state.estimationTxDataCoinsRoute = result.route
                    ? result.route.map((coin) => coin.id)
                    : [coinToSell, coinToBuy];
                state.estimationTxDataPartial = state.isEstimationTypePool ? {
                    coins: state.estimationTxDataCoinsRoute,
                } : {
                    coinToSell,
                    coinToBuy,
                };
                state.isEstimationLoading = false;

                return result;
            })
            .catch((error) => {
                if (error.isCanceled) {
                    return;
                }
                state.isEstimationLoading = false;
                state.estimationError = getErrorText(error, $td('Estimation error', 'form.estimation-error') + ': ');
                if (throwOnError) {
                    return Promise.reject(error);
                }
            });
    }

    const debouncedGetEstimation = debounce(getEstimation, 1000);

    function handleInputBlur() {
        // force estimation after blur if estimation was delayed
        if (state.isEstimationPending) { // debouncedGetEstimation.pending()
            debouncedGetEstimation.flush();
        }
    }

    function forceEstimation(options) {
        // force new estimation without delay
        debouncedGetEstimation(options);
        return debouncedGetEstimation.flush();
    }

    /**
     *
     * @param {EstimateSwapOptions&{force?: boolean}} options
     * @return {Promise}
     */
    function estimateSwap(options) {
        if (options.force) {
            return forceEstimation(options);
        } else {
            state.isEstimationPending = true;
            return debouncedGetEstimation(options);
        }
    }

    return {
        ...toRefs(state),
        isEstimationWaiting,
        handleInputBlur,
        estimateSwap,
    };
}
