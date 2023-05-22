<script>
import {NETWORK, MAINNET} from '~/assets/variables.js';
import InlineSvg from 'vue-inline-svg';
import {getCard2MinterUrl} from '~/assets/utils.js';

export const TELEGRAM_BUY_LINKS = {
    BEE: 'https://t.me/honeepremiumbot?start=buy-bee',
    MEGANET: 'https://t.me/metagardenbot?start=meganet',
};

export default {
    TELEGRAM_BUY_LINKS,
    components: {
        InlineSvg,
    },
    props: {
        coin: {
            type: String,
            required: true,
        },
        buttonClass: {
            type: String,
            default: '',
        },
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
                coin: this.coin,
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
    <div class="card card__content card__content--small card--light-grey topup__vertical-center">
        <h1 class="u-h3 u-mb-025">
            {{ $td('Buy', 'index.swap') }} {{ coin }}
        </h1>
        <p>{{ $td('Choose one of these options', 'topup.description') }}</p>

        <a class="button button--full u-mt-10" :class="buttonClass" :href="card2MinterUrl" v-if="isMainnet">
            <InlineSvg class="button__icon" src="/img/icon-topup-card.svg" width="24" height="24" alt="" role="presentation"/>
            {{ $td('Card', 'topup.top-up-with-card2card') }}
        </a>
        <nuxt-link class="button button--full u-mt-10" :class="buttonClass" :to="$i18nGetPreferredPath('/topup/crypto')">
            <InlineSvg class="button__icon" src="/img/icon-blockchain.svg" width="24" height="24" alt="" role="presentation"/>
            {{ $td('Crypto', 'topup.buy-with-crypto') }}
        </nuxt-link>
        <a class="button button--full u-mt-10" :class="buttonClass" :href="$options.TELEGRAM_BUY_LINKS[coin]" target="_blank" v-if="$options.TELEGRAM_BUY_LINKS[coin]">
            <InlineSvg class="button__icon" src="/img/icon-social-telegram.svg" width="24" height="24" alt="" role="presentation"/>
            {{ $td('Via Telegram bot', 'topup.buy-via-telegram') }}
        </a>
        <nuxt-link class="button button--full u-mt-10" :class="buttonClass" :to="$i18nGetPreferredPath('/swap/' + coin)">
            <InlineSvg class="button__icon" src="/img/icon-swap.svg" width="24" height="24" alt="" role="presentation"/>
            {{ $td('Swap in Honee', 'topup.buy-in-honee') }}
        </nuxt-link>

        <!--<nuxt-link class="button button--ghost button--full u-mt-10" :to="$i18nGetPreferredPath('/topup/coin/' + coin)">
            {{ $td('Cancel', 'topup.cancel') }}
        </nuxt-link>-->
    </div>
</template>
