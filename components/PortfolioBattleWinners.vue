<script>
import {getPortfolioBattleWeek, BATTLE_CURRENT_WEEK_NUMBER} from '~/api/portfolio.js';
import {getErrorText} from '~/assets/server-error.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import PortfolioHead from '~/components/PortfolioHead.vue';

export default {
    components: {
        BaseLoader,
        PortfolioHead,
    },
    props: {

    },
    emits: [
    ],
    data() {
        return {
            /** @type {Array<{week: number, portfolio: Portfolio}>} */
            winners: [],
        };
    },
    fetch() {
        let weeks = Array.from({length: BATTLE_CURRENT_WEEK_NUMBER - 1}, (item, index) => index + 1)
            .sort((a, b) => b - a);
        /**
         * @type {Array<Promise<{week: number, portfolio: Portfolio}>>}
         */
        const winnersPromiseList = weeks.map((weekNumber) => {
            return getPortfolioBattleWeek(weekNumber, {skipTotalProfit: true})
                .then((portfolioInfo) => {
                    return {
                        week: weekNumber,
                        portfolio: portfolioInfo.list[0],
                    };
                });
        });

        return Promise.all(winnersPromiseList)
            .then((winners) => {
                this.winners = Object.freeze(winners);
                // this.$emit('update:portfolio-list', this.portfolioList);
            });
    },

    methods: {
        getErrorText,

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
        <div class="u-grid u-grid--vertical-margin" v-else>
            <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3" v-for="{portfolio, week} in winners" :key="week">
                <div class="card card--simple-border card__content--small">
                    <PortfolioHead
                        :portfolio="portfolio"
                        :profit-caption="$td(`Week #${week}`, 'battle.week-profit-caption', {week})"
                    />
                    <nuxt-link class="button button--full button--main u-mt-10" :to="$i18nGetPreferredPath(`/portfolio/battle/${week}`)">
                        {{ $td('Results', 'battle.week-results-button') }}
                    </nuxt-link>
                </div>
            </div>
        </div>
    </div>
</template>
