<script>
import checkEmpty from '~/assets/v-check-empty.js';
import {COIN_TYPE} from '~/assets/variables.js';
import FieldCombinedBaseAmount from '~/components/base/FieldCombinedBaseAmount.vue';
import FieldCombinedCoinDropdown from '@/components/base/FieldCombinedCoinDropdown.vue';

export default {
    components: {
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
         * @type Array<string>|Array<BalanceItem>|Array<Coin>
         * */
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
        fallbackToFullList: {
            type: Boolean,
            default: true,
        },
        useBalanceForMaxValue: {
            type: Boolean,
            default: false,
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
    data() {
        return {
            isSelectVisible: false,
        };
    },
    computed: {
        isSelectDisabled() {
            // 0 and >1 are OK (enabled)
            return this.coinList.length === 1;
        },
    },
    mounted() {
        if (this.isSelectDisabled) {
            this.handleSelect(this.coinList[0]);
        }
    },
    methods: {
        getIconUrl(coin) {
            return this.$store.getters['explorer/getCoinIcon'](coin);
        },
        openDropdown() {
            if (this.isSelectDisabled) {
                return;
            }
            this.isSelectVisible = true;
        },
        handleSelect(coin) {
            this.$emit('update:coin', coin.coin?.symbol || coin);
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
    <div class="h-field" :class="{'h-field--is-readonly': isEstimation}">
        <!-- @TODO handle blur (amount blur fires and coin blur not) (maybe not fire blur at all?)-->
        <div class="h-field__content">
            <div class="h-field__title">{{ label }}</div>
            <button class="h-field__select-button u-semantic-button" type="button" @click="openDropdown()" :disabled="isSelectDisabled">
                <img class="h-field__select-icon" :src="getIconUrl(coin)" width="24" height="24" alt="" role="presentation" v-if="coin">
                <span class="h-field__select-value">coin || $td('Select coin', 'form.select-coin')</span>
                <img class="h-field__select-icon-arrow" src="/img/icon-dropdown.svg" alt="" role="presentation" width="24" height="24" v-if="!isSelectDisabled">
            </button>
        </div>
        <FieldCombinedBaseAmount
            v-if="amount !== false"
            :value="amount"
            :$value="$amount"
            :address-balance="useBalanceForMaxValue ? $store.state.balance : undefined"
            :selected-coin-symbol="coin"
            :max-value="maxValue"
            :is-estimation="isEstimation"
            :is-loading="isLoading"
            @input="$emit('update:amount', $event)"
            @input-native="$emit('input-native', $event)"
            @update:is-use-max="handleUseMax($event)"
        />

        <FieldCombinedCoinDropdown
            :is-open.sync="isSelectVisible"
            :coin-list="coinList"
            :coin-type="coinType"
            :fallback-to-full-list="fallbackToFullList"
            @select="handleSelect"
        />
    </div>
</template>
