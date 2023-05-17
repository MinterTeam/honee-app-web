<script>
import getTitle from '~/assets/get-title.js';
import {CARD_TO_MINTER_HOST, NETWORK, MAINNET} from '~/assets/variables.js';
import InlineSvg from 'vue-inline-svg';
import {getCard2MinterUrl} from '~/assets/utils.js';

const TELEGRAM_BUY_LINKS = {
    BEE: 'https://t.me/honeepremiumbot?start=buy-bee',
    MEGANET: 'https://t.me/metagardenbot?start=meganet',
};

export default {
    CARD_TO_MINTER_HOST,
    TELEGRAM_BUY_LINKS,
    layout(context) {
        return context.store.getters.isMetagarden ? 'metagarden' : 'default';
    },
    components: {
        InlineSvg,
    },
    head() {
        const title = getTitle(this.$td('Buy', 'index.swap') + ' ' + this.$route.params.coin);

        return {
            title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
            ],
        };
    },
    fetch() {
        if (!this.$route.params.coin) {
            this.$nuxt.error({ status: 404, message: 'Page not found' });
        }
    },
    data() {
        return {
        };
    },
    computed: {
        isMainnet() {
            return NETWORK === MAINNET;
        },
        card2MinterUrl() {
            return getCard2MinterUrl({
                address: this.$store.getters.address,
                coin: this.$route.params.coin,
                returnUrl: window.location.href,
                finishUrl: window.location.origin,
            });
        },
    },
    methods: {
    },
};
</script>

<template>
    <div class="u-section topup__vertical-container u-container u-container--small u-text-center">
        <div class="card card__content card__content--small card--light-grey topup__vertical-center">
            <h1 class="u-h3 u-mb-025">
                {{ $td('Buy', 'index.swap') }} {{ $route.params.coin }}
            </h1>
            <p>{{ $td('Choose one of these options', 'topup.description') }}</p>

            <a class="button button--full u-mt-10" :href="card2MinterUrl" v-if="isMainnet">
                <InlineSvg class="button__icon" src="/img/icon-topup-card.svg" width="24" height="24" alt="" role="presentation"/>
                {{ $td('Card', 'topup.top-up-with-card2card') }}
            </a>
            <nuxt-link class="button button--full u-mt-10" :to="$i18nGetPreferredPath('/topup/crypto')">
                <InlineSvg class="button__icon" src="/img/icon-blockchain.svg" width="24" height="24" alt="" role="presentation"/>
                {{ $td('Crypto', 'topup.buy-with-crypto') }}
            </nuxt-link>
            <a class="button button--full u-mt-10" :href="$options.TELEGRAM_BUY_LINKS[$route.params.coin]" target="_blank" v-if="$options.TELEGRAM_BUY_LINKS[$route.params.coin]">
                <InlineSvg class="button__icon" src="/img/icon-social-telegram.svg" width="24" height="24" alt="" role="presentation"/>
                {{ $td('Via Telegram bot', 'topup.buy-via-telegram') }}
            </a>
            <nuxt-link class="button button--full u-mt-10" :to="$i18nGetPreferredPath('/swap/' + $route.params.coin)">
                <InlineSvg class="button__icon" src="/img/icon-swap.svg" width="24" height="24" alt="" role="presentation"/>
                {{ $td('Swap in Honee', 'topup.buy-in-honee') }}
            </nuxt-link>

            <!--<nuxt-link class="button button--ghost button--full u-mt-10" :to="$i18nGetPreferredPath('/topup/coin/' + $route.params.coin)">
                {{ $td('Cancel', 'topup.cancel') }}
            </nuxt-link>-->
        </div>

        <nuxt-link class="link--default-black u-mt-15" v-if="$options.isOnboarding" :to="$i18nGetPreferredPath($store.state.authRedirectPath || DASHBOARD_URL)" @click.native="$nextTick(() => $store.commit('SET_AUTH_REDIRECT_PATH', ''))">
            {{ $td('I\'ll do it later', 'onboarding.skip') }}
        </nuxt-link>
    </div>
</template>
