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
    methods: {
        getPoolUrl(pool) {
            return EXPLORER_HOST + '/pools/' + getCoinSymbol(pool.coin0) + '/' + getCoinSymbol(pool.coin1);
        },
        getCoinSymbol,
    },
};

/**
 * Accept coin object from explorer or coin string from txParams
 * @param {Coin|string} coin
 * @return {string}
 */
function getCoinSymbol(coin) {
    return coin?.symbol || coin;
}
</script>

<template functional>
    <nuxt-link
        class="link--default"
        :class="[data.staticClass, data.class]"
        v-bind="data.attrs"
        :to="$options.methods.getPoolUrl(props.pool)"
    >
        <component :is="$options.components.BaseCoinSymbol">
            {{ $options.methods.getCoinSymbol(props.pool.coin0) }}
        </component>
        /
        <component :is="$options.components.BaseCoinSymbol">
            {{ $options.methods.getCoinSymbol(props.pool.coin1) }}
        </component>
    </nuxt-link>
</template>
