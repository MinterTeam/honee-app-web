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
        <h2 class="u-h2 u-mb-15">
            {{ $td('Portfolio Battle', `portfolio.battle-title`) }}
        </h2>
        <div class="subtitle u-mb-15">
            <template v-if="$i18n.locale === 'en'">
                <p>Contest participants create their portfolios with 100 virtual dollars, choosing the coins they think are the most promising. Every week, the top 3 best portfolios receive fixed prizes. In addition, the Top 20 receive a guaranteed airdrop. <a href="https://honee.app/portfolio-battle" target="_blank" class="link--default">Learn more about the portfolio battle</a>.</p>
            </template>
            <template v-if="$i18n.locale === 'ru'">
                <p>Участники конкурса на 100 виртуальных долларов создают свои портфели, выбрав наиболее перспективные на их взгляд монеты. Каждую неделю выбирается Топ-3 лучших портфеля, которые получают фиксированные призы. Кроме того, Топ-20 получают гарантированный аирдроп. <a href="https://honee.app/ru/portfolio-battle" target="_blank" class="link--default">Подробнее о битве портфелей</a>.</p>
            </template>
        </div>
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

