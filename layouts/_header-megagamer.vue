<script>
import InlineSvg from 'vue-inline-svg';
import {DASHBOARD_URL, DASHBOARD_URL_METAGARDEN, HUB_NETWORK_SLUG, ROUTE_NAME_SPLITTER, I18N_ROUTE_NAME_SEPARATOR} from '~/assets/variables.js';
import {pretty} from '~/assets/utils.js';
import Topup from '~/components/Topup.vue';
import Modal from '~/components/base/Modal.vue';

export default {
    HUB_NETWORK_SLUG,
    components: {
        // Modal,
        // Topup,
        InlineSvg,
    },
    props: {

    },
    data() {
        return {
            isTopupModalOpen: false,
        };
    },
    computed: {
        indexUrl() {
            return DASHBOARD_URL;
        },
        backUrl() {
            return DASHBOARD_URL;
        },
        isAccountPage() {
            return false;
            // match ^metagarden/account___(en|ru)
            // eslint-disable-next-line no-unreachable
            return this.$route.name.indexOf(`metagarden${ROUTE_NAME_SPLITTER}account${I18N_ROUTE_NAME_SEPARATOR}`) === 0;
        },
        isAuthPage() {
            // match ^auth/.* or ^auth___(en|ru)
            return this.$route.name.indexOf('auth' + ROUTE_NAME_SPLITTER) === 0 || this.$route.name.indexOf('auth' + I18N_ROUTE_NAME_SEPARATOR) === 0;
        },
    },
    methods: {
        pretty,
        shortHashFilter(hash) {
            return hash.substr(0, 4) + '…' + hash.substr(-4);
        },
    },
};
</script>

<template>
    <header class="header">
        <div class="header__container u-container u-container--wide">
            <div class="header__logo">
                <nuxt-link class="header__logo-link" :to="$i18nGetPreferredPath(indexUrl)" :class="{'link--opacity': isAccountPage}">
                    <img v-if="!isAccountPage" class="u-image" src="/img/logo-megachain.svg" alt="Metagarden chain" width="32" height="32">
                    <InlineSvg v-else class="header__image-back u-image" src="/img/icon-back.svg" alt="Back" width="24" height="24" fill="currentColor"/>
                </nuxt-link>
                <div class="header__logo-text" v-if="isAccountPage">{{ $td('Back', 'metagarden.back-mg') }}</div>
            </div>

            <!--<div class="header__controls">-->

            <button v-if="$store.getters.isAuthorized && !isAccountPage" type="button" class="header__controls-link header__controls-user u-semantic-button" @click="isTopupModalOpen = true">
                <div class="u-mr-10 u-text-right">
                    <div class="u-fw-700 header__controls-user-name">Metagarden GamerID</div>
                    <div class="u-fw-600 header__controls-user-balance">
                        @{{ $store.getters['telegram/username'] }}
                    </div>
                </div>
                <!--<img class="header__controls-user-avatar u-hidden-mini-down" :src="$store.getters.avatar" v-if="$store.getters.avatar" alt="" role="presentation" width="32" height="32"/>-->
            </button>
            <nuxt-link v-if="!$store.getters.isAuthorized && !isAuthPage" :to="$i18nGetPreferredPath('/auth')" type="button" class="header__controls-link">
                {{ $td('Sign in', 'index.sign-in') }}
            </nuxt-link>
            <!--</div>-->
        </div>

        <!--
        <Modal
            modalContainerClass="card card__content u-text-center"
            :isOpen.sync="isTopupModalOpen"
            :hideCloseButton="false"
            :disableOutsideClick="false"
        >
            <Topup
                :network-slug="$options.HUB_NETWORK_SLUG.MINTER"
                :title="$td('Your wallet address', 'receive.title')"
                :description="false"
                :back-url="false"
                @click-back="isTopupModalOpen = false"
            />
        </Modal>
        -->
    </header>
</template>
