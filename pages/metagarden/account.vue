<script>
import AddressAssets from '~/components/AddressAssets.vue';
import MetagardenSpotCard from '~/components/MetagardenSpotCard.vue';
import MetagardenMeganetCard from '~/components/CardMeganet.vue';
import MetagardenSwHoldCard from '~/components/CardSwHold.vue';

export default {
    layout: 'metagarden',
    components: {
        AddressAssets,
        MetagardenMeganetCard,
        MetagardenSpotCard,
        MetagardenSwHoldCard,
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
        backToHonee() {
            this.$store.commit('SET_METAGARDEN', false);
            this.$router.push(this.$i18nGetPreferredPath('/'));
        },
    },
};
</script>

<template>
    <div>
        <AddressAssets class="card--metagarden u-mb-10"/>

        <MetagardenMeganetCard/>

        <MetagardenSpotCard/>

        <MetagardenSwHoldCard class="u-mt-10" coin="METAGARDEN" :is-small="false"/>

        <button type="button" class="button button--full button--ghost-red u-mt-10" @click="logout()">{{ $td('Logout', 'common.logout') }}</button>

        <button type="button" class="button button--full button--ghost u-mt-10" @click="backToHonee()">
            <img class="button__icon" src="/favicon.png" width="24" height="24" alt="" role="presentation" style="border-radius: 50%;">
            {{ $td('Go to Honee', 'metagarden.back-to-honee') }}
        </button>
    </div>
</template>
