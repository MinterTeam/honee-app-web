<script>
import getTitle from '~/assets/get-title.js';

export default {
    PAGE_TITLE: 'Auth',
    layout: 'splash-index',
    components: {
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
        <nuxt-link class="button button--main button--full button--large" :to="$i18nGetPreferredPath('/auth/sign-up')">
            {{ $td('Create a new wallet', 'index.sign-up') }}
        </nuxt-link>

        <div class="u-text-center u-mt-15">
            <nuxt-link class="link link--underline u-fw-700" :to="$i18nGetPreferredPath('/auth/sign-in')">
                {{ $td('Sign in to your wallet', 'index.already-have-wallet') }}
            </nuxt-link>
        </div>
    </div>
</template>

