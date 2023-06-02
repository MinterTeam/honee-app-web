<script>
import MetagardenGame from '~/components/MetagardenGame.vue';
import MetagardenSpotCard from '~/components/MetagardenSpotCard.vue';
//import MetagardenSwHoldCard from '~/components/CardSwHold.vue';
import MetagardenMeganetCard from '~/components/CardMeganet.vue';
import MetagardenLootboxCard from '~/components/MetagardenLootboxCard.vue';
import MetagardenStakingCard from '~/components/CardMetagardenStaking.vue';

export default {
    layout: 'metagarden',
    components: {
        MetagardenGame,
        MetagardenSpotCard,
        //MetagardenSwHoldCard,
        MetagardenMeganetCard,
        MetagardenLootboxCard,
        MetagardenStakingCard,
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

        <MetagardenMeganetCard class="u-mt-10"/>

        <MetagardenStakingCard/>

        <!--<MetagardenSwHoldCard class="u-mt-10" coin="METAGARDEN" :is-small="false"/>-->
    </MetagardenGame>
</template>
