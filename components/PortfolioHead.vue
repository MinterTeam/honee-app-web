<script>
import {prettyUsd, shortHashFilter} from '~/assets/utils.js';
import {PORTFOLIO_PROFIT_PERIOD} from '~/api/portfolio.js';
import BaseTabs from '~/components/base/BaseTabs.vue';
import PortfolioNotificationButton from '~/components/PortfolioNotificationButton.vue';

export default {
    name: 'PortfolioHead',
    PORTFOLIO_PROFIT_PERIOD,
    components: {
        BaseTabs,
        PortfolioNotificationButton,
    },
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
        // is single portfolio opened or is card list
        isSingleView: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            selectedProfitPeriod: this.profitPeriod,
        };
    },
    computed: {
        isConsumer() {
            return !!this.portfolio.isolatedAddress;
        },
        isTemplate() {
            return !this.isConsumer;
        },
        isOwnManaged() {
            return this.portfolio.owner === this.$store.getters.address;
        },
        showProfitTabs() {
            return this.isTemplate && this.isSingleView && this.isOwnManaged;
        },
        currentProfitPeriod() {
            return this.showProfitTabs ? this.selectedProfitPeriod : this.profitPeriod;
        },
        profit() {
            const isPrimitive = typeof this.portfolio.profit === 'string' || typeof this.portfolio.profit === 'number';
            return isPrimitive ? this.portfolio.profit : this.portfolio.profit?.[this.currentProfitPeriod];
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
                <template v-if="isConsumer">{{ $td('Copy of', 'portfolio.head-copy-of') }}</template>
                #{{ portfolio.id }}
            </div>
            <!-- right -->
            <BaseTabs
                v-if="showProfitTabs"
                v-model="selectedProfitPeriod"
                item-class="card__action-stats-caption u-text-upper"
                :tabs="[
                    {value: $options.PORTFOLIO_PROFIT_PERIOD.WEEKLY, label: $td('1W', 'portfolio.tabs-label-short-weekly')},
                    {value: $options.PORTFOLIO_PROFIT_PERIOD.DAILY7, label: $td('7D', 'portfolio.tabs-label-short-7d')},
                    {value: $options.PORTFOLIO_PROFIT_PERIOD.WTD, label: $td('Live', 'portfolio.tabs-label-short-live')},
                    {value: $options.PORTFOLIO_PROFIT_PERIOD.AWP, label: $td('AWP', 'portfolio.tabs-label-short-awp')},
                    {value: $options.PORTFOLIO_PROFIT_PERIOD.APY, label: $td('APY', 'portfolio.tabs-label-short-apy')},
                ]"
            />
            <div class="card__action-stats-caption u-text-upper" v-else>
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
            <div class="u-flex u-flex--align-center">
                <PortfolioNotificationButton
                    v-if="!(isOwnManaged && isSingleView)"
                    class="card__portfolio-notify-button"
                    :portfolioId="portfolio.id"
                />
                <component
                    :is="titleLink ? 'nuxt-link' : 'div'"
                    class="card__action-title-value"
                    :to="titleLink"
                >
                    {{ portfolio.title }}
                </component>
            </div>
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
