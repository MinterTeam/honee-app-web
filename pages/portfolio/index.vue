<script>
import BaseTabs from '~/components/base/BaseTabs.vue';
import PortfolioList, {PORTFOLIO_LIST_TYPE} from '~/components/PortfolioList.vue';

export default {
    PORTFOLIO_LIST_TYPE,
    components: {
        BaseTabs,
        PortfolioList,
    },
    data() {
        const queryTab = Object.values(PORTFOLIO_LIST_TYPE).includes(this.$route.query.tab) ? this.$route.query.tab : '';

        return {
            selectedType: queryTab || PORTFOLIO_LIST_TYPE.DAILY7,
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--large">
        <h2 class="u-h1 u-mb-15">
            {{ $td('Portfolios', `portfolio.list-title`) }}
        </h2>

        <BaseTabs
            class="u-mb-15"
            v-model="selectedType"
            :tabs="[
                {value: $options.PORTFOLIO_LIST_TYPE.DAILY7, label: $td('Last 7 days', 'portfolio.tabs-label-7d')},
                {value: $options.PORTFOLIO_LIST_TYPE.AWP, label: $td('Average weekly profit', 'portfolio.tabs-label-awp')},
                {value: $options.PORTFOLIO_LIST_TYPE.APY, label: $td('APY', 'portfolio.tabs-label-apy')},
            ]"
            :reset-pages="true"
        />

        <PortfolioList
            :key="selectedType"
            :type="selectedType"
            :page="$route.query.page"
            :show-pagination="true"
            :show-title="false"
        />
    </div>
</template>
