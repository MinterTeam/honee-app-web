<script>
import getTitle from '~/assets/get-title.js';
import FormAddAdvancedAddress from '~/components/AuthLogin.vue';

export default {
    layout: 'splash',
    components: {
        FormAddAdvancedAddress,
    },
    head() {
        const title = getTitle(this.$td('Sign in', 'index.sign-in'));
        return {
            title: title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
            ],
            htmlAttrs: {
                class: 'splash-layout splash-layout--battle',
            },
        };
    },
    methods: {

    },
};
</script>

<template>
    <div class="u-section u-relative u-container u-container--small">
        <div class="card card__content card--light-grey">
            <h1 class="u-h3 u-mb-05 u-text-center">{{ $td('Sign in', 'index.sign-in') }}</h1>

            <FormAddAdvancedAddress class="u-mt-10"/>
        </div>
    </div>
</template>

