<script>
import {prettyUsd, shortHashFilter} from '~/assets/utils.js';

export default {
    name: 'PortfolioHead',
    props: {
        /** @type {Portfolio|ConsumerPortfolio} */
        portfolio: {
            type: Object,
            required: true,
        },
    },
    computed: {
        isConsumer() {
            return !!this.portfolio.isolatedAddress;
        },
        isTemplate() {
            return !this.isConsumer;
        },
        profit() {
            return this.isConsumer ? this.portfolio.profit : this.portfolio.profit.daily7;
        },
    },
    methods: {
        prettyUsd,
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
                    {{ isTemplate ? '7 days' : 'Profit' }}
                </div>
                <div class="card__action-stats-value" v-if="profit === -101">—</div>
                <div
                    v-else
                    class="card__action-stats-value"
                    :class="profit >= 0 ? 'u-text-green' : 'u-text-red'"
                >
                    {{ prettyUsd(profit) }}%
                </div>
            </div>
        </div>
        <div class="card__action-description u-mt-05 u-text-muted">By {{ shortHashFilter(portfolio.owner) }}</div>
        <p class="card__action-description u-text-break" v-if="portfolio.description">{{ portfolio.description }}</p>
    </div>
</template>
