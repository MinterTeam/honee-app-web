<script>
import AlphaBanner from '~/layouts/_alpha-banner.vue';
import Header from '~/layouts/_header.vue';
import ConnectionNotice from '~/components/ConnectionNotice.vue';
import Snackbar from '~/components/base/Snackbar.vue';

export default {
    components: {
        AlphaBanner,
        Header,
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
        <AlphaBanner/>
        <Header/>

        <nuxt class="u-section u-container"/>

        <ConnectionNotice/>
        <Snackbar/>
    </div>
</template>
