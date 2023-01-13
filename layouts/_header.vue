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
                    <InlineSvg class="header__image-logo" src="/img/logo-honee.svg" alt="Honee" width="122" height="24" fill="currentColor"/>
                </nuxt-link>
            </div>

            <div class="header__controls">
                <template v-if="!isPremiumPage && isAuthorized && !simple">
                    <nuxt-link class="header__controls-link header__controls-premium u-hidden-large-down" :to="$i18nGetPreferredPath('/premium')">
                        <img class="header__controls-premium-icon" src="/img/icon-premium-fancy.svg" alt="" role="presentation" width="64" height="42">
                        {{ $t('premium.activate-title-short') }}
                    </nuxt-link>
                    <hr class="header__controls-link header__controls-divider u-hidden-large-down"/>
                    <ReferralCard class="header__controls-link u-hidden-large-down" style="font-weight: 400;"/>
                    <hr class="header__controls-link header__controls-divider u-hidden-large-down"/>
                </template>

                <nuxt-link v-if="isAuthorized && !simple" :to="$i18nGetPreferredPath('/receive')" class="header__controls-link header__controls-user">
                    <div class="header__controls-user-avatar u-hidden-mini-down" :style="`background-image: url(${$store.getters.avatar});`" v-if="$store.getters.avatar"></div>
                    <div class="header__controls-user-name">{{ $store.getters.username }}</div>
                </nuxt-link>
                <button v-if="isAuthorized && !simple" type="button" class="header__controls-link link u-semantic-button" @click="logout()">
                    <img src="/img/icon-logout.svg" width="24" height="24" alt="Logout">
                </button>
                <nuxt-link v-if="!isAuthorized && !simple && !isAuthPage" :to="$i18nGetPreferredPath('/auth')" type="button" class="header__controls-link">
                    {{ $td('Sign in', 'index.sign-in') }}
                </nuxt-link>
                <div class="header__controls-language header__controls-link">
                    <Language/>
                </div>
            </div>
        </div>
        <div class="header__container--premium header__container u-container u-hidden-large-up" v-if="!isPremiumPage && isAuthorized && !simple">
            <div class="header__controls">
                <nuxt-link class="header__controls-link header__controls-premium" :to="$i18nGetPreferredPath('/premium')">
                    <img class="header__controls-premium-icon" src="/img/icon-premium.svg" alt="" role="presentation" width="24" height="24">
                    {{ $t('premium.activate-title-short') }}
                </nuxt-link>
                <hr class="header__controls-link header__controls-divider"/>
                <ReferralCard class="header__controls-link u-hidden-large-up" style="font-weight: 400;"/>
            </div>
        </div>
    </header>
</template>
