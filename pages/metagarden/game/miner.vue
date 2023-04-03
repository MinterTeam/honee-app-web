<script>
import MetagardenGame from '~/components/MetagardenGame.vue';
import MetagardenSpotCard from '~/components/MetagardenSpotCard.vue';
import MetagardenSwHoldCard from '~/components/MetagardenSwHoldCard.vue';

export default {
    layout: 'metagarden',
    components: {
        MetagardenGame,
        MetagardenSpotCard,
        MetagardenSwHoldCard,
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

        <MetagardenSwHoldCard class="u-mt-10"/>
    </MetagardenGame>
</template>
