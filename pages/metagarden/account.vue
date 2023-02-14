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
    fetch() {
        this.$store.commit('SET_METAGARDEN');
    },
    /*
    head: {
        htmlAttrs: {
            class: 'metagarden-layout theme--metagarden',
        },
    },
    */
    methods: {
        logout() {
            this.$store.commit('LOGOUT');
            this.$router.push(this.$i18nGetPreferredPath('/auth'));
        },
    },
};
</script>

<template>
    <div>
        <AddressAssets class="card--metagarden u-mb-10"/>

        <MetagardenSpotCard/>

        <MetagardenLootboxCard class="u-mt-10"/>

        <button type="button" class="button button--full button--ghost-red u-mt-10" @click="logout()">{{ $td('Logout', 'common.logout') }}</button>
    </div>
</template>
