<script>
import {shortHashFilter} from '~/assets/utils.js';
import {getPortfolioList} from '~/api/portfolio.js';

export default {
    data() {
        return {
            portfolioList: [],
        };
    },
    fetch() {
        return getPortfolioList({owner: this.$store.getters.address})
            .then((portfolioInfo) => {
                this.portfolioList = portfolioInfo.list;
            });
    },
    methods: {
        shortHashFilter,
    },
};
</script>

<template>
    <div>
        <h2 class="dashboard__category-title u-mb-15">
            <img class="dashboard__category-icon" src="/img/icon-category-portfolio.svg" alt="" role="presentation">
            <span>{{ $td('My portfolios', `portfolio.my-list-title`) }}</span>
        </h2>
        <div class="u-grid u-grid--vertical-margin" v-if="portfolioList.length && !$fetchState.pending">
            <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="portfolio in portfolioList" :key="portfolio.id">
                <div class="card card--action card__content--small">
                    <div class="card__action-head">
                        <div class="card__action-title">
                            <div class="card__action-title-type">#{{ portfolio.id }}</div>
                            <div class="card__action-title-value">{{ portfolio.title }}</div>
                        </div>
<!--                        <div class="card__action-stats">
                            <div class="card__action-stats-caption">{{ statsCaption }}</div>
                            <div class="card__action-stats-value">{{ statsValue }}</div>
                        </div>-->
                    </div>
                    <div class="card__action-description u-mt-05 u-text-muted">By {{ shortHashFilter(portfolio.owner) }}</div>
                    <p class="card__action-description">{{ portfolio.description }}</p>

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
        <div v-else>{{ $td('You don\'t have any portfolios yet', 'portfolio.my-list-empty') }}</div>

        <nuxt-link class="button button--ghost-main button--full u-mt-20" :to="$i18nGetPreferredPath('/portfolio/new')">+ {{ $td('Create you own portfolio', 'portfolio.create-new-link') }}</nuxt-link>
    </div>
</template>
