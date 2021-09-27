<script>
import {pretty} from "~/assets/utils.js";
import {DASHBOARD_URL} from '~/assets/variables.js';
import Card from '~/components/Card.vue';
import CoinList from '~/components/CoinList.vue';

const BALANCE_DISPLAY_BIP = 1;
const BALANCE_DISPLAY_TOTAL = 2;
const BALANCE_DISPLAY_TOTAL_USD = 3;

export default {
    BALANCE_DISPLAY_BIP,
    BALANCE_DISPLAY_TOTAL,
    BALANCE_DISPLAY_TOTAL_USD,
    cardList: {
        swap: [
            {
                title: 'Buy BIP',
                description: 'Top up your balance with any of the supported cryptos to buy BIP.',
                icon: 'BIP',
                // color: '#fa5a00',
                stats: {
                    price: 'BIP',
                },
                tags: ['Exchange', 'BIP'],
                action: '/swap/BIP',
            },
            {
                title: 'Buy HUB',
                description: 'Top up your balance with any of the supported cryptos to buy HUB.',
                icon: 'HUB',
                // color: '#fa5a00',
                stats: {
                    price: 'HUB',
                },
                tags: ['Exchange', 'HUB'],
                action: '/swap/HUB',
            },
            {
                title: 'Buy BEE',
                description: 'Top up your balance with any of the supported cryptos to buy BEE.',
                icon: 'BEE',
                // color: '#fa5a00',
                stats: {
                    price: 'BEE',
                },
                tags: ['Exchange', 'BEE'],
                action: '/swap/BEE',
            },
        ],
        earn: [
            {
                title: 'Delegate BIP',
                description: '‘Tie’ your BIP to any validator of the Minter Network and start getting rewards every hour.',
                icon: 'BIP',
                color: '#fa5a00',
                stats: {
                    caption: 'APY',
                    value: '40%',
                },
                tags: ['Staking', 'BIP'],
                action: '/delegate/BIP',
            },
            {
                title: 'Yield farming BEE / MUSD',
                description: 'Put your BEE and MUSD into a liquidity pool to start getting extra daily rewards.',
                icon: ['BEE', 'MUSD'],
                color: '#3f9c37',
                stats: {
                    caption: 'APR in BEE',
                    value: '36.5%',
                },
                tags: ['Farming', 'BEE', 'MUSD'],
                action: '/farm/BEE/MUSD',
            },
            {
                title: 'Yield farming USDTE / USDCE',
                description: 'Put your USDTE and USDCE into a liquidity pool to start getting extra daily rewards.',
                icon: ['USDTE', 'USDCE'],
                color: '#2ea496',
                stats: {
                    caption: 'APR in BIP',
                    value: '36.5%',
                },
                tags: ['Farming', 'USDTE', 'USDCE'],
                action: '/farm/USDTE/USDCE',
            },
        ],
        win: [
            {
                title: 'DONUT',
                description: 'Keep providing DONUT into a pool with BIP to increase your chances of winning by random.',
                icon: 'DONUT',
                color: '#c71b6e',
                stats: {
                    caption: 'GIVEAWAY',
                    value: '1%',
                },
                tags: ['Lottery', 'DONUT'],
                action: '/win/DONUT/BIP',
            },
        ],
    },
    components: {
        Card,
        CoinList,
    },
    filters: {
        pretty,
        uppercase: (value) => value.toUpperCase(),
    },
    props: {

    },
    data() {
        return {

        };
    },
    computed: {
        cardList() {
            let result = {};
            for (const categorySlug in this.$options.cardList) {
                result[categorySlug] = this.$options.cardList[categorySlug].map((card) => {
                    return {
                        ...card,
                        category: categorySlug,
                        actionType: card.action.replace(/\?.*/, '').split('/').filter((item) => !!item)[0],
                        action: this.pageUrl(card.action),
                    };
                });
            }

            return result;
        },
    },
    watch: {
        // update tx list on balance updated
        "$store.state.balance": function() {
            this.$store.dispatch('FETCH_TRANSACTION_LIST');
        },
    },
    methods: {
        pretty,
        capitalize(value) {
            return value[0].toUpperCase() + value.substring(1);
        },
        pageUrl(page = '') {
            // ensure first slash
            page = '/' + page.replace(/^\//, '');
            return this.$i18nGetPreferredPath(DASHBOARD_URL + page);
        },
    },
};
</script>


<template>
    <div>
        <div class="card">
            <div class="card__content">
                <h2 class="u-h--uppercase">Total balance</h2>
                <div class="wallet__balance-wrap">
                    <div class="wallet__balance">
                        <div class="wallet__balance-value">
                            ${{ pretty($store.state.totalBalanceSumUsd) }}
                        </div>
                    </div>
                    <div class="wallet__balance-links" >
                        <nuxt-link class="button button--yellow-light" :to="pageUrl('buy')">
                            Buy BIP & HUB
                        </nuxt-link>
                    </div>
                </div>
            </div>
            <div class="card__content">
                <div class="button-group">
                    <nuxt-link class="button button--main" :to="pageUrl('deposit')">Deposit</nuxt-link>
                    <nuxt-link class="button button--main" :to="pageUrl('swap')">Swap</nuxt-link>
                    <nuxt-link class="button button--main" :to="pageUrl('send')">Send</nuxt-link>
                </div>
            </div>
            <CoinList class="card__content"/>
        </div>

        <div class="u-mt-25" v-for="(categoryCards, categorySlug) in cardList" :key="categorySlug">
            <h2 class="dashboard__category-title u-mb-15">
                <img class="dashboard__category-icon" :src="`/img/icon-category-${categorySlug}.svg`" alt="" role="presentation">
                <span>{{ capitalize(categorySlug) }}</span>
            </h2>
            <div class="u-grid u-grid--vertical-margin">
                <div class="u-cell u-cell--medium--1-2" v-for="card in categoryCards" :key="card.title">
                    <Card :card="card"/>
                </div>
            </div>
        </div>

        <nuxt-child/>
    </div>
</template>




