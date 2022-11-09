<script>
import {prettyUsd, shortHashFilter} from '~/assets/utils.js';
import {PORTFOLIO_PROFIT_PERIOD} from '~/api/portfolio.js';

export default {
    name: 'PortfolioHead',
    PORTFOLIO_PROFIT_PERIOD,
    props: {
        /** @type {Portfolio|ConsumerPortfolio} */
        portfolio: {
            type: Object,
            required: true,
        },
        profitPeriod: {
            type: String,
            default: PORTFOLIO_PROFIT_PERIOD.APY,
        },
        profitCaption: {
            type: String,
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
            const isPrimitive = typeof this.portfolio.profit === 'string' || typeof this.portfolio.profit === 'number';
            return isPrimitive ? this.portfolio.profit : this.portfolio.profit?.[this.profitPeriod];
        },
        profitText() {
            if (!this.profit && this.profit !== 0) {
                return '—';
            } else {
                return prettyUsd(this.profit) + '%';
            }
        },
        profitColorClass() {
            if (this.profit > 0) {
                return 'u-text-green';
            }
            if (this.profit < 0) {
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
    <div class="">
        <div class="card__head-row">
            <!-- left -->
            <div class="card__action-title-type">
                <template v-if="isCopy">{{ $td('Copy of', 'portfolio.head-copy-of') }}</template>
                #{{ portfolio.id }}
            </div>
            <!-- right -->
            <div class="card__action-stats-caption u-text-upper">
                <template v-if="profitCaption">{{ profitCaption }}</template>
                <template v-else-if="isTemplate && profitPeriod === $options.PORTFOLIO_PROFIT_PERIOD.APY">
                    {{ $td('APY', 'common.apy') }}
                </template>
                <template v-else-if="isTemplate && profitPeriod === $options.PORTFOLIO_PROFIT_PERIOD.AWP">
                    {{ $td('Average weekly profit', 'portfolio.head-profit-awp') }}
                </template>
                <template v-else-if="isTemplate && profitPeriod === $options.PORTFOLIO_PROFIT_PERIOD.DAILY7">
                    {{ $td('7 days', 'portfolio.head-profit-7d') }}
                </template>
                <template v-else-if="isTemplate && profitPeriod === $options.PORTFOLIO_PROFIT_PERIOD.RECOMMEND">
                    {{ $td('Last update', 'portfolio.head-profit-last-update') }}
                </template>
                <template v-else-if="isConsumer">{{ $td('Balance', 'portfolio.head-balance') }}</template>
            </div>
        </div>
        <div class="card__head-row">
            <!-- left -->
            <nuxt-link class="card__action-title-value" v-if="titleLink" :to="titleLink">
                {{ portfolio.title }}
            </nuxt-link>
            <div class="card__action-title-value" v-else>{{ portfolio.title }}</div>
            <!-- right -->
            <div v-if="isConsumer" class="card__action-stats-value">{{ prettyUsd(portfolio.price) }}$</div>
            <div v-if="isTemplate" class="card__action-stats-value" :class="[profitColorClass]">
                {{ profitText }}
            </div>
        </div>
        <div class="card__head-row">
            <!-- left -->
            <div class="card__action-meta u-text-muted">By {{ shortHashFilter(portfolio.owner) }}</div>
            <!-- right -->
            <div v-if="isConsumer" class="card__action-meta u-fw-700" :class="[profitColorClass]">
                {{ profitText }}
            </div>
        </div>
    </div>
</template>
