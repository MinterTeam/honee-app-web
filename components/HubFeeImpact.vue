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
    <div class="u-text-warn u-fw-700 u-text-small" v-if="feeImpact > 10">
        {{ $td(`High ${network} fee`, 'hub.warning-fee-impact', {network}) }}
        ≈{{ prettyRound(feeImpact) }}%
    </div>
</template>
