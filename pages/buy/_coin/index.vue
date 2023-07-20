<script>
import getTitle from '~/assets/get-title.js';
import TopupCoinOptions from '~/components/TopupCoinOptions.vue';

export default {
    // layout(context) {
    //     return context.store.getters.isMetagarden ? 'metagarden' : 'default';
    // },
    components: {
        TopupCoinOptions,
    },
    head() {
        const title = getTitle(this.$td('Buy', 'index.swap') + ' ' + this.$route.params.coin);

        return {
            title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
            ],
        };
    },
    fetch() {
        if (!this.$route.params.coin) {
            this.$nuxt.error({ status: 404, message: 'Page not found' });
        }
    },
    data() {
        return {
        };
    },
    computed: {
    },
    methods: {
    },
};
</script>

<template>
    <div class="u-section topup__vertical-container u-container u-container--small u-text-center">
        <TopupCoinOptions :coin="$route.params.coin"/>

        <nuxt-link class="link--default-black u-mt-15" v-if="$options.isOnboarding" :to="$i18nGetPreferredPath($store.state.authRedirectPath || DASHBOARD_URL)" @click.native="$nextTick(() => $store.commit('SET_AUTH_REDIRECT_PATH', ''))">
            {{ $td('I\'ll do it later', 'onboarding.skip') }}
        </nuxt-link>
    </div>
</template>
