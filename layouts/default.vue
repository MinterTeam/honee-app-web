<script>
    import Header from '~/layouts/_header.vue';
    import ConnectionNotice from '~/components/ConnectionNotice.vue';
    import Snackbar from '~/components/base/Snackbar.vue';

    export default {
        components: {
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
        <Header/>

        <nuxt class="u-section u-container"/>

        <ConnectionNotice/>
        <Snackbar/>
    </div>
</template>
