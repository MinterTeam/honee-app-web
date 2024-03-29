<script>
import {pretty, prettyExact, prettyPrecise} from '~/assets/utils.js';
import {HUB_NETWORK_SLUG, HUB_CHAIN_DATA} from '~/assets/variables.js';
import BaseCoinSymbol from '~/components/base/BaseCoinSymbol.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';

const FORMAT_TYPE = {
    PRETTY: 'pretty',
    APPROX: 'approx',
    EXACT: 'exact',
};

export default {
    HUB_NETWORK_SLUG,
    HUB_CHAIN_DATA,
    components: {
        BaseCoinSymbol,
        BaseLoader,
    },
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
        network: {
            /** @type {PropType<HUB_NETWORK_SLUG>} */
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
        keepNegative: {
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
        hideIcon: {
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
        amountIsNotNumber() {
            return typeof this.amount === 'string' && this.amount.length && !/^-?\d+\.?\d*$/.test(this.amount);
        },
        amountFinal() {
            const fixNegative = !this.keepNegative && this.amount < 0;
            return fixNegative ? 0 : this.amount;
        },
        amountUsd() {
            // don't calculate usd price for units other than coin itself
            if (this.hideUsd || this.unit) {
                return 0;
            }
            if (!this.amountFinal || this.amountIsNotNumber) {
                return 0;
            }
            return this.amountFinal * this.$store.getters['portfolio/getCoinPrice'](this.coin);
            /*
            let baseCoinAmount;
            if (this.coin === this.$store.getters.BASE_COIN && this.amount > 0) {
                baseCoinAmount = this.amountFinal;
            } else if (this.baseCoinAmount) {
                baseCoinAmount = this.baseCoinAmount;
            }

            return baseCoinAmount * this.$store.getters['explorer/bipPriceUsd'];
            */
        },
        coinIconUrl() {
            return this.$store.getters['explorer/getCoinIcon'](this.coin);
        },
    },
    methods: {
        pretty,
        prettyExact,
        prettyPrecise,
    },
};
</script>

<template>
    <component :is="tag" class="information__item">
        <div class="information__coin">
            <img class="information__coin-icon" v-if="coinIconUrl" :src="coinIconUrl" width="20" height="20" alt="" role="presentation">
            <BaseCoinSymbol class="information__coin-symbol">{{ coin }}</BaseCoinSymbol>
            <span class="u-ml-025" v-if="network && $options.HUB_CHAIN_DATA[network] && network !== $options.HUB_NETWORK_SLUG.MINTER">
                ({{ $options.HUB_CHAIN_DATA[network].shortName }})
            </span>
        </div>
        <div class="information__value">
            <BaseLoader class="information__loader" :is-loading="isLoading"/>
            <template v-if="!isLoading">
                <span class="u-text-muted" v-if="amountUsd">(${{ pretty(amountUsd) }})</span>
                <span v-if="amountIsNotNumber">{{ amount }}</span>
                <span v-else :title="prettyExact(amountFinal)">
                    <template v-if="format === $options.FORMAT_TYPE.APPROX">≈</template>
                    <template v-if="format === $options.FORMAT_TYPE.EXACT">{{ prettyPrecise(amountFinal) }}</template>
                    <template v-else>{{ pretty(amountFinal) }}</template>
                </span><!--
             -->{{ unit }}
                <!--
                <span class="u-display-ib" v-if="baseCoinAmount && coin !== $store.getters.BASE_COIN">({{ pretty(baseCoinAmount) }} {{ $store.getters.BASE_COIN }})</span>
                -->
            </template>
        </div>
    </component>
</template>
