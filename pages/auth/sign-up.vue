<script>
import getTitle from '~/assets/get-title.js';
import AuthRegister from '~/components/AuthRegister.vue';

export default {
    layout: 'splash',
    components: {
        AuthRegister,
    },
    head() {
        const title = getTitle(this.$td('Sign up', 'index.sign-up'));

        return {
            title,
            meta: [
                {hid: 'og-title', name: 'og:title', content: title},
            ],
            htmlAttrs: {
                class: this.$route.query.battle ? 'splash-layout splash-layout--battle' : undefined,
            },
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <AuthRegister :onboarding-url="$route.query.battle ? '/onboarding/battle' : undefined"/>
    </div>
</template>

