<script>
import {pretty, shortHashFilter} from '~/assets/utils.js';
import {getPortfolioList} from '~/api/portfolio.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import PortfolioHead from '~/components/PortfolioHead.vue';

export default {
    components: {
        PortfolioHead,
        BaseLoader,
    },
    props: {
        owner: {
            type: String,
        },
        limit: {
            type: [Number, String],
            default: 12,
        },
    },
    data() {
        return {
            /** @type {Array<Portfolio>} */
            portfolioList: [],
        };
    },
    fetch() {
        return getPortfolioList({
            owner: this.owner,
            limit: this.limit,
        })
            .then((portfolioInfo) => {
                this.portfolioList = portfolioInfo.list || [];
            });
    },
    methods: {
        pretty,
        shortHashFilter,
    },
};
</script>

<template>
    <div>
        <h2 class="dashboard__category-title u-mb-15">
            <img class="dashboard__category-icon" src="/img/icon-category-portfolio.svg" alt="" role="presentation">
            <span v-if="owner === $store.getters.address">{{ $td('Manage portfolios', `portfolio.list-managed-title`) }}</span>
            <span v-else>{{ $td('Portfolios', `portfolio.list-title`) }}</span>
        </h2>
        <div v-if="$fetchState.pending" class="u-text-center">
            <BaseLoader class="" :is-loading="true"/>
        </div>
        <div v-else-if="$fetchState.error" class="u-text-center">Can't get portfolio list</div>
        <div v-else-if="portfolioList.length === 0" class="u-text-center">{{ $td('You don\'t have any portfolios yet', 'portfolio.list-managed-empty') }}</div>
        <div class="u-grid u-grid--vertical-margin" v-else-if="portfolioList.length">
            <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="portfolio in portfolioList" :key="portfolio.id">
                <div class="card card--action card__content--small">
                    <PortfolioHead :portfolio="portfolio"/>

                    <div class="card__token-list u-mt-10">
                        <img
                            class="card__token-logo"
                            v-for="coin in portfolio.coins"
                            :key="coin.id"
                            :src="$store.getters['explorer/getCoinIcon'](coin.id)"
                            :alt="$store.getters['explorer/getCoinSymbol'](coin.id)"
                        >
                    </div>

                    <nuxt-link class="u-mt-10 button button--main button--full" :to="$i18nGetPreferredPath(`/portfolio/${portfolio.id}`)">
                        {{ $td('Buy', 'portfolio.buy-button') }}
                    </nuxt-link>
                </div>
            </div>
        </div>
    </div>
</template>
