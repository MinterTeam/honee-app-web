<script>
export default {
    computed: {
        backUrl() {
            // if no history use '/' as backUrl
            if (!this.$store.state.history.length) {
                return '/';
            } else {
                return undefined;
            }
        },
        isIndexPage() {
            return this.$route.path === this.$i18nGetPreferredPath('/');
        },
    },
    methods: {
        goBack() {
            this.$router.go(-1);
        },
    },
};
</script>

<template>
    <div class="u-fw-700 u-hidden-medium-down" v-if="!isIndexPage">
        <nuxt-link v-if="backUrl" class="back-button" :to="backUrl">
            <img class="back-button__icon" src="/img/icon-back.svg" width="24" height="24" alt="" role="presentation"/>
            <span class="back-button__label">{{ $td('Back to wallet', 'index.back-index') }}</span>
        </nuxt-link>
        <button v-else type="button" class="back-button u-semantic-button" @click="goBack()">
            <img class="back-button__icon" src="/img/icon-back.svg" width="24" height="24" alt="" role="presentation"/>
            <span class="back-button__label">{{ $td('Back', 'index.back') }}</span>
        </button>
    </div>
</template>
