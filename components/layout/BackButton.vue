<script>
import InlineSvg from 'vue-inline-svg';

export default {
    components: {
        InlineSvg,
    },
    props: {
        buttonClass: {
            type: String,
        },
    },
    computed: {
        backUrl() {
            // if no history use '/' as backUrl
            if (!this.$store.state.history.length) {
                return this.$getDashboardUrl();
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
    <div class="" v-if="!isIndexPage">
        <nuxt-link
            v-if="backUrl"
            :class="buttonClass ? buttonClass : 'back-button'"
            :to="backUrl"
        >
            <slot>
                <InlineSvg class="back-button__icon" src="/img/icon-back.svg" width="24" height="24" alt="" role="presentation"/>
                <span class="back-button__label">{{ $td('Back to wallet', 'index.back-index') }}</span>
            </slot>
        </nuxt-link>
        <button
            v-else
            type="button"
            :class="buttonClass ? buttonClass : 'back-button u-semantic-button'"
            @click="goBack()"
        >
            <slot>
                <InlineSvg class="back-button__icon" src="/img/icon-back.svg" width="24" height="24" alt="" role="presentation"/>
                <span class="back-button__label">{{ $td('Back', 'index.back') }}</span>
            </slot>
        </button>
    </div>
</template>
