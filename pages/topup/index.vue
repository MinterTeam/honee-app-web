<script>
import getTitle from '~/assets/get-title.js';
import {CARD_TO_MINTER_HOST, NETWORK, MAINNET} from '~/assets/variables.js';
import InlineSvg from 'vue-inline-svg';
import {getCard2MinterUrl} from '~/assets/utils.js';

export default {
    CARD_TO_MINTER_HOST,
    components: {
        InlineSvg,
    },
    head() {
        const title = getTitle(this.$td('Top up your balance', 'topup.title'));

        return {
            title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
            ],
        };
    },
    data() {
        return {
        };
    },
    computed: {
        card2MinterUrl() {
            return getCard2MinterUrl(this.$store.getters.address, window.location.origin);
        },
        isMainnet() {
            return NETWORK === MAINNET;
        },
    },
    methods: {
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small u-text-center">
        <div class="card card__content">
            <h1 class="u-h3 u-mb-025">
                {{ $td('Top up your balance', 'topup.title') }}
            </h1>
            <p>{{ $td('Choose one of these options', 'topup.description') }}</p>

            <a class="button button--main button--full u-mt-10" :href="card2MinterUrl" v-if="isMainnet">
                <InlineSvg class="button__icon" src="/img/icon-topup-card.svg" alt="" role="presentation"/>
                {{ $td('Card to card', 'topup.top-up-with-card2card') }}
            </a>
            <nuxt-link class="button button--main button--full u-mt-10" :to="$i18nGetPreferredPath('/topup/bsc')">
                <InlineSvg class="button__icon" src="/img/icon-topup-bnb.svg" alt="" role="presentation"/>
                {{ $td('Top up with BNB', 'topup.top-up-with-network', {network: 'BNB'}) }}
            </nuxt-link>
            <nuxt-link class="button button--main button--full u-mt-10" :to="$i18nGetPreferredPath('/topup/ethereum')">
                <InlineSvg class="button__icon" src="/img/icon-topup-eth.svg" alt="" role="presentation"/>
                {{ $td('Top up with ETH', 'topup.top-up-with-network', {network: 'ETH'}) }}
            </nuxt-link>
            <nuxt-link class="button button--main button--full u-mt-10" :to="$i18nGetPreferredPath('/topup/minter')">
                <InlineSvg class="button__icon" src="/img/icon-topup-minter.svg" alt="" role="presentation"/>
                {{ $td('Top up with Minter', 'topup.top-up-with-network', {network: 'Minter'}) }}
            </nuxt-link>

            <!--
            <nuxt-link class="button button&#45;&#45;ghost button&#45;&#45;full u-mt-10" :to="getDashboardUrl()">
                {{ $td('Cancel', 'topup.cancel') }}
            </nuxt-link>
            -->
        </div>
    </div>
</template>
