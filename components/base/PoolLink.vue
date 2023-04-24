<script>
import {EXPLORER_HOST} from '~/assets/variables.js';
import BaseCoinSymbol from '~/components/base/BaseCoinSymbol.vue';

export default {
    components: {
        BaseCoinSymbol,
    },
    props: {
        pool: {
            type: Object,
            required: true,
        },
    },
    computed: {
        poolUrl() {
            return EXPLORER_HOST + '/pools/' + this.getCoinSymbol(this.pool.coin0) + '/' + this.getCoinSymbol(this.pool.coin1);
        },
    },
    methods: {
        /**
         * Accept coin object from explorer or coin string from txParams
         * @param {Coin|string} coin
         * @return {string}
         */
        getCoinSymbol(coin) {
            return coin?.symbol || coin;
        },
    },
};
</script>

<template>
    <nuxt-link class="link--default" :to="poolUrl">
        <BaseCoinSymbol>{{ getCoinSymbol(pool.coin0) }}</BaseCoinSymbol>
        /
        <BaseCoinSymbol>{{ getCoinSymbol(pool.coin1) }}</BaseCoinSymbol>
    </nuxt-link>
</template>
