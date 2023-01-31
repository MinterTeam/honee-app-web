<script>
import MetagardenSpotCard from '~/components/MetagardenSpotCard.vue';

export default {
    components: {
        MetagardenSpotCard,
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
    </div>
</template>
