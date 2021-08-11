<script>
import checkEmpty from 'assets/v-check-empty.js';
import {pretty} from 'assets/utils.js';
import {COIN_TYPE} from 'assets/variables.js';
import InputUppercase from '@/components/base/InputUppercase.vue';

const MAX_ITEM_COUNT = 6;

export default {
    components: {
        InputUppercase,
    },
    directives: {
        checkEmpty,
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
    data() {
        return {
            value: '',
            disableOutsideClick: false,
        };
    },
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
        coinListFinal() {
            return this.currentCoinList
                .filter((item) => this.suggestionFilter(item, this.value))
                .sort((a, b) => {
                    // set coin from query on first position
                    if (a === this.value) {
                        return -1;
                    } else if (b === this.value) {
                        return 1;
                    } else {
                        return 0;
                    }
                })
                .slice(0, this.maxSuggestions);
        },
        maxSuggestions() {
            return this.useSpecifiedCoinList ? 100 : MAX_ITEM_COUNT;
        },
    },
    watch: {
        isOpen(newVal) {
            if (newVal) {
                setTimeout(() => {
                    this.$refs.input.$el.focus();
                }, 50);
                // prevent immediate close after opening
                this.disableOutsideClick = true;
                setTimeout(() => {
                    this.disableOutsideClick = false;
                }, 500);
            }
        },
    },
    created() {
        window.document.documentElement.addEventListener('click', this.handleOutsideClick);
        window.document.documentElement.addEventListener('keydown', this.handleEscape);
    },
    beforeDestroy() {
        window.document.documentElement.removeEventListener('click', this.handleOutsideClick);
        window.document.documentElement.removeEventListener('keydown', this.handleEscape);
    },
    methods: {
        getCoinIconUrl(coin) {
            return this.$store.getters['explorer/getCoinIcon'](coin);
        },
        suggestionFilter(item, query) {
            if (!query) {
                return true;
            }
            // keep only values started with query (e.g. remove "WALLET" for "LET" query)
            return this.getSuggestionCoin(item).indexOf(query) === 0;
        },
        handleSuggestionClick(value) {
            if (value) {
                this.$emit('select', value.coin?.symbol || value);
            } else {
                // this.$emit('cancel');
            }
            this.close();
        },
        handleOutsideClick(e) {
            if (!this.isOpen) {
                return;
            }
            if (this.disableOutsideClick) {
                return;
            }
            // outside click
            if (this.$refs.suggestionPanel && e.target !== this.$refs.suggestionPanel && !this.$refs.suggestionPanel.contains(e.target)) {
                this.close();
            }
        },
        handleEscape(e) {
            if (!this.isOpen) {
                return;
            }
            if (e.code === 'Escape' || e.keyCode === 27) {
                e.preventDefault();
                this.close();
            }
        },
        close() {
            this.$emit('update:isOpen', false);
            this.value = '';
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
    <div class="amount-field__select" ref="suggestionPanel" v-show="isOpen">
        <div class="amount-field__select-field">
            <InputUppercase
                class="amount-field__select-input" type="text" placeholder="Search token…"
                ref="input"
                v-bind="$attrs"
                v-model="value"
                @keyup.enter="handleSuggestionClick(value)"
            />
            <img class="amount-field__select-field-icon" src="/img/icon-search.svg" alt="" role="presentation">
        </div>

        <button class="amount-field__suggestion-item u-semantic-button" type="button" v-for="suggestion in coinListFinal" :key="suggestion.coin ? suggestion.coin.symbol : suggestion" @click="handleSuggestionClick(suggestion)">
            <img class="amount-field__suggestion-icon" :src="getCoinIconUrl(getSuggestionCoin(suggestion))" width="32" height="32" alt="" role="presentation">
            <span class="amount-field__suggestion-symbol">{{ getSuggestionCoin(suggestion) }}</span>
            <span v-if="getSuggestionAmount(suggestion)">{{ getSuggestionAmount(suggestion) }}</span>
        </button>
    </div>
</template>
