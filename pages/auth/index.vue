<script>
    import getTitle from '~/assets/get-title';
    import FormAddAdvancedAddress from '~/components/FormAddAdvancedAddress';

    export default {
        PAGE_TITLE: 'Auth',
        layout: 'splash',
        components: {
            FormAddAdvancedAddress,
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            };
        },
        methods: {

        },
    };
</script>

<template>
    <div class="u-section">
        <img class="auth__logo" src="/img/logo-honee.svg" alt="Honee" width="244" height="48">

        <nuxt-link class="button button--main button--full button--large" to="/auth/new-wallet">Sign up</nuxt-link>

        <div class="u-section-divider-text">
            <div class="u-section-divider-text__inner">or</div>
        </div>

        <FormAddAdvancedAddress/>
    </div>
</template>

