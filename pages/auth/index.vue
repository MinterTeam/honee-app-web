<script>
import getTitle from '~/assets/get-title.js';
import FormAddAdvancedAddress from '~/components/AuthLogin.vue';

export default {
    PAGE_TITLE: 'Auth',
    layout: 'splash-index',
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
    <div class="u-container u-container--mini">
        <nuxt-link class="button button--main button--full button--large" :to="$i18nGetPreferredPath('/auth/sign-up')">{{ $td('Sign up', 'index.sign-up') }}</nuxt-link>

        <div class="u-section-divider-text">
            <div class="u-section-divider-text__inner">{{ $td('or', 'index.or') }}</div>
        </div>

        <FormAddAdvancedAddress/>
    </div>
</template>

