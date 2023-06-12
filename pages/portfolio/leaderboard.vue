<script>
import PortfolioLeaderboard from '~/components/PortfolioLeaderboard.vue';

export default {
    layout(context) {
        return context.store.getters.isPKAuthorized ? 'default' : 'splash-index';
    },
    components: {
        PortfolioLeaderboard,
    },
    data() {
        return {
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--large">
        <PortfolioLeaderboard/>
    </div>
</template>
