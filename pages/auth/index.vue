<script>
import getTitle from '~/assets/get-title.js';
import TelegramAuth from '~/components/TelegramAuth.vue';

export default {
    PAGE_TITLE: 'Auth',
    layout: 'splash-index',
    components: {
        TelegramAuth,
    },
    head() {
        return {
            title: getTitle(this.$options.PAGE_TITLE),
            meta: [
                { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
            ],
            bodyAttrs: {
                class: this.bodyClass,
            },
        };
    },
    computed: {
        bodyClass() {
            if (this.$store.getters.isMegachain) {
                return 'megachain__auth-body layout--hide-header-logo layout--transparent-header';
            }
            if (this.$store.getters.isMegagamer) {
                return 'megagamer__auth-body layout--hide-header-logo layout--transparent-header';
            }
            return undefined;
        },
        telegramLoginUrl() {
            const url = this.$i18n.locale === 'ru'
                ? 'https://t.me/metagardenbot?start=launchpadru'
                : 'https://t.me/metagardenbot?start=launchpad';
            const refId = this.$store.state.referral.foreignRefId;
            return refId ? url + '-' + refId : url;
        },
    },
    methods: {

    },
};
</script>

<template>
    <div class="u-container u-container--mini">
        <template v-if="$store.getters.isMegachain">
            <a class="button button--telegram button--full" :href="telegramLoginUrl" target="_blank">
                <img src="/img/icon-social-telegram.svg" alt="" role="presentation" class="button__icon">
                {{ $td('Register via Telegram', 'index.sign-up-megachain') }}
            </a>

            <div class="u-text-center u-mt-15">
                <nuxt-link class="link link--underline u-fw-700" :to="$i18nGetPreferredPath('/auth/sign-in')">
                    {{ $td('Login with a seed phrase', 'index.already-have-wallet-megachain') }}
                </nuxt-link>
            </div>
        </template>
        <template v-if="!$store.getters.isMegachain && !$store.getters.isMegagamer">
            <nuxt-link class="button button--main button--full button--large" :to="$i18nGetPreferredPath('/auth/sign-up')">
                {{ $td('Create a new wallet', 'index.sign-up') }}
            </nuxt-link>

            <div class="u-text-center u-mt-15">
                <nuxt-link class="link link--underline u-fw-700" :to="$i18nGetPreferredPath('/auth/sign-in')">
                    {{ $td('I already have a wallet', 'index.already-have-wallet') }}
                </nuxt-link>
            </div>
        </template>
        <template v-if="$store.getters.isMegagamer">
            <TelegramAuth
                class="u-text-center"
                reason="gamer-id"
                :label="$td('Create GamerID via Telegram', 'index.megagamer-create-telegram-button')"
                :label-secondary="$td('I already have a GamerID', 'index.megagamer-have-telegram-button')"
                @success="() => $router.replace($i18nGetPreferredPath('/'))"
            />
        </template>
    </div>
</template>

