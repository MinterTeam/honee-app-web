<script>
import {PORTFOLIO_PROFIT_PERIOD} from '~/api/portfolio.js';
import PortfolioHead from '~/components/PortfolioHead.vue';

/**
 * @enum {string}
 */
export const PORTFOLIO_LIST_TYPE = {
    RECOMMEND: PORTFOLIO_PROFIT_PERIOD.RECOMMEND,
    TOP: 'top',
    ALL: 'all',
    MANAGED: 'managed',
    COPIED: 'copied',
};

export default {
    PORTFOLIO_LIST_TYPE,
    components: {
        PortfolioHead,
    },
    props: {
        /** @type {Portfolio}*/
        portfolio: {
            type: Object,
            required: true,
        },
        /** @type {PORTFOLIO_LIST_TYPE}*/
        type: {
            type: String,
            default: PORTFOLIO_LIST_TYPE.TOP,
        },
    },
    computed: {
        profitPeriod() {
            if (this.type === PORTFOLIO_LIST_TYPE.RECOMMEND) {
                return PORTFOLIO_PROFIT_PERIOD.DAILY7;
            }
            if (this.type === PORTFOLIO_LIST_TYPE.TOP) {
                return PORTFOLIO_PROFIT_PERIOD.AWP;
            }
            if (this.type === PORTFOLIO_LIST_TYPE.ALL) {
                return PORTFOLIO_PROFIT_PERIOD.DAILY7;
            }
            return undefined;
        },
    },
    methods: {
        getLinkUrl(portfolio) {
            if (this.type === PORTFOLIO_LIST_TYPE.COPIED) {
                return this.$i18nGetPreferredPath(`/portfolio/${portfolio?.id}/copied`);
            } else {
                return this.$i18nGetPreferredPath(`/portfolio/${portfolio?.id}`);
            }
        },
        getLinkCaption() {
            if (this.type === PORTFOLIO_LIST_TYPE.TOP || this.type === PORTFOLIO_LIST_TYPE.ALL) {
                return this.$td('Buy', 'portfolio.buy-button');
            } else {
                return this.$td('View', 'portfolio.view-button');
            }
        },
    },
};
</script>

<template>
    <div class="card card--action card__content--small">
        <PortfolioHead
            :portfolio="portfolio"
            :profit-period="profitPeriod"
            :title-link="getLinkUrl(portfolio)"
        />
        <p class="card__action-description u-text-break" v-if="portfolio.description">{{ portfolio.description }}</p>

        <div class="card__control-wrap">
            <div class="card__token-list">
                <img
                    class="card__token-logo"
                    v-for="coin in portfolio.coins"
                    :key="coin.id"
                    :src="$store.getters['explorer/getCoinIcon'](coin.id)"
                    :alt="$store.getters['explorer/getCoinSymbol'](coin.id)"
                >
            </div>

            <nuxt-link class="button button--main" :to="getLinkUrl(portfolio)">
                {{ getLinkCaption() }}
            </nuxt-link>
        </div>
    </div>
</template>
