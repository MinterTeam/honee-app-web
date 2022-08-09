<script>
import {pretty, prettyExact} from '~/assets/utils.js';

const FORMAT_TYPE = {
    PRETTY: 'pretty',
    APPROX: 'approx',
    EXACT: 'exact',
};

export default {
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
        // baseCoinAmount: {
        //     type: [String, Number],
        // },
    },
    computed: {
        amountUsd() {
            // don't calculate usd price for units other than coin itself
            if (this.unit) {
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
        </div>
    </component>
</template>
