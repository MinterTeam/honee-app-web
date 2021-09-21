<script>
import {getCoinIconUrl, pretty} from "~/assets/utils.js";
import {DASHBOARD_URL} from '~/assets/variables.js';
import CoinList from '~/components/CoinList.vue';

const BALANCE_DISPLAY_BIP = 1;
const BALANCE_DISPLAY_TOTAL = 2;
const BALANCE_DISPLAY_TOTAL_USD = 3;

let timeInterval = null;

export default {
    ideFix: null,
    BALANCE_DISPLAY_BIP,
    BALANCE_DISPLAY_TOTAL,
    BALANCE_DISPLAY_TOTAL_USD,
    components: {
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
    },
    watch: {
        // update tx list on balance updated
        "$store.state.balance": function() {
            this.$store.dispatch('FETCH_TRANSACTION_LIST');
        },
    },
    destroyed() {
        clearInterval(timeInterval);
    },
    methods: {
        pretty,
        getCoinIconUrl,
        pageUrl(page) {
            const dashboardUrl = DASHBOARD_URL.replace('/', '');
            return this.$i18nGetPreferredPath(dashboardUrl + '-' + page);
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

        <nuxt-child/>
    </div>
</template>




