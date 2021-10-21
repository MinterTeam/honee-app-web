<script>
    import {pretty} from '~/assets/utils.js';

    export default {
        components: {
        },
        data() {
            return {
                isFullListActive: false,
            };
        },
        computed: {
            coinList() {
                return this.isFullListActive ? this.$store.state.balance : this.$store.state.balance.slice(0, 5);
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
    <section>
        <div class="u-h--uppercase u-mb-10">{{ $td('Coins', 'index.coins') }}</div>
        <div class="wallet__coin-list" v-if="coinList.length">
            <div class="wallet__coin-row" v-for="coinItem in coinList" :key="coinItem.coin.id">
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
        <div class="u-text-right u-mt-20" v-if="coinList.length < $store.state.balance.length">
            <button class="link--default u-semantic-button" @click="isFullListActive = true">{{ $td('View all', 'index.view-all') }}</button>
        </div>
    </section>
</template>
