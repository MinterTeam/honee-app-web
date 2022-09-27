<script>
import {prettyRound} from '~/assets/utils.js';

export default {
    props: {
        network: {
            type: String,
            required: true,
        },
        feeImpact: {
            type: [Number, String],
            required: true,
        },
        coin: {
            type: String,
            required: true,
        },
    },
    methods: {
        prettyRound,
    },
};
</script>

<template>
    <div class="information information--warning" v-if="feeImpact > 10">
        <div class="information__item">
            ⚠️ {{ $td(`High ${network} fee`, 'hub.warning-fee-impact', {network}) }}
            <div class="information__value u-text-nowrap">{{ prettyRound(feeImpact) }}%</div>
        </div>
        <div class="information__item information__item--content information__muted u-text-medium">
            {{ $td(`Bridge transactions fees will consume ≈${prettyRound(feeImpact)}% of your ${coin}`, 'hub.warning-fee-impact-description', {impact: prettyRound(feeImpact), coin}) }}
        </div>
    </div>
</template>
