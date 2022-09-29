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
        return {
            selectedType: PORTFOLIO_LIST_TYPE.TOP,
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--large">
        <BaseTabs
            class="u-mb-15"
            v-model="selectedType"
            :tabs="[
                {value: $options.PORTFOLIO_LIST_TYPE.TOP, label: $td('Top portfolios', 'portfolio.list-top-title')},
                {value: $options.PORTFOLIO_LIST_TYPE.ALL, label: $td('All portfolios', 'portfolio.list-all-title')},
            ]"
        />

        <PortfolioList :page="$route.query.page" :show-pagination="true" :type="selectedType" :key="selectedType"/>
    </div>
</template>
