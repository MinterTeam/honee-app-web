<script>
import PortfolioBattleTable from '~/components/PortfolioBattleTable.vue';

export default {
    layout: 'embed',
    components: {
        PortfolioBattleTable,
    },
};
</script>

<template>
    <PortfolioBattleTable :limit="10"/>
</template>
