<script>
import {prettyRound} from '~/assets/utils.js';

export default {
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
    methods: {
        prettyRound,
    },
};
</script>

<template>
    <div class="information information--warning form-row" v-if="priceImpact > 5 || priceUnavailable">
        <template v-if="priceImpact > 5">
            <div class="information__item">
                ⚠️ {{ $td('High price impact!', 'portfolio.warning-price-impact') }}
                <div class="information__value">{{ prettyRound(priceImpact) }}%</div>
            </div>
            <div class="information__item information__item--content information__muted u-text-medium">{{ $t('portfolio.warning-price-impact-description', {impact: prettyRound(priceImpact)}) }}</div>
        </template>
        <template v-else-if="priceUnavailable">
            <div class="information__item">
                ⚠️ {{ $td('Can\'t calculate price impact', 'portfolio.warning-price-impact-unavailable') }}
            </div>
            <div class="information__item information__item--content information__muted u-text-medium">{{ $td('Please double check resulting amounts. You may lose part of coins because of low liquidity pools involved in swaps', 'portfolio.warning-price-impact-unavailable-description') }}</div>
        </template>
    </div>
</template>

<style scoped>

</style>
