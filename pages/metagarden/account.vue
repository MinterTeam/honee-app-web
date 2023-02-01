<script>
import MetagardenSpotCard from '~/components/MetagardenSpotCard.vue';
import MetagardenLootboxCard from '~/components/MetagardenLootboxCard.vue';

export default {
    components: {
        MetagardenSpotCard,
        MetagardenLootboxCard,
    },
    head: {
        htmlAttrs: {
            class: 'metagarden-layout',
        },
    },
};
</script>

<template>
    <div class="u-container--small">
        <MetagardenSpotCard/>

        <MetagardenLootboxCard class="u-mt-10"/>
    </div>
</template>
