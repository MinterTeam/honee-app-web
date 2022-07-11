<script>
import {flatCardList} from '~/content/card-list.js';
import {pretty} from '~/assets/utils.js';
import Card from '~/components/Card.vue';

const ACTION_LIST = [
    '/stake/1',
    '/stake/2',
    '/swap/BTC',
];

const MAX_PAGE = 3;

export default {
    layout: 'onboarding',
    components: {
        Card,
    },
    async fetch() {
        if (!this.$route.query.topupAmount || !this.$route.query.topupCoin) {
            this.$nuxt.error({
                status: 404,
                message: this.$td('You have to top-up first', 'onboarding.require-topup'),
            });
        }
    },
    computed: {
        currentPage() {
            return Number(this.$route.query.page) || 1;
        },
        prevPage() {
            return this.currentPage > 1 ? this.currentPage - 1 : null;
        },
        nextPage() {
            return this.currentPage < MAX_PAGE ? this.currentPage + 1 : null;
        },
        topupAmountUsd() {
            const balanceItem = this.$store.state.balance.find((item) => item.coin.symbol === this.$route.query.topupCoin);
            return balanceItem ? this.$store.getters['explorer/bipPriceUsd'] * balanceItem.bipAmount : 0;
        },
        cardList() {
            return flatCardList.filter((item) => ACTION_LIST.includes(item.action));
        },
    },
    methods: {
        pretty,
    },
};
</script>

<template>
    <div class="u-section">
        <div class="u-container u-container--small u-text-center u-text-medium u-mb-10">
            <h1 class="u-h3 u-mb-05">
                <span class="u-emoji u-h1">🎉</span> <br>
                Welcome to Honee!
            </h1>

            <p>
                You’ve added {{ $route.query.topupAmount }}&nbsp;{{ $route.query.topupCoin }}
                <span v-if="topupAmountUsd">(≈${{ pretty(topupAmountUsd) }})</span>
                to your balance. Now&nbsp;you are just a few clicks away from earning!
            </p>
            <p>Please choose one of our curated programs:</p>
        </div>

        <div class="u-container u-container--large">
            <div class="u-grid u-grid--vertical-margin">
                <div class="u-cell u-cell--large--1-3 u-cell--medium--1-2 card-wrap-cell" v-for="card in cardList" :key="card.action">
                    <Card :card="card"/>
                </div>
            </div>
        </div>
    </div>
</template>