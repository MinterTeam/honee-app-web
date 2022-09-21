<script>
import PortfolioHead from '~/components/PortfolioHead.vue';

/**
 * @enum {string}
 */
export const PORTFOLIO_LIST_TYPE = {
    TOP: 'top',
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
    methods: {
        getLinkUrl(portfolio) {
            if (this.type === PORTFOLIO_LIST_TYPE.COPIED) {
                return this.$i18nGetPreferredPath(`/portfolio/${portfolio?.id}/copied`);
            } else {
                return this.$i18nGetPreferredPath(`/portfolio/${portfolio?.id}`);
            }
        },
        getLinkCaption() {
            if (this.type === PORTFOLIO_LIST_TYPE.TOP) {
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
        <PortfolioHead :portfolio="portfolio" :title-link="getLinkUrl(portfolio)"/>

        <div class="card__token-list u-mt-10">
            <img
                class="card__token-logo"
                v-for="coin in portfolio.coins"
                :key="coin.id"
                :src="$store.getters['explorer/getCoinIcon'](coin.id)"
                :alt="$store.getters['explorer/getCoinSymbol'](coin.id)"
            >
        </div>

        <nuxt-link class="u-mt-10 button button--main button--full" :to="getLinkUrl(portfolio)">
            {{ getLinkCaption() }}
        </nuxt-link>
    </div>
</template>
