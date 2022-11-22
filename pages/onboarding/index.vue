<script>
import {flatCardList} from '~/data/cards.js';
import {pretty} from '~/assets/utils.js';
import {BASE_COIN} from '~/assets/variables.js';
import {clearActionQuery} from '~/components/Action.vue';
import Card from '~/components/Card.vue';

const ACTION_LIST = [
    '/stake/19?coin={coin}',
    '/stake/24?coin={coin}',
];
const ACTION_LIST_CONDITIONAL = {
    BIP: `/delegate/${BASE_COIN}`,
    '*': '/swap/BTC?coinToSell={coin}',
};

const MAX_PAGE = 3;

export default {
    layout: 'splash',
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
        topupCoin() {
            return this.$route.query.topupCoin?.toUpperCase();
        },
        /*
        currentPage() {
            return Number(this.$route.query.page) || 1;
        },
        prevPage() {
            return this.currentPage > 1 ? this.currentPage - 1 : null;
        },
        nextPage() {
            return this.currentPage < MAX_PAGE ? this.currentPage + 1 : null;
        },
        */
        topupAmountUsd() {
            const balanceItem = this.$store.state.balance.find((item) => item.coin.symbol === this.topupCoin);
            return balanceItem ? this.$store.getters['explorer/bipPriceUsd'] * balanceItem.bipAmount : 0;
        },
        cardList() {
            const actionList = ACTION_LIST;
            const conditionalAction = ACTION_LIST_CONDITIONAL[this.topupCoin] || ACTION_LIST_CONDITIONAL['*'];
            const finalActionList = [...actionList, conditionalAction].map((actionUrl) => actionUrl.replace('{coin}', this.topupCoin));
            const clearActionList = finalActionList.map((actionUrl) => clearActionQuery(actionUrl));

            return flatCardList
                .filter((item) => clearActionList.includes(item.action))
                .map((item) => {
                    const index = clearActionList.indexOf(item.action);
                    return {
                        ...item,
                        action: finalActionList[index],
                    };
                });
        },
    },
    methods: {
        pretty,
    },
};
</script>

<template>
    <div class="u-section topup__vertical-container">
        <div class="topup__vertical-center">
            <div class="u-container u-container--small u-text-center u-text-medium u-mb-10">
                <h1 class="u-h3 u-mb-05">
                    <span class="u-emoji u-h1">🎉</span> <br>
                    {{ $td('Welcome to Honee!', 'onboarding.welcome') }}
                </h1>

                <p>
                    {{ $td('You\’ve added', 'onboarding.text-added') }}
                    <strong>{{ $route.query.topupAmount }}&nbsp;{{ topupCoin }}</strong>
                    <span v-if="topupAmountUsd">(≈${{ pretty(topupAmountUsd) }})</span>{{ $td(' to your balance. Now you are just a few clicks away from earning!', 'onboarding.text-earning') }}
                </p>
                <p>{{ $td('Please choose one of our top programs:', 'onboarding.text-choose') }}</p>
            </div>

            <div class="u-container u-container--large">
                <div class="u-grid u-grid--vertical-margin u-grid--justify-center">
                    <div class="u-cell u-cell--large--1-3 u-cell--medium--1-2 card-wrap-cell" v-for="card in cardList" :key="card.action">
                        <Card :card="card" action-base-url="/onboarding"/>
                    </div>
                </div>
            </div>
        </div>

        <div class="u-mt-15 u-text-center">
            <nuxt-link class="link--default-black" :to="getDashboardUrl()">
                {{ $td('I\'ll do it later', 'onboarding.skip') }}
            </nuxt-link>
        </div>
    </div>
</template>
