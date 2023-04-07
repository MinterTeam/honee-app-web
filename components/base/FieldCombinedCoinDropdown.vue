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
        selectedValue: {
            type: String,
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
        fallbackToFullList: {
            type: Boolean,
            default: true,
        },
    },
    emits: [
        'update:isOpen',
        'select',
        'select-suggestion',
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
                    .filter((balanceItem) => balanceItem.coin?.type ? ofType(balanceItem.coin.type, this.coinType) : true);
            } else {
                return this.$store.state.explorer.coinList
                    .filter((coin) => ofType(coin.type, this.coinType))
                    .map((item) => item.symbol);
            }
        },
        valueAttribute() {
            return getValueAttribute(this.currentCoinList[0]);
        },
        displayAttribute() {
            return getDisplayAttribute(this.currentCoinList[0]);
        },
        maxSuggestions() {
            return this.useSpecifiedCoinList ? 100 : undefined;
        },
    },
    methods: {
        getSuggestionIconUrl(suggestion) {
            return this.$store.getters['explorer/getCoinIcon'](this.getSuggestionCoin(suggestion));
        },
        getSuggestionCoin(suggestion) {
            if (suggestion.coin?.symbol) {
                return suggestion.coin?.symbol;
            } else if (suggestion.tokenContractAddress) {
                return (suggestion.tokenSymbol || suggestion.tokenName);
            }
            return suggestion;
        },
        getSuggestionAmount(suggestion) {
            const amount = suggestion.value || suggestion.amount;
            return amount ? `(${pretty(amount)})` : '';
        },
    },
};

function isMinterBalanceItem(item) {
    return !!item?.coin?.symbol && !item?.tokenContractAddress;
}
// token known by Hub bridge
function isKnownTokenBalanceItem(item) {
    return !!item?.tokenContractAddress && !!item?.coin?.symbol;
}
function isTokenBalanceItem(item) {
    return !!item?.tokenContractAddress;
}
export function getValueAttribute(item) {
    if (isMinterBalanceItem(item)) {
        return 'coin.symbol';
    }
    if (isTokenBalanceItem(item) || isKnownTokenBalanceItem(item)) {
        return 'id';
    }
    return undefined;
}
function getDisplayAttribute(item) {
    if (isKnownTokenBalanceItem(item)) {
        return 'coin.symbol';
    }
    if (isTokenBalanceItem(item)) {
        return 'search';
    }
    return undefined;
}


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
        :selected-value="selectedValue"
        :value-attribute="valueAttribute"
        :display-attribute="displayAttribute"
        :max-suggestions="maxSuggestions"
        :is-open="isOpen"
        @update:isOpen="$emit('update:isOpen', $event)"
        @select="$emit('select', $event);"
        @select-suggestion="$emit('select-suggestion', $event);"
    >
        <template v-slot:suggestion-item="{suggestion}">
            <img class="h-field__suggestion-icon" :src="getSuggestionIconUrl(suggestion)" width="24" height="24" alt="" role="presentation">
            <BaseCoinSymbol class="h-field__suggestion-symbol" :network="suggestion.hubNetworkSlug?.toUpperCase()">{{ getSuggestionCoin(suggestion) }}</BaseCoinSymbol>
            <span class="h-field__suggestion-amount" v-if="getSuggestionAmount(suggestion)">{{ getSuggestionAmount(suggestion) }}</span>
        </template>
    </FieldCombinedBaseDropdown>
</template>
