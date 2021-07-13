<script>
    import {mapGetters, mapState} from 'vuex';
    import {getCoinIconUrl, pretty, getTimeDistance} from "~/assets/utils";
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
            ...mapState({
                balance: 'balance',
            }),
            ...mapGetters([
                'username',
                'address',
                'baseCoin',
            ]),
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
                            ${{ pretty($store.state.totalBalanceSum) }}
                        </div>
                    </div>
                    <div class="wallet__balance-links" >
                        <nuxt-link class="button button--yellow-light" to="/send">
                            Buy BIP & HUB
                        </nuxt-link>
                    </div>
                </div>
            </div>
            <div class="card__content">
                <div class="button-group">
                    <nuxt-link class="button button--main" to="/deposit">Deposit</nuxt-link>
                    <nuxt-link class="button button--main" to="/swap">Swap</nuxt-link>
                    <nuxt-link class="button button--main" to="/send">Send</nuxt-link>
                </div>
            </div>
            <CoinList class="card__content"/>
        </div>

        <nuxt-child/>
    </div>
</template>




