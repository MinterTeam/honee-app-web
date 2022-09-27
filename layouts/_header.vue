<script>
import Language from '~/components/layout/Language.vue';

export default {
    components: {
        Language,
    },
    props: {
        title: {
            type: String,
            default: 'Minter',
        },
    },
    computed: {
        backUrl() {
            // if no history use '/' as backUrl
            if (!this.$store.state.history.length) {
                return '/';
            } else {
                return undefined;
            }
        },
        isPremiumPage() {
            return this.$route.path === this.$i18nGetPreferredPath('/premium');
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
        <div class="header__container u-container u-container--2k">
            <div class="header__logo">
                <nuxt-link :to="$i18nGetPreferredPath('/')">
                    <img class="header__image-logo" src="/img/logo-honee.svg" alt="Honne" width="122" height="24">
                </nuxt-link>
            </div>

            <div class="header__controls">
                <template v-if="!isPremiumPage">
                    <nuxt-link class="header__controls-link header__controls-premium u-hidden-medium-down" :to="$i18nGetPreferredPath('/premium')">
                        <img class="header__controls-premium-icon" src="/img/icon-premium-fancy.svg" alt="" role="presentation" width="64" height="42">
                        {{ $t('premium.activate-title') }}
                    </nuxt-link>
                    <hr class="header__controls-link header__controls-divider u-hidden-large-down"/>
                </template>

                <nuxt-link :to="$i18nGetPreferredPath('/receive')" class="header__controls-link header__controls-user">
                    <div class="header__controls-user-avatar u-hidden-mini-down" :style="`background-image: url(${$store.getters.avatar});`" v-if="$store.getters.avatar"></div>
                    <div class="header__controls-user-name">{{ $store.getters.username }}</div>
                </nuxt-link>
                <button type="button" class="header__controls-link link u-semantic-button" @click="logout()">
                    <img src="/img/icon-logout.svg" width="24" height="24" alt="Logout">
                </button>
                <div class="header__controls-language header__controls-link">
                    <Language/>
                </div>
            </div>
        </div>
        <div class="header__container--premium header__container u-container u-hidden-medium-up" v-if="!isPremiumPage">
            <div class="header__controls">
                <nuxt-link class="header__controls-link header__controls-premium" :to="$i18nGetPreferredPath('/premium')">
                    <img class="header__controls-premium-icon" src="/img/icon-premium.svg" alt="" role="presentation" width="24" height="24">
                    {{ $t('premium.activate-title') }}
                </nuxt-link>
            </div>
        </div>
    </header>
</template>
