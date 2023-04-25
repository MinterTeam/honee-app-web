<script>
import MetagardenGame from '~/components/MetagardenGame.vue';
import MetagardenSpotCard from '~/components/MetagardenSpotCard.vue';
import MetagardenSwHoldCard from '~/components/CardSwHold.vue';
import MetagardenLootboxCard from '~/components/MetagardenLootboxCard.vue';

export default {
    layout: 'metagarden',
    components: {
        MetagardenGame,
        MetagardenSpotCard,
        MetagardenSwHoldCard,
        MetagardenLootboxCard,
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
        <MetagardenLootboxCard/>

        <MetagardenSpotCard class="u-mt-10" :hide-head="false"/>

        <MetagardenSwHoldCard class="u-mt-10" coin="METAGARDEN" :is-small="false"/>
    </MetagardenGame>
</template>
