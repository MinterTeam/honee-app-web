<script>
import {pretty} from '~/assets/utils.js';

const SHORT_COUNT = 5;

export default {
    SHORT_COUNT,
    components: {
    },
    data() {
        return {
            isFullListActive: false,
        };
    },
    computed: {
        visibleCoinList() {
            // filter zero BIP
            const cleanList = this.$store.state.balance.length <= 1
                ? this.$store.state.balance
                : this.$store.state.balance.filter((item) => item.amount > 0);
            return this.isFullListActive ? cleanList : cleanList.slice(0, SHORT_COUNT);
        },
    },
    methods: {
        pretty,
        getCoinIconUrl(coin) {
            return this.$store.getters['explorer/getCoinIcon'](coin);
        },
        getAmountUsd(bipAmount) {
            return (bipAmount || 0) * this.$store.getters['explorer/bipPriceUsd'];
        },
    },
};
</script>

<template>
    <div>
        <div class="wallet__coin-list" v-if="visibleCoinList.length">
            <div class="wallet__coin-row" v-for="coinItem in visibleCoinList" :key="coinItem.coin.id">
                <div class="wallet__coin">
                    <img class="wallet__coin-icon" :src="getCoinIconUrl(coinItem.coin.symbol)" width="24" height="24" alt="" role="presentation">
                    <span class="wallet__coin-name">{{ coinItem.coin.symbol }}</span>
                    <img class="wallet__coin-verified" src="/img/icon-verified.svg" width="12" height="12" alt="" role="presentation" v-if="coinItem.coin.verified">
                </div>
                <div class="wallet__coin-balance">
                    {{ pretty(coinItem.amount) }}
                    <div class="wallet__coin-balance-usd">${{ pretty(getAmountUsd(coinItem.bipAmount)) }}</div>
                </div>
            </div>
        </div>
        <div class="u-text-right u-mt-15" v-if="$options.SHORT_COUNT < $store.state.balance.length">
            <button class="link--default u-semantic-button" @click="isFullListActive = true" v-if="!isFullListActive">{{ $td('View all coins', 'index.assets-coins-view-all') }}</button>
            <button class="link--default u-semantic-button" @click="isFullListActive = false" v-else>{{ $td('View less coins', 'index.assets-coins-view-less') }}</button>
        </div>
    </div>
</template>
