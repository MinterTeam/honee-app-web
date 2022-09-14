<script>
import {getPortfolioList} from '~/api/portfolio.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import PortfolioHead from '~/components/PortfolioHead.vue';
import PortfolioPagination from '~/components/PortfolioPagination.vue';

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
        PortfolioPagination,
        BaseLoader,
    },
    props: {
        /** @type {PORTFOLIO_LIST_TYPE}*/
        type: {
            type: String,
            default: PORTFOLIO_LIST_TYPE.TOP,
        },
        limit: {
            type: [Number, String],
            default: 15,
        },
        page: {
            type: [Number, String],
            default: 1,
        },
        showPagination: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        'update:portfolio-list',
    ],
    data() {
        return {
            /** @type {Array<Portfolio|ConsumerPortfolio>} */
            portfolioList: [],
            paginationInfo: undefined,
        };
    },
    fetch() {
        const address = this.$store.getters.address;
        const page = this.page || 1;
        const limit = this.limit;
        const listPromise = this.type === PORTFOLIO_LIST_TYPE.COPIED
            ? this.$store.dispatch('portfolio/fetchConsumerPortfolioList')
            : getPortfolioList({
                owner: this.type === PORTFOLIO_LIST_TYPE.MANAGED ? address : undefined,
                limit,
                page,
            });

        return listPromise
            .then((portfolioInfo) => {
                this.portfolioList = Object.freeze(portfolioInfo.list) || [];
                this.paginationInfo = Object.freeze(portfolioInfo.pagination) || undefined;
                this.$emit('update:portfolio-list', this.portfolioList);
            });
    },
    watch: {
        page: {
            handler() {
                this.$fetch();
                window.scroll(0, 0);
            },
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
    <div>
        <h2 class="dashboard__category-title u-mb-15">
            <img class="dashboard__category-icon" src="/img/icon-category-portfolio.svg" alt="" role="presentation">
            <span v-if="type === $options.PORTFOLIO_LIST_TYPE.MANAGED">
                {{ $td('Managed portfolios', `portfolio.list-managed-title`) }}
            </span>
            <span v-else-if="type === $options.PORTFOLIO_LIST_TYPE.COPIED">
                {{ $td('Copied portfolios', `portfolio.list-copied-title`) }}
            </span>
            <span v-else>{{ $td('Top portfolios', `portfolio.list-title`) }}</span>
        </h2>
        <div v-if="$fetchState.pending" class="u-text-center">
            <BaseLoader class="" :is-loading="true"/>
        </div>
        <div v-else-if="$fetchState.error" class="u-text-center">Can't get portfolio list</div>
        <div v-else-if="portfolioList.length === 0" class="u-text-center">{{ $td('You don\'t have any portfolios yet', 'portfolio.list-managed-empty') }}</div>
        <div class="u-grid u-grid--vertical-margin" v-else-if="portfolioList.length">
            <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="portfolio in portfolioList" :key="portfolio.id">
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
            </div>
            <PortfolioPagination v-if="showPagination" class="u-cell" :pagination-info="paginationInfo" :is-loading="$fetchState.pending"/>
        </div>
    </div>
</template>
