<script>
import InlineSvg from 'vue-inline-svg';
import {DASHBOARD_URL, DASHBOARD_URL_METAGARDEN, ROUTE_NAME_SPLITTER, I18N_ROUTE_NAME_SEPARATOR} from '~/assets/variables.js';
import {prettyUsd} from '~/assets/utils.js';

export default {
    components: {
        InlineSvg,
    },
    props: {

    },
    data() {
        return {
        };
    },
    computed: {
        indexUrl() {
            return DASHBOARD_URL_METAGARDEN;
        },
        backUrl() {
            return '/metagarden';
        },
        isAccountPage() {
            // match ^metagarden/account___(en|ru)
            return this.$route.name.indexOf(`metagarden${ROUTE_NAME_SPLITTER}account${I18N_ROUTE_NAME_SEPARATOR}`) === 0;
        },
        isAuthPage() {
            // match ^auth/.* or ^auth___(en|ru)
            return this.$route.name.indexOf('auth' + ROUTE_NAME_SPLITTER) === 0 || this.$route.name.indexOf('auth' + I18N_ROUTE_NAME_SEPARATOR) === 0;
        },
    },
    methods: {
        prettyUsd,
    },
};
</script>

<template>
    <header class="header">
        <div class="header__container u-container u-container--wide">
            <div class="header__logo">
                <nuxt-link class="header__logo-link" :to="$i18nGetPreferredPath(indexUrl)" :class="{'link--opacity': isAccountPage}">
                    <img v-if="!isAccountPage" class="u-image" src="/img/logo-metagarden-green.svg" alt="Metagarden" width="32" height="32">
                    <InlineSvg v-else class="header__image-back u-image" src="/img/icon-back.svg" alt="Back" width="24" height="24" fill="currentColor"/>
                </nuxt-link>
                <div class="header__logo-text" v-if="isAccountPage">{{ $td('Back', 'metagarden.back-mg') }}</div>
            </div>

            <!--<div class="header__controls">-->

            <nuxt-link v-if="$store.getters.isAuthorized && !isAccountPage" :to="$i18nGetPreferredPath('/metagarden/account')" class="header__controls-link header__controls-user u-semantic-button">
                <div class="u-mr-10 u-text-right">
                    <div class="u-fw-700 header__controls-user-name">{{ $td('Your account', 'metagarden.your-account') }}</div>
                    <div class="u-fw-600 header__controls-user-balance">${{ prettyUsd($store.state.totalBalanceSumUsd) }}</div>
                </div>
                <img class="header__controls-user-avatar u-hidden-mini-down" :src="$store.getters.avatar" v-if="$store.getters.avatar" alt="" role="presentation" width="32" height="32"/>
            </nuxt-link>
            <nuxt-link v-if="!$store.getters.isAuthorized && !isAuthPage" :to="$i18nGetPreferredPath('/auth')" type="button" class="header__controls-link">
                {{ $td('Sign in', 'index.sign-in') }}
            </nuxt-link>
            <!--</div>-->
        </div>
    </header>
</template>
