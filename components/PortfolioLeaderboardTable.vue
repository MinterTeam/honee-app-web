<script>
import {getLeaderboard, PORTFOLIO_PROFIT_PERIOD} from '~/api/portfolio.js';
import {getErrorText} from '~/assets/server-error.js';
import {prettyUsd, shortHashFilter} from '~/assets/utils.js';
import BaseLoader from '~/components/base/BaseLoader.vue';

export default {
    components: {
        BaseLoader,
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
    },
    emits: [
    ],
    data() {
        return {
            /** @type {Array<ConsumerPortfolio>} */
            portfolioList: [],
            paginationInfo: undefined,
        };
    },
    fetch() {
        const page = this.page || 1;
        const listPromise = getLeaderboard({
            profitPeriod: this.profitPeriod,
            limit: this.limit,
            // page,
        });

        return listPromise
            .then((portfolioInfo) => {
                this.portfolioList = Object.freeze(portfolioInfo.list);
                // this.paginationInfo = Object.freeze(portfolioInfo.pagination) || undefined;
                // this.$emit('update:portfolio-list', this.portfolioList);
            });
    },
    watch: {
        /*
        page: {
            handler() {
                this.$fetch();
                window.scroll(0, 0);
            },
        },
        */
    },
    methods: {
        shortHashFilter,
        getErrorText,
        getProfitColorClass(profit) {
            if (profit > 0) {
                return 'u-text-green';
            }
            if (profit < 0) {
                return 'u-text-red';
            }
            return '';
        },
        getProfitText(profit) {
            if (!profit && profit !== 0) {
                return '—';
            } else {
                return prettyUsd(profit) + '%';
            }
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
            Can't get leaderboard <br>
            {{ getErrorText($fetchState.error) }}
        </div>
        <div v-else-if="portfolioList.length === 0" class="u-text-center">Empty list</div>
        <div class="table-wrap" v-else-if="portfolioList.length">
            <table class="u-hidden-medium-down">
                <thead>
                <tr>
                    <th colspan="2">{{ $td('Address', 'portfolio.leaderboard-column-address') }}</th>
                    <th>{{ $td('Portfolio ID', 'portfolio.leaderboard-column-portfolio') }}</th>
                    <th class="u-text-right">{{ $td('Profit', 'portfolio.leaderboard-column-profit') }}</th>
                </tr>
                </thead>
                <tbody class="u-fw-600">
                <tr v-for="(portfolio, index) in portfolioList" :key="portfolio.isolatedAddress">
                    <td class="u-text-center" width="1">
                        <div class="portfolio__leaderboard-icon" :class="`portfolio__leaderboard-icon--${index + 1}`">{{ index + 1 }}</div>
                    </td>
                    <td width="30%">
                        {{ shortHashFilter(portfolio.isolatedAddress) }}
                    </td>
                    <td>
                        <nuxt-link class="link--default" :to="`/portfolio/${portfolio.id}`">#{{ portfolio.id }}</nuxt-link>
                    </td>
                    <td class="u-text-right" :class="getProfitColorClass(portfolio.profit)">
                        {{ getProfitText(portfolio.profit) }}
                    </td>
                </tr>
                </tbody>
            </table>
            <div class="u-hidden-medium-up u-fw-600">
                <div class="wallet__stake-item" v-for="(portfolio, index) in portfolioList" :key="portfolio.isolatedAddress">
                    <div class="wallet__stake-row">
                        <div class="portfolio__leaderboard-address">
                            <div class="portfolio__leaderboard-icon" :class="`portfolio__leaderboard-icon--${index + 1}`">{{ index + 1 }}</div>
                            <div class="portfolio__leaderboard-address-value">
                                {{ shortHashFilter(portfolio.isolatedAddress) }}
                            </div>
                        </div>
                    </div>
                    <div class="wallet__stake-row">
                        <div>
                            <div class="u-h--uppercase wallet__stake-row-title">
                                {{ $td('Portfolio ID', 'portfolio.leaderboard-column-portfolio') }}
                            </div>
                            <nuxt-link class="link--default" :to="`/portfolio/${portfolio.id}`">#{{ portfolio.id }}</nuxt-link>
                        </div>
                        <div class="u-text-right">
                            <div class="u-h--uppercase wallet__stake-row-title">
                                {{ $td('Profit', 'portfolio.leaderboard-column-profit') }}
                            </div>
                            <div :class="getProfitColorClass(portfolio.profit)">
                                {{ getProfitText(portfolio.profit) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
