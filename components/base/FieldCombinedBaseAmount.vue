<script>
import Big from '~/assets/big.js';
import {isCoinId} from 'minter-js-sdk/src/utils.js';
import stripZeros from 'pretty-num/src/strip-zeros.js';
import checkEmpty from '~/assets/v-check-empty';
import {pretty} from '~/assets/utils.js';
import InputMaskedAmount from '~/components/base/InputMaskedAmount.vue';
import Loader from '~/components/base/BaseLoader.vue';

export default {
    components: {
        InputMaskedAmount,
        Loader,
    },
    directives: {
        checkEmpty,
    },
    inheritAttrs: false,
    props: {
        value: {
            type: [String, Number],
            required: true,
        },
        $value: {
            type: Object,
            required: true,
        },
        maxValue: {
            type: [String, Number],
            default: undefined,
        },
        // if no maxValue specified
        addressBalance: {
            type: Array,
            default: () => [],
        },
        // if no maxValue specified
        selectedCoinSymbol: {
            type: String,
            default: '',
        },
        // if no maxValue specified
        fee: {
            type: [Object, null],
            default: null,
        },
        isEstimation: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        'update:is-use-max',
        'use-max',
        'input',
        'input-native',
        'blur',
    ],
    data() {
        return {
            isUseMax: false,
        };
    },
    computed: {
        maxValueComputed() {
            if (typeof this.maxValue !== 'undefined') {
                return this.maxValue;
            }

            const selectedCoin = this.addressBalance.find((coin) => {
                return coin.coin.symbol === this.selectedCoinSymbol;
            });
            // coin not selected
            if (!selectedCoin) {
                return undefined;
            }

            return getAvailableSelectedBalance(selectedCoin, this.fee);
        },
        isMaxValueDefined() {
            return typeof this.maxValueComputed !== 'undefined' && this.maxValueComputed > 0;
        },
        isMaxValueRounded() {
            return this.isMaxValueDefined && !(new Big(this.maxValueComputed).eq(pretty(this.maxValueComputed).replace(/\s/g, '')));
        },
    },
    watch: {
        selectedCoinSymbol() {
            this.isUseMax = false;
        },
        value(newVal) {
            if (!(this.value > 0)) {
                this.isUseMax = false;
                return;
            }
            if (!this.isMaxValueDefined) {
                this.isUseMax = false;
                return;
            }
            this.isUseMax = new Big(this.value).eq(this.maxValueComputed);
        },
        maxValueComputed(newVal) {
            if (this.isMaxValueDefined && this.isUseMax) {
                this.useMax();
            }
        },
        isUseMax(newVal) {
            this.$emit('update:is-use-max', newVal);
            if (newVal) {
                this.$emit('use-max');
            }
        },
    },
    methods: {
        pretty,
        useMax() {
            if (!this.isMaxValueDefined) {
                return false;
            }
            this.isUseMax = true;
            this.$emit('input', stripZeros(this.maxValueComputed));
            this.$value.$touch();
        },
    },
};

/**
 * @param {BalanceItem} selectedCoin
 * @param {FeeData} fee
 * @return {string}
 */
export function getAvailableSelectedBalance(selectedCoin, fee) {
    // fee not in selected coins
    if (!isSelectedCoinSameAsFeeCoin(selectedCoin.coin, fee?.coin)) {
        return selectedCoin.amount;
    }
    // fee in selected coin (handle non-number values)
    const feeValue = fee?.value || 0;
    // subtract fee
    const amount = new Big(selectedCoin.amount).minus(feeValue).toString();
    return amount > 0 ? amount : '0';
}

/**
 * @param {Coin} selectedCoinItem
 * @param {string|number} feeCoinIdOrSymbol
 * @return {boolean}
 */
function isSelectedCoinSameAsFeeCoin(selectedCoinItem, feeCoinIdOrSymbol) {
    const isFeeId = isCoinId(feeCoinIdOrSymbol);
    const isFeeSymbol = !isFeeId;
    if (isFeeSymbol && selectedCoinItem.symbol === feeCoinIdOrSymbol) {
        return true;
    }
    if (isFeeId && Number(selectedCoinItem.id) === Number(feeCoinIdOrSymbol)) {
        return true;
    }
    return false;
}
</script>

<template>
    <div class="h-field__aside" :class="{'is-error': $value.$error}">
        <div class="h-field__aside-caption">
            <slot name="aside-caption">
                <Loader
                    class="h-field__aside-loader"
                    v-if="isLoading"
                    :isLoading="true"
                />
                <button
                    class="h-field__aside-max link--main link--opacity u-semantic-button" type="button"
                    v-else-if="isMaxValueDefined && !isUseMax"
                    @click="useMax()"
                >
                    {{ $td('Use max', 'index.use-max') }}. {{ isMaxValueRounded ? '≈' : '' }}{{ pretty(maxValueComputed) }}
                </button>
                <!--<template v-else>&nbsp;</template>-->
            </slot>
        </div>
        <InputMaskedAmount
            v-if="!isEstimation"
            class="h-field__input h-field__aside-input"
            :placeholder="$attrs.placeholder || '0.00'"
            v-bind="$attrs"
            :value="value"
            @input="$emit('input', $event)"
            @input.native="$emit('input-native', $event)"
            @blur="$value.$touch(); $emit('blur', $event)"
        />
        <div class="h-field__input h-field__aside-input" v-else>
            ≈{{ pretty(value || 0) }}
        </div>
    </div>
</template>

