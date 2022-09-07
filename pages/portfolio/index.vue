<script>
import PortfolioList from '~/components/PortfolioList.vue';

export default {
    components: {
        PortfolioList,
    },
};
</script>

<template>
    <div class="u-section u-container u-container--large">
        <PortfolioList :page="$route.query.page" :show-pagination="true"/>
    </div>
</template>
