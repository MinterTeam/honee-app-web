<script>
import BasePriceImpact from '~/components/base/BasePriceImpact.vue';

export default {
    components: {
        BasePriceImpact,
    },
    props: {
        estimationViewUsd: {
            type: Array,
            required: true,
        },
        priceUnavailable: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        // positive price impact means lose of value
        priceImpact() {
            const totalSpendUsd = this.estimationViewUsd.reduce((accumulator, item) => accumulator + item.spendUsd, 0);
            const totalResultUsd = this.estimationViewUsd.reduce((accumulator, item) => accumulator + item.resultUsd, 0);
            if (!totalSpendUsd || !totalResultUsd) {
                return 0;
            }
            return (totalSpendUsd - totalResultUsd) / totalSpendUsd * 100;
        },
    },
};
</script>

<template>
    <BasePriceImpact :price-impact="priceImpact" :price-unavailable="priceUnavailable"/>
</template>
