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
                class: 'splash-layout splash-layout--battle',
            },
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <AuthRegister finish-url="/onboarding/battle"/>
    </div>
</template>

