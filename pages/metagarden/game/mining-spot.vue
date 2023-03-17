<script>
import MetagardenGame from '~/components/MetagardenGame.vue';
import MetagardenSpotCard from '~/components/MetagardenSpotCard.vue';

export default {
    layout: 'metagarden',
    components: {
        MetagardenGame,
        MetagardenSpotCard,
    },
    data() {
        return {
        };
    },
    computed: {
    },
};
</script>

<template>
    <MetagardenGame>
        <MetagardenSpotCard :hide-head="true"/>
    </MetagardenGame>
</template>
