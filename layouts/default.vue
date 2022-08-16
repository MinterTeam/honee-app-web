<script>
import TheHeader from '~/layouts/_header.vue';
import TheFooter from '~/layouts/_footer.vue';
import ConnectionNotice from '~/components/ConnectionNotice.vue';
import Snackbar from '~/components/base/Snackbar.vue';

export default {
    components: {
        TheHeader,
        TheFooter,
        ConnectionNotice,
        Snackbar,
    },
    head: {
        bodyAttrs: {
            class: 'default-layout',
        },
    },
    methods: {
        logout() {
            this.$store.commit('LOGOUT');
            this.$router.push('/auth');
        },
    },
};
</script>

<template>
    <div>
        <TheHeader/>

        <nuxt class="u-section u-container u-container--large"/>

        <TheFooter/>

        <ConnectionNotice/>
        <Snackbar/>
    </div>
</template>
