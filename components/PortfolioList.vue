<script>
import {getPortfolioList, PORTFOLIO_PROFIT_PERIOD} from '~/api/portfolio.js';
import {getErrorText} from '~/assets/server-error.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import PortfolioListItem, {PORTFOLIO_LIST_TYPE} from '~/components/PortfolioListItem.vue';
import PortfolioPagination from '~/components/PortfolioPagination.vue';

export {PORTFOLIO_LIST_TYPE};

export default {
    PORTFOLIO_LIST_TYPE,
    components: {
        PortfolioListItem,
        PortfolioPagination,
        BaseLoader,
    },
    props: {
        /** @type {PORTFOLIO_LIST_TYPE}*/
        type: {
            type: String,
            default: PORTFOLIO_LIST_TYPE.RECOMMEND,
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
        showTitle: {
            type: Boolean,
            default: true,
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
        let limit = this.limit;
        let profitPeriod = Object.values(PORTFOLIO_PROFIT_PERIOD).includes(this.type) ? this.type : undefined;
        let apyPeriod;
        // if (this.type === PORTFOLIO_LIST_TYPE.TOP) {
        //     profitPeriod = PORTFOLIO_PROFIT_PERIOD.AWP;
        // }
        // if (this.type === PORTFOLIO_LIST_TYPE.ALL) {
        //     profitPeriod = PORTFOLIO_PROFIT_PERIOD.DAILY7;
        // }
        if (this.type === PORTFOLIO_LIST_TYPE.APY) {
            limit = 100;
        }
        if (this.type === PORTFOLIO_LIST_TYPE.RECOMMEND) {
            profitPeriod = PORTFOLIO_PROFIT_PERIOD.APY;
            apyPeriod = 6;
        }
        const listPromise = this.type === PORTFOLIO_LIST_TYPE.COPIED
            ? this.$store.dispatch('portfolio/fetchConsumerPortfolioList')
            : getPortfolioList({
                owner: this.type === PORTFOLIO_LIST_TYPE.MANAGED ? address : undefined,
                profitPeriod,
                apyPeriod,
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
        getErrorText,
    },
};
</script>

<template>
    <div>
        <h2 class="u-h1 u-mb-15" v-if="showTitle">
            <template v-if="type === $options.PORTFOLIO_LIST_TYPE.MANAGED">
                {{ $td('Managed portfolios', `portfolio.list-managed-title`) }}
            </template>
            <template v-else-if="type === $options.PORTFOLIO_LIST_TYPE.COPIED">
                {{ $td('Copied portfolios', `portfolio.list-copied-title`) }}
            </template>
            <!--
            <template v-else-if="type === $options.PORTFOLIO_LIST_TYPE.ALL">
                {{ $td('All portfolios', `portfolio.list-all-title`) }}
            </template>
            <template v-else-if="type === $options.PORTFOLIO_LIST_TYPE.TOP">
                {{ $td('Top portfolios', `portfolio.list-top-title`) }}
            </template>
            -->
            <template v-else-if="type === $options.PORTFOLIO_LIST_TYPE.RECOMMEND">
                {{ $td('Recommended portfolios', `portfolio.list-recommend-title`) }}
            </template>
        </h2>
        <div v-if="$fetchState.pending" class="u-text-center">
            <BaseLoader class="" :is-loading="true"/>
        </div>
        <div v-else-if="$fetchState.error">
            Can't get portfolio list <br>
            {{ getErrorText($fetchState.error) }}
        </div>
        <div v-else-if="portfolioList.length === 0">
            <template v-if="type === $options.PORTFOLIO_LIST_TYPE.MANAGED || type === $options.PORTFOLIO_LIST_TYPE.COPIED">
                {{ $td('You don\'t have any portfolios yet', 'portfolio.list-managed-empty') }}
            </template>
            <template v-else-if="type === $options.PORTFOLIO_LIST_TYPE.RECOMMEND">
                {{ $td('Here will be shown recently updated profitable portfolios', 'portfolio.list-recommend-empty') }}
            </template>
            <template v-else>
                Empty list
            </template>
        </div>
        <div class="u-grid u-grid--vertical-margin" v-else-if="portfolioList.length">
            <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="portfolio in portfolioList" :key="portfolio.id">
                <PortfolioListItem :portfolio="portfolio" :type="type"/>
            </div>
            <PortfolioPagination v-if="showPagination" class="u-cell" :pagination-info="paginationInfo" :is-loading="$fetchState.pending"/>
        </div>
    </div>
</template>
