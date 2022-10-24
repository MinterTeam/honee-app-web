<script>
import {differenceInCalendarISOWeeks} from 'date-fns';
import {PORTFOLIO_PROFIT_PERIOD} from '~/api/portfolio.js';
import BaseTabs from '~/components/base/BaseTabs.vue';
import PortfolioBattleTable from '~/components/PortfolioBattleTable.vue';

const BATTLE_START = new Date('2022-10-24T00:00:00Z');
const WEEK_NUMBER = differenceInCalendarISOWeeks(new Date(), BATTLE_START) + 1;

export default {
    PORTFOLIO_PROFIT_PERIOD,
    WEEK_NUMBER,
    components: {
        // BaseTabs,
        PortfolioBattleTable,
    },
    props: {
        limit: {
            type: [Number, String],
        },
    },
    data() {
        return {
            selectedType: PORTFOLIO_PROFIT_PERIOD.WTD,
        };
    },
};
</script>

<template>
    <div>
        <h2 class="u-h1 u-mb-15">
            {{ $td('Portfolio battle', `portfolio.battle-title`) }} #{{ $options.WEEK_NUMBER }}
        </h2>

        <div class="card card__content">
<!--
            <BaseTabs
                class="u-mb-15"
                v-model="selectedType"
                :tabs="[
                    {value: $options.PORTFOLIO_PROFIT_PERIOD.WTD, label: $td('Current week', 'portfolio.tabs-label-battle-current')},
                    {value: $options.PORTFOLIO_PROFIT_PERIOD.WEEKLY, label: $td('Previous winners', 'portfolio.tabs-label-battle-previous')},
                ]"
            />
-->

            <PortfolioBattleTable
                :profit-period="selectedType"
                :limit="limit"
                :page="$route.query.page"
            />

            <div class="u-text-right u-mt-15" v-if="limit">
                <nuxt-link class="link--default" :to="$i18nGetPreferredPath('/portfolio/battle')">
                    {{ $td('View all', 'portfolio.leaderboard-view-all') }}
                </nuxt-link>
            </div>
        </div>
    </div>
</template>
