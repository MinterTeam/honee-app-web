<script>
    import Big from '~/assets/big.js';
    import {isCoinId} from 'minter-js-sdk/src/utils.js';
    import stripZeros from 'pretty-num/src/strip-zeros.js';
    import checkEmpty from '~/assets/v-check-empty';
    import {pretty} from '~/assets/utils.js';
    import InputMaskedAmount from '~/components/base/InputMaskedAmount.vue';
    import Loader from '@/components/base/BaseLoader.vue';

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
                // fee not in selected coins
                if (!isSelectedCoinSameAsFeeCoin(selectedCoin.coin, this.fee?.coin)) {
                    return selectedCoin.amount;
                }
                // fee in selected coin (handle non-number values)
                const feeValue = this.fee?.value || 0;
                // subtract fee
                const amount = new Big(selectedCoin.amount).minus(feeValue).toString();
                return amount > 0 ? amount : '0';
            },
            isMaxValueDefined() {
                return typeof this.maxValueComputed !== 'undefined' && this.maxValueComputed > 0;
            },
            isMaxValueRounded() {
                return this.isMaxValueDefined && !(new Big(this.maxValueComputed).eq(pretty(this.maxValueComputed).replace(/\s/g, '')));
            },
            isValueEqualToMaxValue() {
                if (!(this.value > 0)) {
                    return false;
                }
                if (!this.isMaxValueDefined) {
                    return false;
                }
                return new Big(this.value).eq(this.maxValueComputed);
            },
        },
        watch: {
            isValueEqualToMaxValue(newVal) {
                this.isUseMax = newVal;
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
     *
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
        if (isFeeId && selectedCoinItem.id === feeCoinIdOrSymbol) {
            return true;
        }
        return false;
    }
</script>

<template>
    <div class="h-field__aside" :class="{'is-error': $value.$error}">
        <div class="h-field__aside-caption">
            <Loader
                class="h-field__aside-loader"
                v-if="isLoading"
                :isLoading="true"
            />
            <button
                class="h-field__aside-max u-semantic-button" type="button"
                v-else-if="isMaxValueDefined && !isUseMax"
                @click="useMax"
            >
                {{ $td('Balance', 'index.balance') }}: {{ isMaxValueRounded ? '≈' : '' }}{{ pretty(maxValueComputed) }}
            </button>
<!--            <template v-else>&nbsp;</template>-->
        </div>
        <InputMaskedAmount
            v-if="!isEstimation"
            class="h-field__input h-field__aside-input" type="text" inputmode="decimal" placeholder="0.00"
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

