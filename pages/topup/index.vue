<script>
import getTitle from '~/assets/get-title.js';
import {CARD_TO_MINTER_HOST, NETWORK, MAINNET} from '~/assets/variables.js';
import InlineSvg from 'vue-inline-svg';

export default {
    CARD_TO_MINTER_HOST,
    layout(context) {
        return context.store.state.isMetagarden ? 'metagarden' : 'default';
    },
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
        isMainnet() {
            return NETWORK === MAINNET;
        },
    },
    methods: {
        getTopupInnerPage(inner) {
            const base = this.$options.isOnboarding ? '/onboarding/topup/' : '/topup/';
            return this.$i18nGetPreferredPath(base + inner);
        },
    },
};
</script>

<template>
    <div class="u-section topup__vertical-container u-container u-container--small u-text-center">
        <div class="card card__content card__content--small topup__vertical-center">
            <h1 class="u-h3 u-mb-025">
                {{ $td('Top up your balance', 'topup.title') }}
            </h1>
            <p>{{ $td('Choose one of these options', 'topup.description') }}</p>

            <nuxt-link class="button button--main button--full u-mt-10" :to="getTopupInnerPage('card')" v-if="isMainnet">
                <InlineSvg class="button__icon" src="/img/icon-topup-card.svg" alt="" role="presentation"/>
                {{ $td('Card to card', 'topup.top-up-with-card2card') }}
            </nuxt-link>
            <nuxt-link class="button button--main button--full u-mt-10" :to="getTopupInnerPage('bsc')">
                <InlineSvg class="button__icon" src="/img/icon-topup-bnb.svg" alt="" role="presentation"/>
                {{ $td('Top up with BNB', 'topup.top-up-with-network', {network: 'BNB'}) }}
            </nuxt-link>
            <nuxt-link class="button button--main button--full u-mt-10" :to="getTopupInnerPage('ethereum')">
                <InlineSvg class="button__icon" src="/img/icon-topup-eth.svg" alt="" role="presentation"/>
                {{ $td('Top up with ETH', 'topup.top-up-with-network', {network: 'ETH'}) }}
            </nuxt-link>
            <nuxt-link class="button button--main button--full u-mt-10" :to="getTopupInnerPage('minter')">
                <InlineSvg class="button__icon" src="/img/icon-topup-minter.svg" alt="" role="presentation"/>
                {{ $td('Top up with Minter', 'topup.top-up-with-network', {network: 'Minter'}) }}
            </nuxt-link>

            <!--
            <nuxt-link class="button button&#45;&#45;ghost button&#45;&#45;full u-mt-10" :to="getDashboardUrl()">
                {{ $td('Cancel', 'topup.cancel') }}
            </nuxt-link>
            -->
        </div>

        <nuxt-link class="link--default-black u-mt-15" v-if="$options.isOnboarding" :to="$i18nGetPreferredPath($store.state.authRedirectPath || DASHBOARD_URL)" @click.native="$nextTick(() => $store.commit('SET_AUTH_REDIRECT_PATH', ''))">
            {{ $td('I\'ll do it later', 'onboarding.skip') }}
        </nuxt-link>
    </div>
</template>
