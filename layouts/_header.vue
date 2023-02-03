<script>
import InlineSvg from 'vue-inline-svg';
import Language from '~/components/layout/Language.vue';
import ReferralCard from '~/components/ReferralCard.vue';

export default {
    components: {
        InlineSvg,
        Language,
        ReferralCard,
    },
    props: {
        title: {
            type: String,
            default: 'Minter',
        },
        /* @TODO deprecated */
        simple: {
            type: Boolean,
            default: false,
        },
        isMetagarden: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        indexUrl() {
            if (this.isAuthBattlePage) {
                return '/auth/battle';
            }
            return '/';
        },
        backUrl() {
            // if no history use '/' as backUrl
            if (!this.$store.state.history.length) {
                return '/';
            } else {
                return undefined;
            }
        },
        isAuthPage() {
            return this.$route.name.indexOf('auth-') === 0 || this.$route.name.indexOf('auth_') === 0;
        },
        isAuthBattlePage() {
            return this.$route.path.includes('/auth/battle');
        },
        isPremiumPage() {
            return this.$route.path === this.$i18nGetPreferredPath('/premium');
        },
        isAuthorized() {
            return this.$store.getters.isAuthorized;
        },
    },
    methods: {
        goBack() {
            this.$router.go(-1);
        },
        logout() {
            this.$store.commit('LOGOUT');
            this.$router.push(this.$i18nGetPreferredPath('/auth'));
        },
    },
};
</script>

<template>
    <header class="header">
        <div class="header__container u-container u-container--wide">
            <div class="header__logo">
                <nuxt-link class="header__logo-link" :to="$i18nGetPreferredPath(indexUrl)">
                    <img v-if="isMetagarden" class="header__image-logo" src="/img/logo-metagarden-green.svg" alt="Metagarden" width="32" height="32">
                    <InlineSvg v-else class="header__image-logo" src="/img/logo-honee.svg" alt="Honee" width="122" height="24" fill="currentColor"/>
                </nuxt-link>
            </div>

            <!--<div class="header__controls">-->
            <template v-if="!isPremiumPage && isAuthorized && !simple && !isMetagarden">
                <hr class="header__horizontal-divider header__premium-item u-hidden-large-up metagarden-layout__hide"/>
                <nuxt-link class="header__controls-link u-flex u-flex--align-center header__premium-item metagarden-layout__hide" :to="$i18nGetPreferredPath('/premium')">
                    <img class="u-mr-05 u-hidden-large-down" src="/img/icon-premium-fancy.svg" alt="" role="presentation" width="64" height="42">
                    <img class="u-mr-05 u-hidden-large-up" src="/img/icon-premium.svg" alt="" role="presentation" width="24" height="24">
                    {{ $t('premium.activate-title-short') }}
                </nuxt-link>
                <hr class="header__controls-link header__controls-divider header__premium-item metagarden-layout__hide"/>
                <ReferralCard class="u-flex header__premium-item metagarden-layout__hide" button-class="header__controls-link u-semantic-button"/>
                <hr class="header__controls-link header__controls-divider header__premium-item u-hidden-large-down metagarden-layout__hide"/>
            </template>

            <nuxt-link v-if="isAuthorized && !simple" :to="$i18nGetPreferredPath('/receive')" class="header__controls-link header__controls-user">
                <div class="header__controls-user-avatar u-hidden-mini-down" :style="`background-image: url(${$store.getters.avatar});`" v-if="$store.getters.avatar"></div>
                <div class="header__controls-user-name">{{ $store.getters.username }}</div>
            </nuxt-link>
            <button v-if="isAuthorized && !simple && !isMetagarden" type="button" class="header__controls-link link u-semantic-button metagarden-layout__hide" @click="logout()">
                <img src="/img/icon-logout.svg" width="24" height="24" alt="Logout">
            </button>
            <nuxt-link v-if="!isAuthorized && !simple && !isAuthPage" :to="$i18nGetPreferredPath('/auth')" type="button" class="header__controls-link">
                {{ $td('Sign in', 'index.sign-in') }}
            </nuxt-link>
            <div class="header__controls-language header__controls-link">
                <Language/>
            </div>
            <!--</div>-->
        </div>
    </header>
</template>
