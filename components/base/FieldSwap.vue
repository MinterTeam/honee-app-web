<script>
import checkEmpty from '~/assets/v-check-empty.js';
import {pretty} from '~/assets/utils.js';
import FieldSwapAmount from '@/components/base/FieldSwapAmount.vue';
import FieldSwapCoinSelect from '@/components/base/FieldSwapCoinSelect.vue';

export default {
    components: {
        FieldSwapAmount,
        FieldSwapCoinSelect,
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
            type: [Number, String],
            default: '',
        },
        $amount: {
            type: Object,
            default: () => {
                return {$touch: () => {}};
            },
        },
        coinList: {
            type: Array,
            default: () => [],
        },
        // coinType: {
        //     type: String,
        //     default: COIN_TYPE.ANY,
        // },
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
            // 0 and >1 are OK
            return this.coinList.length === 1;
        },
    },
    mounted() {
        if (this.isSelectDisabled) {
            this.handleSelect(this.coinList[0]);
        }
    },
    methods: {
        getCoinIconUrl(coin) {
            return this.$store.getters['explorer/getCoinIcon'](coin);
        },
        openCoinSelection() {
            if (this.isSelectDisabled) {
                return;
            }
            this.isSelectVisible = true;
        },
        handleSelect(coin) {
            this.$emit('update:coin', coin);
        },
        handleUseMax(value) {
            console.log('reimeit', value);
            this.$emit('update:is-use-max', value);
            if (value) {
                this.$emit('use-max');
            }
        },
    },
};
</script>

<template>
    <div class="amount-field" :class="{'amount-field--is-readonly': isEstimation}">
        <div class="amount-field__content">
            <div class="amount-field__coin">
                <div class="amount-field__coin-name">{{ label }}</div>
                <button class="amount-field__coin-button u-semantic-button" type="button" @click="openCoinSelection()" :disabled="isSelectDisabled">
                    <img class="amount-field__coin-icon" :src="getCoinIconUrl(coin)" width="32" height="32" alt="" role="presentation" v-if="coin">
                    <span class="amount-field__coin-symbol">{{ coin || 'Select coin' }}</span>
                    <img class="amount-field__icon-dropdown" src="/img/icon-dropdown.svg" alt="" role="presentation" width="24" height="24" v-if="!isSelectDisabled">
                </button>
            </div>
            <FieldSwapAmount
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
        </div>
        <FieldSwapCoinSelect
            :is-open.sync="isSelectVisible"
            :coin-list="coinList"
            :fallback-to-full-list="fallbackToFullList"
            @select="$emit('update:coin', $event);"
        />
    </div>
</template>
