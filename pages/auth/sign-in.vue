<script>
import getTitle from '~/assets/get-title.js';
import AuthLogin from '~/components/AuthLogin.vue';

export default {
    layout: 'splash',
    components: {
        AuthLogin,
    },
    head() {
        const title = getTitle(this.$td('Sign in', 'index.sign-in'));
        return {
            title: title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
            ],
            htmlAttrs: {
                class: this.$route.query.battle ? 'splash-layout splash-layout--battle' : '',
            },
        };
    },
    methods: {

    },
};
</script>

<template>
    <div class="u-section u-relative u-container u-container--small">
        <div class="card card__content">
            <h1 class="u-h3 u-mb-05 u-text-center">{{ $td('Sign in', 'index.sign-in') }}</h1>

            <AuthLogin
                class="u-mt-10"
                field-class="h-field--is-readonly"
                :onboarding-url="$route.query.battle ? '/onboarding/battle' : undefined"
            />
        </div>
    </div>
</template>

