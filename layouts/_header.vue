<script>
import Language from '~/components/base/Language.vue';

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
    <header class="header header--white">
        <div class="header__container u-container u-container--2k">
            <div class="header__logo">
                <img class="header__image-logo" src="/img/logo-honee.svg" alt="Honne" width="122" height="24">
            </div>

            <div class="header__controls">
                <nuxt-link :to="$i18nGetPreferredPath('/receive')" class="header__controls-link header__controls-user">
                    <div class="header__controls-user-avatar u-hidden-mini-down" :style="`background-image: url(${$store.getters.avatar});`" v-if="$store.getters.avatar"></div>
                    <div class="header__controls-user-name">{{ $store.getters.username }}</div>
                </nuxt-link>
                <button class="header__controls-link link u-semantic-button" @click="logout" >
                    <img src="/img/icon-logout.svg" width="24" height="24" alt="Logout">
                </button>
                <div class="header__controls-language header__controls-link">
                    <Language/>
                </div>
            </div>
        </div>
    </header>
</template>
