<script>
import {prettyRound} from '~/assets/utils.js';

export default {
    props: {
        priceImpact: {
            type: [Number, String],
            required: true,
        },
        priceUnavailable: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        prettyRound,
    },
};
</script>

<template>
    <div class="u-text-warn u-fw-700 u-text-small" v-if="priceImpact > 5 || priceUnavailable">
        <template v-if="priceImpact > 5">
            {{ $td('High price impact', 'portfolio.warning-price-impact') }}
            ≈{{ prettyRound(priceImpact) }}%
        </template>
        <template v-else-if="priceUnavailable">
            {{ $td('Check calculated amounts before confirming', 'portfolio.warning-price-impact-unavailable') }}
        </template>
    </div>
</template>
