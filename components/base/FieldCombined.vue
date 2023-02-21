<script>
import _get from 'lodash-es/get.js';
import checkEmpty from '~/assets/v-check-empty.js';
import {COIN_TYPE} from '~/assets/variables.js';
import BaseCoinSymbol from '~/components/base/BaseCoinSymbol.vue';
import FieldCombinedBaseAmount from '~/components/base/FieldCombinedBaseAmount.vue';
import FieldCombinedCoinDropdown, {getValueAttribute} from '~/components/base/FieldCombinedCoinDropdown.vue';

export default {
    components: {
        BaseCoinSymbol,
        FieldCombinedBaseAmount,
        FieldCombinedCoinDropdown,
    },
    directives: {
        checkEmpty,
    },
    inheritAttrs: false,
    props: {
        coin: {
            type: String,
            default: '',
        },
        $coin: {
            type: Object,
            default: () => {
                return {$touch: () => {}};
            },
        },
        amount: {
            type: [Number, String, Boolean],
            default: '',
        },
        $amount: {
            type: Object,
            default: () => {
                return {$touch: () => {}};
            },
        },
        /**
         * Flat array or array of balance items
         * @type Array<string>|Array<BalanceItem>|Array<TokenBalanceItem>
         */
        coinList: {
            type: Array,
            default: () => [],
        },
        coinType: {
            type: String,
            default: COIN_TYPE.ANY,
        },
        maxValue: {
            type: [String, Number],
            default: undefined,
        },
        disableMaxValueWatch: {
            type: Boolean,
            default: false,
        },
        fallbackToFullList: {
            type: Boolean,
            default: true,
        },
        useBalanceForMaxValue: {
            type: Boolean,
            default: false,
        },
        fee: {
            type: Object,
            default: undefined,
        },
        isEstimation: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        label: {
            type: String,
            default: '',
        },
    },
    emits: [
        'update:coin',
        'update:amount',
        'update:is-use-max',
        'use-max',
        'input-native',
        'select-suggestion',
    ],
    data() {
        return {
            isSelectVisible: false,
            selectedSuggestion: undefined,
        };
    },
    computed: {
        // input attrs will go to input and other attrs will go to root
        attrs() {
            const {
                // FieldCombinedBaseAmount > InputMaskedAmount
                isPercent, ['is-percent']: isPercentSnake, scale,
                // FieldCombinedBaseAmount > InputMaskedAmount > input
                placeholder, type, inputmode,
                // FieldCombined
                ...other
            } = this.$attrs;

            return {
                input: {isPercent: isPercent || isPercentSnake, scale, placeholder, type, inputmode},
                other,
            };
        },
        isSelectDisabled() {
            // 0 is disabled only if no fallback
            if (!this.fallbackToFullList && this.coinList.length === 0) {
                return true;
            }
            // 0 and >1 are OK (enabled)
            return this.coinList.length === 1;
        },
        displayValue() {
            if (this.selectedSuggestion) {
                return this.$refs.coinDropdown?.getSuggestionCoin(this.selectedSuggestion);
            }
            return this.coin;
        },
        iconUrl() {
            if (this.selectedSuggestion) {
                return this.$refs.coinDropdown?.getSuggestionIconUrl(this.selectedSuggestion);
            }
            return this.$store.getters['explorer/getCoinIcon'](this.coin);
        },
    },
    mounted() {
        if (this.isSelectDisabled && this.coinList[0] && !this.coin) {
            this.handleSelect(getSuggestionValue(this.coinList[0]));
        }

        function getSuggestionValue(item) {
            const valueAttribute = getValueAttribute(item);
            return valueAttribute ? _get(item, valueAttribute) : item;
        }
    },
    methods: {
        openDropdown() {
            if (this.isSelectDisabled) {
                return;
            }
            this.isSelectVisible = true;
        },
        handleSelect(coin) {
            this.$emit('update:coin', coin);
        },
        handleUseMax(value) {
            this.$emit('update:is-use-max', value);
            if (value) {
                this.$emit('use-max');
            }
        },
    },
};
</script>

<template>
    <div class="h-field" :class="{'h-field--is-dashed': isEstimation}" v-bind="attrs.other">
        <!-- @TODO handle blur (amount blur fires and coin blur not) (maybe not fire blur at all?)-->
        <div class="h-field__content">
            <div class="h-field__title">{{ label }}</div>
            <button class="h-field__select-button u-semantic-button" type="button" @click="openDropdown()" :disabled="isSelectDisabled">
                <img class="h-field__select-icon" :src="iconUrl" width="24" height="24" alt="" role="presentation" v-if="coin">
                <BaseCoinSymbol class="h-field__select-value">{{ displayValue || $td('Select coin', 'form.select-coin') }}</BaseCoinSymbol>
                <img class="h-field__select-icon-arrow" src="/img/icon-dropdown.svg" alt="" role="presentation" width="24" height="24" v-if="!isSelectDisabled">
            </button>
        </div>
        <FieldCombinedBaseAmount
            v-if="amount !== false"
            v-bind="attrs.input"
            :value="amount"
            :$value="$amount"
            :address-balance="useBalanceForMaxValue ? $store.state.balance : undefined"
            :selected-coin-symbol="coin"
            :fee="fee"
            :max-value="maxValue"
            :disable-max-value-watch="disableMaxValueWatch"
            :is-estimation="isEstimation"
            :is-loading="isLoading"
            @input="$emit('update:amount', $event)"
            @input-native="$emit('input-native', $event)"
            @update:is-use-max="handleUseMax($event)"
        >
            <template v-slot:aside-caption>
                <slot name="aside-caption"></slot>
            </template>
        </FieldCombinedBaseAmount>

        <FieldCombinedCoinDropdown
            ref="coinDropdown"
            :is-open.sync="isSelectVisible"
            :selected-value="coin"
            :coin-list="coinList"
            :coin-type="coinType"
            :fallback-to-full-list="fallbackToFullList"
            @select="handleSelect($event)"
            @select-suggestion="selectedSuggestion = $event; $emit('select-suggestion', $event)"
        />
    </div>
</template>
