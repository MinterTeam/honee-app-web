<script>
import {getPortfolioBattleHistory, BATTLE_CURRENT_WEEK_NUMBER} from '~/api/portfolio.js';
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
            /** @type {Object<string, Portfolio>} */
            winners: {},
        };
    },
    fetch() {
        // const page = this.page || 1;
        //@TODO
        let weeks = [BATTLE_CURRENT_WEEK_NUMBER - 1];
        /**
         * @type {Array<Promise<[string,Portfolio]>>}
         */
        const winnersPromiseList = weeks.map((weekNumber) => {
            return Promise.all([
                weekNumber.toString(),
                getPortfolioBattleHistory(weekNumber).then((portfolioInfo) => portfolioInfo.list[0]),
            ]);
        });

        return Promise.all(winnersPromiseList)
            .then((winnersEntries) => {
                this.winners = Object.freeze(Object.fromEntries(winnersEntries));
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
            <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3" v-for="(portfolio, week) in winners" :key="portfolio.id">
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
