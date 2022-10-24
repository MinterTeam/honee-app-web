<script>
import {getPortfolioList, PORTFOLIO_PROFIT_PERIOD} from '~/api/portfolio.js';
import {getErrorText} from '~/assets/server-error.js';
import {prettyUsd, shortHashFilter} from '~/assets/utils.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import PortfolioPagination from '~/components/PortfolioPagination.vue';

export default {
    components: {
        BaseLoader,
        PortfolioPagination,
    },
    props: {
        profitPeriod: {
            type: String,
            default: PORTFOLIO_PROFIT_PERIOD.WEEKLY,
        },
        limit: {
            type: [Number, String],
            default: 100,
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
    ],
    data() {
        return {
            /** @type {Array<Portfolio>} */
            portfolioList: [],
            paginationInfo: undefined,
        };
    },
    fetch() {
        const page = this.page || 1;
        const listPromise = getPortfolioList({
            profitPeriod: this.profitPeriod,
            limit: this.limit,
            page,
        });

        return listPromise
            .then((portfolioInfo) => {
                this.portfolioList = Object.freeze(portfolioInfo.list);
                this.paginationInfo = Object.freeze(portfolioInfo.pagination) || undefined;
                // this.$emit('update:portfolio-list', this.portfolioList);
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
        shortHashFilter,
        getErrorText,
        // @TODO should be from portfolio creation date
        getBalance(portfolio) {
            const coefficient = 1 + (portfolio.profit[this.profitPeriod] / 100);
            return prettyUsd(coefficient * 100);
        },
        getProfitColorClass(profit) {
            profit = profit[this.profitPeriod];
            if (profit > 0) {
                return 'u-text-green';
            }
            if (profit < 0) {
                return 'u-text-red';
            }
            return '';
        },
        getProfitText(profit) {
            profit = profit[this.profitPeriod];
            if (!profit && profit !== 0) {
                return '—';
            } else {
                return prettyUsd(profit) + '%';
            }
        },
        getRank(index) {
            const pageOffset = ((this.page || 1) - 1) * this.limit;
            return pageOffset + index + 1;
        },
    },
};
</script>

<template>
    <div>
        <div v-if="$fetchState.pending" class="u-text-center">
            <BaseLoader class="" :is-loading="true"/>
        </div>
        <div v-else-if="$fetchState.error">
            Can't get list <br>
            {{ getErrorText($fetchState.error) }}
        </div>
        <div v-else-if="portfolioList.length === 0" class="u-text-center">Empty list</div>
        <div class="table-wrap" v-else-if="portfolioList.length">
            <table class="u-hidden-medium-down">
                <thead>
                <tr>
                    <th colspan="2">{{ $td('Portfolio', 'portfolio.battle-column-portfolio') }}</th>
                    <th>{{ $td('Tokens', 'portfolio.battle-column-tokens') }}</th>
                    <th>{{ $td('Total value, $', 'portfolio.battle-column-balance') }}</th>
                    <th class="u-text-right">{{ $td('Profit', 'portfolio.battle-column-profit') }}</th>
                </tr>
                </thead>
                <tbody class="u-fw-600">
                <tr v-for="(portfolio, index) in portfolioList" :key="portfolio.id">
                    <td class="u-text-center" width="1">
                        <div class="portfolio__leaderboard-icon" :class="`portfolio__leaderboard-icon--${getRank(index)}`">{{ getRank(index) }}</div>
                    </td>
                    <td width="30%">
                        <nuxt-link class="link--hover u-fw-600" :to="$i18nGetPreferredPath(`/portfolio/${portfolio.id}`)">
                            {{ portfolio.title }}
                        </nuxt-link>
                        <div class="u-fw-700 u-text-medium u-text-muted u-mt-025">
                            {{ shortHashFilter(portfolio.owner) }}
                        </div>
                    </td>
                    <td>
                        <div class="card__token-list">
                            <img
                                class="card__token-logo"
                                v-for="coin in portfolio.coins"
                                :key="coin.id"
                                :src="$store.getters['explorer/getCoinIcon'](coin.id)"
                                :alt="$store.getters['explorer/getCoinSymbol'](coin.id)"
                            >
                        </div>
                    </td>
                    <td>{{ getBalance(portfolio) }}</td>
                    <td class="u-text-right" :class="getProfitColorClass(portfolio.profit)">
                        {{ getProfitText(portfolio.profit) }}
                    </td>
                </tr>
                </tbody>
            </table>
            <div class="u-hidden-medium-up u-fw-600">
                <div class="wallet__stake-item" v-for="(portfolio, index) in portfolioList" :key="portfolio.id">
                    <div class="wallet__stake-row">
                        <div class="portfolio__leaderboard-address">
                            <div class="portfolio__leaderboard-icon" :class="`portfolio__leaderboard-icon--${index + 1}`">{{ index + 1 }}</div>
                            <div class="portfolio__leaderboard-address-value">
                                <nuxt-link class="link--hover u-fw-600" :to="`/portfolio/${portfolio.id}`">
                                    {{ portfolio.title }}
                                </nuxt-link>
                                <div class="u-fw-700 u-text-medium u-text-muted">
                                    {{ shortHashFilter(portfolio.owner) }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="wallet__stake-row">
                        <div class="card__token-list">
                            <img
                                class="card__token-logo"
                                v-for="coin in portfolio.coins"
                                :key="coin.id"
                                :src="$store.getters['explorer/getCoinIcon'](coin.id)"
                                :alt="$store.getters['explorer/getCoinSymbol'](coin.id)"
                            >
                        </div>
                    </div>
                    <div class="wallet__stake-row">
                        <div>
                            <div class="u-h--uppercase wallet__stake-row-title">
                                {{ $td('Total value, $', 'portfolio.battle-column-balance') }}
                            </div>
                            <div>{{ getBalance(portfolio) }}</div>
                        </div>
                        <div class="u-text-right">
                            <div class="u-h--uppercase wallet__stake-row-title">
                                {{ $td('Profit', 'portfolio.battle-column-profit') }}
                            </div>
                            <div :class="getProfitColorClass(portfolio.profit)">
                                {{ getProfitText(portfolio.profit) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <PortfolioPagination v-if="showPagination" class="u-mt-15" :pagination-info="paginationInfo" :is-loading="$fetchState.pending"/>
    </div>
</template>
