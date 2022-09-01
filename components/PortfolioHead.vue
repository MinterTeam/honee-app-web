<script>
import {pretty, shortHashFilter} from '~/assets/utils.js';

export default {
    name: 'PortfolioHead',
    props: {
        /** @type {Portfolio} */
        portfolio: {
            type: Object,
            required: true,
        },
    },
    methods: {
        pretty,
        shortHashFilter,
    },
};
</script>

<template>
    <div>
        <div class="card__action-head">
            <div class="card__action-title">
                <div class="card__action-title-type">#{{ portfolio.id }}</div>
                <div class="card__action-title-value">{{ portfolio.title }}</div>
            </div>
            <div class="card__action-stats">
                <div class="card__action-stats-caption">
                    7 days
                </div>
                <div
                    class="card__action-stats-value"
                    :class="portfolio.profit.daily7 >= 0 ? 'u-text-green' : 'u-text-red'"
                >
                    {{ pretty(portfolio.profit.daily7) }}%
                </div>
            </div>
        </div>
        <div class="card__action-description u-mt-05 u-text-muted">By {{ shortHashFilter(portfolio.owner) }}</div>
        <p class="card__action-description u-text-break" v-if="portfolio.description">{{ portfolio.description }}</p>
    </div>
</template>
