<script>
import AddressAssets from '~/components/AddressAssets.vue';
import MetagardenSpotCard from '~/components/MetagardenSpotCard.vue';
import MetagardenLootboxCard from '~/components/MetagardenLootboxCard.vue';

export default {
    layout: 'metagarden',
    components: {
        AddressAssets,
        MetagardenSpotCard,
        MetagardenLootboxCard,
    },
    /*
    head: {
        htmlAttrs: {
            class: 'metagarden-layout theme--metagarden',
        },
    },
    */
};
</script>

<template>
    <div>
        <AddressAssets class="card--metagarden u-mb-10"/>

        <MetagardenSpotCard/>

        <MetagardenLootboxCard class="u-mt-10"/>
    </div>
</template>
