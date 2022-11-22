<script>
import BasePriceImpact from '~/components/base/BasePriceImpact.vue';

export default {
    components: {
        BasePriceImpact,
    },
    props: {
        coinToSell: {
            type: String,
            required: true,
        },
        valueToSell: {
            type: [Number, String],
            required: true,
        },
        coinToBuy: {
            type: String,
            required: true,
        },
        valueToBuy: {
            type: [Number, String],
            required: true,
        },
    },
    computed: {
        priceSell() {
            return this.$store.getters['portfolio/getCoinPrice'](this.coinToSell);
        },
        priceBuy() {
            return this.$store.getters['portfolio/getCoinPrice'](this.coinToBuy);
        },
        priceUnavailable() {
            const validProps = this.valueToSell && this.valueToBuy && this.coinToSell && this.coinToBuy;
            // don't show warning if no props
            if (!validProps) {
                return false;
            }
            return !this.priceSell || !this.priceBuy;
        },
        spendUsd() {
            return this.valueToSell * this.priceSell;
        },
        resultUsd() {
            return this.valueToBuy * this.priceBuy;
        },
        // positive price impact means lose of value
        priceImpact() {
            if (!this.spendUsd || !this.resultUsd) {
                return 0;
            }
            return (this.spendUsd - this.resultUsd) / this.spendUsd * 100;
        },
    },
};
</script>

<template>
    <BasePriceImpact :price-impact="priceImpact" :price-unavailable="priceUnavailable"/>
</template>
