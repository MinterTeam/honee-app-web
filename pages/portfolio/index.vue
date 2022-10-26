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
            selectedType: PORTFOLIO_LIST_TYPE.ALL,
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
                {value: $options.PORTFOLIO_LIST_TYPE.ALL, label: $td('All', 'portfolio.tabs-label-all')},
                {value: $options.PORTFOLIO_LIST_TYPE.TOP, label: $td('Top', 'portfolio.tabs-label-top')},
                {value: $options.PORTFOLIO_LIST_TYPE.RECOMMEND, label: $td('Recommended', 'portfolio.tabs-label-recommend')},
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
