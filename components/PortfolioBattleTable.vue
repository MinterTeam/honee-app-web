<script>
import {getPortfolioBattleWeek, BATTLE_CURRENT_WEEK_NUMBER} from '~/api/portfolio.js';
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
        /*
        profitPeriod: {
            type: String,
            default: PORTFOLIO_PROFIT_PERIOD.WTD,
        },
        */
        week: {
            type: [String, Number],
            default: BATTLE_CURRENT_WEEK_NUMBER,
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

        return getPortfolioBattleWeek(this.week, {
            limit: this.limit,
            page,
        })
            .then((portfolioInfo) => {
                this.portfolioList = Object.freeze(portfolioInfo.list);
                this.paginationInfo = Object.freeze(portfolioInfo.pagination) || undefined;
                // this.$emit('update:portfolio-list', this.portfolioList);
            });
    },
    computed: {
        isCurrentWeek() {
            return typeof this.week === 'undefined';
        },
        isHistoryWeek() {
            return !this.isCurrentWeek;
        },
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
        getBalance(portfolio) {
            /*
            const totalProfit = this.isCurrentWeek ? portfolio.totalProfit : portfolio.profit;
            */
            const totalProfit = portfolio.totalProfit;
            const coefficient = 1 + (this.getProfitValue(totalProfit) / 100);
            return prettyUsd(coefficient * 100);
        },
        getProfitValue(profit) {
            return profit;
            /*
            const isPrimitive = typeof profit === 'string' || typeof profit === 'number';
            return isPrimitive ? profit : profit[this.profitPeriod];
            */
        },
        getProfitColorClass(profit) {
            profit = this.getProfitValue(profit);
            if (profit > 0) {
                return 'u-text-green';
            }
            if (profit < 0) {
                return 'u-text-red';
            }
            return '';
        },
        getProfitText(profit) {
            profit = this.getProfitValue(profit);
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
                        <div class="portfolio__leaderboard-rank" :class="`portfolio__leaderboard-icon--${getRank(index)}`">{{ getRank(index) }}</div>
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
                <div class="battle__ranking-item" v-for="(portfolio, index) in portfolioList" :key="portfolio.id">
                    <div class="portfolio__leaderboard-rank" :class="`portfolio__leaderboard-icon--${getRank(index)}`">{{ getRank(index) }}</div>
                    <div class="u-flex u-flex--justify-between u-mt-05">
                        <div>
                            <nuxt-link class="link--hover u-fw-600" :to="$i18nGetPreferredPath(`/portfolio/${portfolio.id}`)">
                                {{ portfolio.title }}
                            </nuxt-link>
                            <div class="u-fw-700 u-text-medium u-text-muted">
                                {{ shortHashFilter(portfolio.owner) }}
                            </div>
                            <div class="card__token-list u-mt-10">
                                <img
                                    class="card__token-logo"
                                    v-for="coin in portfolio.coins"
                                    :key="coin.id"
                                    :src="$store.getters['explorer/getCoinIcon'](coin.id)"
                                    :alt="$store.getters['explorer/getCoinSymbol'](coin.id)"
                                >
                            </div>
                        </div>
                        <div class="u-text-right">
                            <div class="u-h--uppercase wallet__stake-row-title">
                                {{ $td('Total value, $', 'portfolio.battle-column-balance') }}
                            </div>
                            <div>{{ getBalance(portfolio) }}</div>

                            <div class="u-h--uppercase wallet__stake-row-title u-mt-05">
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
