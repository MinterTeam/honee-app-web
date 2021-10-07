<script>
import {pretty} from "~/assets/utils.js";
import {DASHBOARD_URL} from '~/assets/variables.js';
import cardList from '~/assets/data-card-list.js';
import Card from '~/components/Card.vue';
import CoinList from '~/components/CoinList.vue';

const BALANCE_DISPLAY_BIP = 1;
const BALANCE_DISPLAY_TOTAL = 2;
const BALANCE_DISPLAY_TOTAL_USD = 3;

export default {
    BALANCE_DISPLAY_BIP,
    BALANCE_DISPLAY_TOTAL,
    BALANCE_DISPLAY_TOTAL_USD,
    cardList,
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
            // remove first slash
            page = page.replace(/^\//, '');
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
                    <div class="wallet__balance-links">
                        <nuxt-link class="button button--yellow-light button--full-mobile" :to="pageUrl('buy')">
                            <img class="button__icon" src="/img/icon-category-buy.svg" width="24" height="24" alt="" role="presentation">
                            Buy BIP, HUB, & BEE
                        </nuxt-link>
                    </div>
                </div>
            </div>
            <div class="card__content">
                <div class="button-group button-group--center">
                    <nuxt-link class="button button--main button--full-mobile" :to="pageUrl('deposit')">
                        <img class="button__icon" src="/img/icon-white-deposit.svg" width="24" height="24" alt="" role="presentation">
                        Deposit
                    </nuxt-link>
                    <nuxt-link class="button button--main button--full-mobile" :to="pageUrl('swap')">
                        <img class="button__icon" src="/img/icon-white-swap.svg" width="24" height="24" alt="" role="presentation">
                        Swap
                    </nuxt-link>
                    <nuxt-link class="button button--main button--full-mobile" :to="pageUrl('send')">
                        <img class="button__icon" src="/img/icon-white-send.svg" width="24" height="24" alt="" role="presentation">
                        Send
                    </nuxt-link>
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
