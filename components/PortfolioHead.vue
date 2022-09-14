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
        titleLink: {
            type: String,
        },
        isCopy: {
            type: Boolean,
            default: false,
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
            const profit = this.isConsumer ? this.portfolio.profit : this.portfolio.profit?.daily7;
            if (profit === -101) {
                return '—';
            }
            return this.isConsumer ? this.portfolio.profit : this.portfolio.profit?.daily7;
        },
        profitText() {
            if (this.profit === -101) {
                return '—';
            } else {
                return prettyUsd(this.profit) + '%';
            }
        },
        profitColorClass() {
            if (this.profit > 0) {
                return 'u-text-green';
            }
            if (this.profit >= -100 && this.profit < 0) {
                return 'u-text-red';
            }
            return '';
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
                <div class="card__action-title-type">
                    <template v-if="isCopy">{{ $td('Copy of', 'portfolio.head-copy-of') }}</template>
                    #{{ portfolio.id }}
                </div>
                <nuxt-link class="card__action-title-value" v-if="titleLink" :to="titleLink">
                    {{ portfolio.title }}
                </nuxt-link>
                <div class="card__action-title-value" v-else>{{ portfolio.title }}</div>
                <div class="card__action-meta u-text-muted">By {{ shortHashFilter(portfolio.owner) }}</div>
            </div>
            <div class="card__action-stats">
                <div class="card__action-stats-caption u-text-upper">
                    <template v-if="isTemplate">{{ $td('7 days', 'portfolio.head-profit-7d') }}</template>
                    <template v-if="isConsumer">{{ $td('Balance', 'portfolio.head-balance') }}</template>
                </div>
                <div class="card__action-stats-value" v-if="isConsumer">{{ prettyUsd(portfolio.price) }}$</div>
                <div :class="[profitColorClass, isTemplate ? 'card__action-stats-value' : 'card__action-meta u-fw-700']">
                    {{ profitText }}
                </div>
            </div>
        </div>
        <p class="card__action-description u-text-break" v-if="portfolio.description">{{ portfolio.description }}</p>
    </div>
</template>
