<script>
import {BATTLE_CURRENT_WEEK_NUMBER, PORTFOLIO_PROFIT_PERIOD} from '~/api/portfolio.js';
import BaseTabs from '~/components/base/BaseTabs.vue';
import PortfolioBattleTable from '~/components/PortfolioBattleTable.vue';
import PortfolioBattleWinners from '~/components/PortfolioBattleWinners.vue';

const BATTLE_TAB = {
    CURRENT: 'current',
    WINNERS: 'winners',
};

export default {
    PORTFOLIO_PROFIT_PERIOD,
    BATTLE_TAB,
    BATTLE_CURRENT_WEEK_NUMBER,
    layout(context) {
        return context.store.getters.isAuthorized ? 'default' : 'splash-index';
    },
    components: {
        BaseTabs,
        PortfolioBattleTable,
        PortfolioBattleWinners,
    },
    props: {
        limit: {
            type: [Number, String],
        },
    },
    data() {
        const queryTab = Object.values(BATTLE_TAB).includes(this.$route.query.tab) ? this.$route.query.tab : '';

        return {
            selectedTab: queryTab || BATTLE_TAB.CURRENT,
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--large">
        <h2 class="u-h1 u-mb-15">
            {{ $td('Portfolio battle', `portfolio.battle-title`) }}
        </h2>

        <div class="card card__content">
            <BaseTabs
                v-if="$options.BATTLE_CURRENT_WEEK_NUMBER > 1"
                class="u-mb-15"
                v-model="selectedTab"
                :tabs="[
                    {value: $options.BATTLE_TAB.CURRENT, label: $td('Current week', 'portfolio.tabs-label-battle-current') + ` #${ $options.BATTLE_CURRENT_WEEK_NUMBER }`},
                    {value: $options.BATTLE_TAB.WINNERS, label: $td('Previous winners', 'portfolio.tabs-label-battle-previous')},
                ]"
            />

            <KeepAlive>
                <PortfolioBattleTable
                    v-if="selectedTab === $options.BATTLE_TAB.CURRENT"
                    :profit-period="$options.PORTFOLIO_PROFIT_PERIOD.WTD"
                    :limit="limit"
                    :page="$route.query.page"
                    :show-pagination="!limit"
                />
                <PortfolioBattleWinners v-else/>
            </KeepAlive>
        </div>
    </div>
</template>

