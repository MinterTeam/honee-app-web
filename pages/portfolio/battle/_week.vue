<script>
import PortfolioBattleTable from '~/components/PortfolioBattleTable.vue';

export default {
    layout(context) {
        return context.store.getters.isPKAuthorized ? 'default' : 'splash-index';
    },
    components: {
        PortfolioBattleTable,
    },
    props: {
    },
    data() {
        return {
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--large">
        <h2 class="u-h2 u-mb-15">
            {{ $td(`Week #${$route.params.week} Results`, `battle.week-results-title`, {week: $route.params.week}) }}
        </h2>

        <PortfolioBattleTable
            class="card card__content"
            :week="$route.params.week"
            :show-pagination="false"
        />
    </div>
</template>

