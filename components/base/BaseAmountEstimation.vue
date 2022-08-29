<script>
import {pretty, prettyExact} from '~/assets/utils.js';
import BaseLoader from '~/components/base/BaseLoader.vue';

const FORMAT_TYPE = {
    PRETTY: 'pretty',
    APPROX: 'approx',
    EXACT: 'exact',
};

export default {
    components: {BaseLoader},
    FORMAT_TYPE,
    props: {
        amount: {
            type: [String, Number],
            required: true,
        },
        coin: {
            type: String,
            default: '',
        },
        tag: {
            type: String,
            default: 'div',
        },
        format: {
            type: String,
            default: FORMAT_TYPE.PRETTY,
        },
        // @TODO type: exact, approx, pretty (not exact all digits and not approx estimated)
        exact: {
            type: Boolean,
            default: false,
        },
        // amount unit, e.g. '%'
        unit: {
            type: String,
            default: '',
        },
        hideUsd: {
            type: Boolean,
            default: false,
        },
        // baseCoinAmount: {
        //     type: [String, Number],
        // },
        isLoading: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        amountUsd() {
            // don't calculate usd price for units other than coin itself
            if (this.hideUsd || this.unit) {
                return 0;
            }
            let baseCoinAmount;
            if (this.coin === this.$store.getters.BASE_COIN && this.amount > 0) {
                baseCoinAmount = this.amount;
            } else if (this.baseCoinAmount) {
                baseCoinAmount = this.baseCoinAmount;
            }

            return baseCoinAmount * this.$store.getters['explorer/bipPriceUsd'];
        },
    },
    methods: {
        pretty,
        prettyExact,
    },
};
</script>

<template>
    <component :is="tag" class="information__item">
        <div class="information__coin">
            <img class="information__coin-icon" :src="$store.getters['explorer/getCoinIcon'](coin)" width="20" height="20" alt="" role="presentation">
            <div class="information__coin-symbol">{{ coin }}</div>
        </div>
        <div class="information__value">
            <BaseLoader class="information__loader" :is-loading="isLoading"/>
            <template v-if="!isLoading">
                <span class="u-text-muted" v-if="amountUsd">(${{ pretty(amountUsd) }})</span>
                <span v-if="format === $options.FORMAT_TYPE.EXACT">{{ prettyExact(amount) }}</span>
                <span v-else :title="prettyExact(amount)">
                    <template v-if="format === $options.FORMAT_TYPE.APPROX">≈</template>
                    {{ pretty(amount) }}
                </span><!--
             -->{{ unit }}
                <!--
                <span class="u-display-ib" v-if="baseCoinAmount && coin !== $store.getters.BASE_COIN">({{ pretty(baseCoinAmount) }} {{ $store.getters.BASE_COIN }})</span>
                -->
            </template>
        </div>
    </component>
</template>
