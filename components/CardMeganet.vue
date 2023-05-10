<script>
import AddressAssets from '~/components/AddressAssets.vue';
import {getCard2MinterUrl, pretty} from '~/assets/utils.js';
import BaseTooltip from '~/components/base/BaseTooltip.vue';


export default {
    components: {
        BaseTooltip,
        AddressAssets,
    },
    computed: {
        tooltipContent() {
            return this.$i18n.locale === 'en'
                ? `MEGANET tokens entitle you to enter the Metagarden Chain genesis block at the network launch and get METAGARDEN (native Metagarden Chain coins) with a 100% bonus.`
                : `Токены MEGANET дают право войти в генезисный блок Metagarden Chain при запуске сети и получить монеты METAGARDEN (нативные монеты Metagarden Chain) со 100% бонусом.`;
        },
        card2MinterUrl() {
            return getCard2MinterUrl({
                address: this.$store.getters.address,
                returnUrl: window.location.href,
                coin: 'MEGANET',
            });
        },
    },
};
</script>

<template>
    <div class="card card__content--small card--metagarden card--meganet u-text-center u-mb-10">
        <div class="card__action-head" v-if="!hideHead">
            <img class="card__action-logo" alt="" src="/img/mg-chain-logo.svg">
            <div class="card__action-title">
                <div class="card__action-title-type">MEGANET</div>
                <div class="card__action-title-value">{{ $td('Early Access', 'meganet.card-title') }}</div>
            </div>
            <BaseTooltip class="u-flex-item--no-shrink u-ml-10 card__action-tooltip" :content="tooltipContent"/>
        </div>
        <img v-if="!isSmall" class="u-image u-image-center u-mt-15 u-mb-10" src="/img/mg-chain.svg" alt="" role="presentation" width="165" height="136">
        <p class="card__action-description">{{ $td(`Join the Metagarden chain, the ultimate EVM blockchain designed for gaming. Buy MEGANET tokens to get a 100% bonus when the main network goes live. Don't miss the chance to be part of history!`, 'meganet.description') }}</p>
        <div class="u-h--uppercase u-mb-05 u-mt-15">{{ $td('Buy MEGANET with', 'meganet.buy-more-button') }}</div>
        <div class="u-grid u-grid--smaller-mobile">
            <div class="u-cell u-cell--1-2">
                <a :href="card2MinterUrl" class="button button--full button--very-narrow">
                    <img class="button__icon" src="/img/icon-topup-card.svg" alt="" role="presentation"/>
                    {{ $td('Card', 'metagarden.buy-button-card') }}
                </a>
            </div>
            <div class="u-cell u-cell--1-2">
                <nuxt-link :to="$i18nGetPreferredPath('/swap/MEGANET')" class="button button--full button--narrow">
                    <img class="button__icon" src="/img/icon-blockchain.svg" alt="" role="presentation"/>
                    {{ $td('Crypto', 'metagarden.buy-button-crypto') }}
                </nuxt-link>
            </div>
        </div>
    </div>
</template>
