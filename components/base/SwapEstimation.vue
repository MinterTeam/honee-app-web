<script>
import {getCurrentInstance, defineComponent} from 'vue';
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required.js';
import minLength from 'vuelidate/src/validators/minLength.js';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import useEstimateSwap from '~/composables/use-estimate-swap.js';
import Big from 'minterjs-util/src/big.js';
import {pretty, decreasePrecisionSignificant} from '~/assets/utils.js';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';

//@TODO refactor HubBuyForm
export default defineComponent({
    mixins: [validationMixin],
    emits: [
        'update:v$estimation',
        'update:estimation',
        'update:tx-data',
        'update:fetch-state',
    ],
    props: {
        coinToSell: {
            type: String,
            required: true,
        },
        coinToBuy: {
            type: String,
            required: true,
        },
        valueToSell: {
            type: [Number, String],
        },
        valueToBuy: {
            type: [Number, String],
        },
        fee: {
            type: Object,
            default: null,
        },
        maxAmountToSpend: {
            type: [Number, String],
            default: undefined,
        },
        // user pressed 'Use max' button
        isUseMax: {
            type: Boolean,
            default: false,
        },
        forceSellAll: {
            type: Boolean,
            default: false,
        },
        // hide coinToSell, coinToBuy, valueToSell, valueToBuy errors
        hidePropsValidationError: {
            type: Boolean,
            default: false,
        },
        idPreventConcurrency: {
            type: String,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy;
        const {
            estimation,
            isEstimationTypePool,
            estimationTxDataPartial,
            estimationError,
            isEstimationWaiting,
            handleInputBlur,
            estimateSwap,
        } = useEstimateSwap({
            vm,
            idPreventConcurrency: props.idPreventConcurrency,
        });

        return {
            // fee,
            // feeProps,

            estimation,
            isEstimationTypePool,
            estimationTxDataPartial,
            estimationError,
            isEstimationWaiting,
            handleInputBlur,
            estimateSwap,
        };
    },
    validations() {
        return {
            coinToSell: {
                required,
                minLength: minLength(3),
            },
            coinToBuy: {
                required,
                minLength: minLength(3),
                // maxLength: maxLength(10),
            },
            valueToSell: {
                required: this.isTypeSell ? required : () => true,
                validAmount: (value) => this.isTypeSell ? value > 0 : true,
            },
            valueToBuy: {
                required: !this.isTypeSell ? required : () => true,
                validAmount: (value) => !this.isTypeSell ? value > 0 : true,
            },
            propsGroup: ['coinToSell', 'coinToBuy', 'valueToSell', 'valueToBuy'],

            // maxAmount and maxAmountAfterFee extracted from valueToSell validation to make propsGroup validate only user input
            maxAmount: {
                valid: (value) => this.isTypeSell ? new Big(this.valueToSell || 0).lte(value) : true,
            },
            maxAmountAfterFee: {
                valid: (value) => this.isTypeSell ? new Big(this.valueToSell || 0).lte(value) : true,
            },
            minimumValueToBuy: {
                required: (value) => this.isTypeSell ? value >= 0 : true,
                maxValue: (value) => this.isTypeSell ? Number(value) <= Number(this.estimation) : true,
            },
            maximumValueToSell: {
                required: (value) => !this.isTypeSell ? value >= 0 : true,
                minValue: (value) => !this.isTypeSell ? Number(value) >= Number(this.estimation) : true,
            },
            limitValueGroup: ['minimumValueToBuy', 'maximumValueToSell'],

            isEstimationWaiting: {
                finished: (value) => !value,
            },
            estimationError: {
                absent: (value) => !value,
            },
        };
    },
    computed: {
        // typeBuy if valueToBuy specified
        isTypeBuy() {
            return !!this.valueToBuy;
        },
        // otherwise typeSell (by default)
        isTypeSell() {
            return !this.isTypeBuy;
        },
        isSellAll() {
            if (!this.isTypeSell) {
                return false;
            }
            if (this.forceSellAll) {
                return true;
            }
            // not use max
            if (!this.isUseMax) {
                return false;
            }
            // use max
            // selling base coin (no matter if it is not enough to pay fee)
            if (this.coinToSell === this.$store.getters.BASE_COIN) {
                return true;
            }
            // selling custom coin
            // base coin is not enough try use selected coin to pay fee
            if (!this.fee?.isBaseCoinEnough) {
                return true;
            } else {
                return false;
            }
        },
        txData() {
            return {
                // `coins` or `coinToSell` + `coinToBuy`
                ...this.estimationTxDataPartial,
                // sell
                valueToSell: this.valueToSell,
                minimumValueToBuy: this.minimumValueToBuy,
                // buy
                valueToBuy: this.valueToBuy,
                maximumValueToSell: this.maximumValueToSell,
            };
        },
        minimumValueToBuy() {
            if (!this.isTypeSell) {
                return 1e18;
            }
            let slippage = 1 - 5 / 100; // 5%
            slippage = Math.max(slippage, 0);
            return decreasePrecisionSignificant(this.estimation * slippage);
        },
        maximumValueToSell() {
            if (this.isTypeSell) {
                return 0;
            }
            let slippage = 1 + 5 / 100; // 5%
            return decreasePrecisionSignificant(this.estimation * slippage);
        },
        maxAmount() {
            return this.maxAmountToSpend || this.$store.getters.getBalanceAmount(this.coinToSell);
        },
        maxAmountAfterFee() {
            if (this.isSellAll) {
                return this.maxAmount;
            }
            const selectedCoin = this.$store.getters.getBalanceItem(this.coinToSell);
            // coin not selected
            if (!selectedCoin) {
                return 0;
            }
            return getAvailableSelectedBalance(selectedCoin, this.fee);
        },
        isEstimationErrorHidden() {
            // estimation is not ready until swap props are valid
            return this.isEstimationWaiting || this.$v.propsGroup.$invalid;
        },
        /** @type {SwapEstimationFetchState} */
        fetchState() {
            return {
                /** @type {SwapEstimationFetchState['loading']} */
                loading: this.isEstimationWaiting,
                /** @type {SwapEstimationFetchState['error']} */
                error: this.estimationError,
            };
        },
    },
    watch: {
        coinToSell: function(newVal, oldVal) {
            this.watchForm();
        },
        coinToBuy: function(newVal, oldVal) {
            this.watchForm();
        },
        valueToSell: function(newVal, oldVal) {
            // wait computed to recalculate
            setTimeout(() => {
                if (this.isTypeSell) {
                    this.watchForm();
                }
            }, 0);
        },
        valueToBuy: function(newVal, oldVal) {
            // wait computed to recalculate
            setTimeout(() => {
                if (this.isTypeBuy) {
                    this.watchForm();
                }
            }, 0);
        },
        $v: {
            handler(newVal) {
                this.$emit('update:v$estimation', newVal);
            },
            immediate: true,
        },
        estimation: {
            handler(newVal) {
                this.$emit('update:estimation', newVal);
            },
        },
        txData: {
            handler(newVal) {
                this.$emit('update:tx-data', newVal);
            },
        },
        fetchState: {
            handler(newVal) {
                this.$emit('update:fetch-state', newVal);
            },
            immediate: true,
        },
    },
    methods: {
        pretty,
        watchForm() {
            if (this.$v.propsGroup.$invalid) {
                return;
            }
            this.getEstimation();
        },
        getEstimation(force, throwOnError, overrideParams = {}) {
            if (this.$v.propsGroup.$invalid) {
                return Promise.reject(new Error('get swap estimation: Invalid props passed'));
            }

            return this.estimateSwap({
                coinToSell: this.coinToSell,
                valueToSell: this.valueToSell,
                coinToBuy: this.coinToBuy,
                valueToBuy: this.valueToBuy,
                isSelling: this.isTypeSell,
                sellAll: this.isSellAll,
                force,
                throwOnError,
                ...overrideParams,
            });
        },
        getTxType() {
            return getTxType({isSelling: this.isTypeSell, isPool: this.isEstimationTypePool, isSellAll: this.isSellAll});
        },
    },
});

/**
 * @param {object} options
 * @param {boolean} options.isSelling
 * @param {boolean} options.isPool
 * @param {boolean} [options.isSellAll]
 * @return {TX_TYPE}
 */
export function getTxType({isPool, isSelling, isSellAll}) {
    // buy
    const isBuy = !isSelling;
    if (isBuy && isPool) {
        return TX_TYPE.BUY_SWAP_POOL;
    }
    if (isBuy && !isPool) {
        return TX_TYPE.BUY;
    }
    // sell
    const isSell = !isSellAll;
    if (isSell && isPool) {
        return TX_TYPE.SELL_SWAP_POOL;
    }
    if (isSell && !isPool) {
        return TX_TYPE.SELL;
    }
    // sell all
    if (isPool) {
        return TX_TYPE.SELL_ALL_SWAP_POOL;
    }
    return TX_TYPE.SELL_ALL;
}

/**
 * @typedef {object} SwapEstimationFetchState
 * @property {boolean} loading
 * @property {string} error
 */
</script>

<template>
    <div
        class="form__error u-hidden-empty"
        v-show="
            ($v.propsGroup.$error && !hidePropsValidationError)
            || (($v.limitValueGroup.$error || estimationError) && !isEstimationErrorHidden)
            || $v.maxAmount.$error || $v.maxAmountAfterFee.$error
        "
    >
        <template v-if="!hidePropsValidationError">
            <template v-if="$v.coinToSell.$error">{{ $td('Invalid coin to sell', 'form.swap-coin-sell-error-invalid') }}</template>
            <template v-else-if="$v.coinToBuy.$error">{{ $td('Invalid coin to buy', 'form.swap-coin-buy-error-invalid') }}</template>
            <template v-else-if="isTypeSell">
                <template v-if="$v.valueToSell.$dirty && !$v.valueToSell.required">{{ $td('Enter amount', 'form.amount-error-required') }}</template>
                <template v-else-if="$v.valueToSell.$dirty && !$v.valueToSell.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</template>
                <template v-else-if="$v.valueToSell.$dirty && $v.maxAmount.$invalid">{{ $td('Not enough coins', 'form.not-enough-coins') }}</template>
                <template v-else-if="$v.valueToSell.$dirty && $v.maxAmountAfterFee.$invalid">{{ $td('Not enough to pay transaction fee', 'form.fee-error-insufficient') }}: {{ pretty(fee.value) }} {{ fee.coinSymbol }}</template>
            </template>
            <template v-else-if="isTypeBuy">
                <template v-if="$v.valueToBuy.$dirty && !$v.valueToBuy.required">{{ $td('Enter amount', 'form.amount-error-required') }}</template>
                <template v-else-if="$v.valueToBuy.$dirty && !$v.valueToBuy.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</template>
            </template>
        </template>


        <template v-if="!isEstimationErrorHidden">
            <template v-if="estimationError">
                {{ estimationError }}
            </template>
            <template v-else-if="($v.minimumValueToBuy.$dirty && !$v.minimumValueToBuy.required) || ($v.maximumValueToSell.$dirty && !$v.maximumValueToSell.required)">
                {{ $td('Estimation error', 'form.estimation-error') }}: {{ $td('Can’t calculate swap limits', 'form.estimation-error-limit-required') }}
            </template>
            <template v-else-if="($v.minimumValueToBuy.$dirty && !$v.minimumValueToBuy.maxValue) || ($v.maximumValueToSell.$dirty && !$v.maximumValueToSell.minValue)">
                {{ $td('Estimation error', 'form.estimation-error') }}: {{ $td('Invalid swap limit', 'form.estimation-error-limit-invalid') }}
            </template>
        </template>
    </div>
</template>
