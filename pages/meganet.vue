<script>
import TopupCoinOptions from '~/components/TopupCoinOptions.vue';

export default {
    components: {
        TopupCoinOptions,
    },
    head: {
        bodyAttrs: {
            class: 'megachain__body',
        },
    },
    fetch() {
        // this.$store.commit('SET_METAGARDEN');
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
            // this.$store.commit('SET_METAGARDEN', false);
            this.$router.push(this.$i18nGetPreferredPath('/'));
        },
    },
};
</script>

<template>
    <div class="u-text-center">
        <img class="u-image u-mb-10" src="/img/logo-megachain-side.svg" alt="Metagarden Chain" width="265" height="48">
        <h1 class="u-h4 u-mb-15">{{ $td('Buy MEGANET tokens to join the Metagarden Chain with a 100% bonus.', 'meganet.buy-text') }}</h1>


        <TopupCoinOptions coin="MEGANET" button-class="button--main"/>

        <button type="button" class="button button--full button--ghost-red u-mt-10" @click="logout()">{{ $td('Logout', 'common.logout') }}</button>
    </div>
</template>
