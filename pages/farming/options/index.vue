<script>
import getTitle from '~/assets/get-title.js';
import InlineSvg from 'vue-inline-svg';
import {MAINNET, NETWORK, SPOT_DATA} from '~/assets/variables.js';
import {TELEGRAM_BUY_LINKS} from '~/components/TopupCoinOptions.vue';
import {getCard2MinterUrl} from '~/assets/utils.js';

export default {
    TELEGRAM_BUY_LINKS,
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
            const MINER_SPOT_COIN_SYMBOL = SPOT_DATA.FARMER.card2CardToken;
            return getCard2MinterUrl({
                address: this.$store.getters.address,
                returnUrl: window.location.origin + this.$i18nGetPreferredPath('/farming'),
                coin: MINER_SPOT_COIN_SYMBOL,
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
                {{ $td('Buy', 'index.swap') }} FARMER
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
            <!--
            <a class="button button&#45;&#45;full u-mt-10" :class="buttonClass" :href="$options.TELEGRAM_BUY_LINKS.FARMER" target="_blank" v-if="$options.TELEGRAM_BUY_LINKS.FARMER">
                <InlineSvg class="button__icon" src="/img/icon-social-telegram.svg" width="24" height="24" alt="" role="presentation"/>
                {{ $td('Telegram bot', 'topup.buy-via-telegram') }}
            </a>
            -->
            <nuxt-link class="button button--full u-mt-10" :class="buttonClass" :to="$i18nGetPreferredPath('/farming/options/swap')">
                <InlineSvg class="button__icon" src="/img/icon-swap.svg" width="24" height="24" alt="" role="presentation"/>
                {{ $td('Swap in Minter', 'topup.buy-in-minter') }}
            </nuxt-link>

            <!--<nuxt-link class="button button--ghost button--full u-mt-10" :to="$i18nGetPreferredPath('/topup/coin/' + coin)">
                {{ $td('Cancel', 'topup.cancel') }}
            </nuxt-link>-->
        </div>

    </div>
</template>
