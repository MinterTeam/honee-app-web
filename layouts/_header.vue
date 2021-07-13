<script>
export default {
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
            this.$router.push('/auth');
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
                <div class="header__controls-user">
                    <div class="header__controls-user-avatar u-hidden-mini-down" :style="`background-image: url(${$store.getters.avatar});`" v-if="$store.getters.avatar"></div>
                    <div class="header__controls-user-name">{{ $store.getters.username }}</div>
                </div>
                <button class="header__controls-link link link--opacity u-semantic-button" @click="logout" >Logout</button>
            </div>
        </div>
    </header>
</template>
