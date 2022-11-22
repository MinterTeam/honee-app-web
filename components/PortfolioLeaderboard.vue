<script>
import {PORTFOLIO_PROFIT_PERIOD} from '~/api/portfolio.js';
import BaseTabs from '~/components/base/BaseTabs.vue';
import PortfolioLeaderboardTable from '~/components/PortfolioLeaderboardTable.vue';

export default {
    PORTFOLIO_PROFIT_PERIOD,
    components: {
        BaseTabs,
        PortfolioLeaderboardTable,
    },
    props: {
        limit: {
            type: [Number, String],
        },
    },
    data() {
        return {
            selectedType: PORTFOLIO_PROFIT_PERIOD.WEEKLY,
        };
    },
};
</script>

<template>
    <div>
        <h2 class="u-h1 u-mb-15">
            {{ $td('Users’ profit', `portfolio.leaderboard-title`) }}
        </h2>

        <div class="card card__content">
            <BaseTabs
                class="u-mb-15"
                v-model="selectedType"
                :tabs="[
                    // {value: $options.PORTFOLIO_PROFIT_PERIOD.WTD, label: $td('Live', 'portfolio.tabs-label-live')},
                    {value: $options.PORTFOLIO_PROFIT_PERIOD.WEEKLY, label: $td('Last week', 'portfolio.tabs-label-weekly')},
                ]"
            />

            <PortfolioLeaderboardTable
                :key="selectedType"
                :profit-period="selectedType"
                :limit="limit"
            />

            <div class="u-text-right u-mt-15" v-if="limit">
                <nuxt-link class="link--default" :to="$i18nGetPreferredPath('/portfolio/leaderboard')">
                    {{ $td('View all', 'portfolio.leaderboard-view-all') }}
                </nuxt-link>
            </div>
        </div>
    </div>
</template>
