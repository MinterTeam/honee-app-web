<script>
import getTitle from '~/assets/get-title.js';
import FormAddAdvancedAddress from '~/components/FormAddAdvancedAddress.vue';

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
            bodyAttrs: {
                class: 'auth__body',
            },
        };
    },
    methods: {

    },
};
</script>

<template>
    <div class="u-section u-relative">
        <div class="u-relative">
            <img class="auth__bee" src="/img/logo-bee.svg" alt="" role="presentation">
            <img class="auth__logo" src="/img/logo-honee.svg" alt="Honee" width="244" height="48">
        </div>

        <nuxt-link class="button button--main button--full button--large" :to="$i18nGetPreferredPath('/auth/new-wallet')">{{ $td('Sign up', 'index.sign-up') }}</nuxt-link>

        <div class="u-section-divider-text">
            <div class="u-section-divider-text__inner">{{ $td('or', 'index.or') }}</div>
        </div>

        <FormAddAdvancedAddress/>
    </div>
</template>

