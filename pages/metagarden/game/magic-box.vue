<script>
import MetagardenGame from '~/components/MetagardenGame.vue';
import MetagardenLootboxCard from '~/components/MetagardenLootboxCard.vue';

export default {
    layout: 'metagarden',
    components: {
        MetagardenGame,
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
    </MetagardenGame>
</template>
