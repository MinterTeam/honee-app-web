<script>
import checkEmpty from '~/assets/v-check-empty.js';
import {pretty} from '~/assets/utils.js';
import FieldSwapAmount from '@/components/base/FieldSwapAmount.vue';
import FieldSwapCoinSelect from '@/components/base/FieldSwapCoinSelect.vue';
import {COIN_TYPE} from 'assets/variables.js';

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
            required: true,
        },
        amount: {
            type: String,
            default: '',
        },
        $amount: {
            type: Object,
            required: true,
        },
        coinList: {
            type: Array,
            default: () => [],
        },
        // coinType: {
        //     type: String,
        //     default: COIN_TYPE.ANY,
        // },
        fallbackToFullList: {
            type: Boolean,
            default: true,
        },
        useBalanceForMaxValue: {
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
    },
    methods: {
        getCoinIconUrl(coin) {
            return this.$store.getters['explorer/getCoinIcon'](coin);
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
    <div class="amount-field">
        <div class="amount-field__content">
            <div class="amount-field__coin">
                <div class="amount-field__coin-name">{{ label }}</div>
                <button class="amount-field__coin-button u-semantic-button" type="button" @click="isSelectVisible = true">
                    <img class="amount-field__coin-icon" :src="getCoinIconUrl(coin)" width="32" height="32" alt="" role="presentation" v-if="coin">
                    <span class="amount-field__coin-symbol">{{ coin || 'Select coin' }}</span>
                    <img class="amount-field__icon-dropdown" src="/img/icon-dropdown.svg" alt="" role="presentation" width="24" height="24">
                </button>
            </div>
            <FieldSwapAmount
                :value="amount"
                :$value="$amount"
                :address-balance="useBalanceForMaxValue ? $store.state.balance : undefined"
                :selected-coin-symbol="coin"
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
