<script>
import {pretty} from '~/assets/utils.js';
import {COIN_TYPE} from '~/assets/variables.js';
import BaseCoinSymbol from '~/components/base/BaseCoinSymbol.vue';
import FieldCombinedBaseDropdown from '~/components/base/FieldCombinedBaseDropdown.vue';

export default {
    components: {
        BaseCoinSymbol,
        FieldCombinedBaseDropdown,
    },
    inheritAttrs: false,
    props: {
        isOpen: {
            type: Boolean,
            required: true,
        },
        /**
         * Flat array or array of balance items
         * @type Array<string>|Array<BalanceItem>
         * */
        coinList: {
            type: Array,
            default: () => [],
        },
        coinType: {
            type: String,
            default: COIN_TYPE.ANY,
        },
        fallbackToFullList: {
            type: Boolean,
            default: true,
        },
    },
    emits: [
        'update:isOpen',
        'select',
    ],
    computed: {
        useSpecifiedCoinList() {
            if (!this.fallbackToFullList) {
                return true;
            }
            return this.coinList && this.coinList.length;
        },
        currentCoinList() {
            if (this.useSpecifiedCoinList) {
                return this.coinList
                    .filter((balanceItem) => typeof balanceItem === 'object' ? ofType(balanceItem.coin.type, this.coinType) : true);
            } else {
                return this.$store.state.explorer.coinList
                    .filter((coin) => ofType(coin.type, this.coinType))
                    .map((item) => item.symbol);
            }
        },
        valueAttribute() {
            return this.currentCoinList.length && this.currentCoinList[0].coin?.symbol ? 'coin.symbol' : undefined;
        },
        maxSuggestions() {
            return this.useSpecifiedCoinList ? 100 : undefined;
        },
    },
    methods: {
        getCoinIconUrl(coin) {
            return this.$store.getters['explorer/getCoinIcon'](coin);
        },
        getSuggestionCoin(suggestion) {
            return suggestion.coin?.symbol || suggestion;
        },
        getSuggestionAmount(suggestion) {
            const amount = suggestion.value || suggestion.amount;
            return amount ? `(${pretty(amount)})` : '';
        },
    },
};

function ofType(coinType, selectedType) {
    if (selectedType === COIN_TYPE.ANY) {
        return true;
    } else if (selectedType === COIN_TYPE.ANY_TOKEN) {
        return coinType === COIN_TYPE.TOKEN || coinType === COIN_TYPE.POOL_TOKEN;
    } else {
        return coinType === selectedType;
    }
}
</script>

<template>
    <FieldCombinedBaseDropdown
        v-bind="$attrs"
        :list="currentCoinList"
        :value-attribute="valueAttribute"
        :max-suggestions="maxSuggestions"
        :is-open="isOpen"
        @update:isOpen="$emit('update:isOpen', $event)"
        @select="$emit('select', $event);"
    >
        <template v-slot:suggestion-item="{suggestion}">
            <img class="h-field__suggestion-icon" :src="getCoinIconUrl(getSuggestionCoin(suggestion))" width="24" height="24" alt="" role="presentation">
            <BaseCoinSymbol class="h-field__suggestion-symbol">{{ getSuggestionCoin(suggestion) }}</BaseCoinSymbol>
            <span class="h-field__suggestion-amount" v-if="getSuggestionAmount(suggestion)">{{ getSuggestionAmount(suggestion) }}</span>
        </template>
    </FieldCombinedBaseDropdown>
</template>
