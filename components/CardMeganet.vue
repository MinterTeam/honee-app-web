<script>
import {getCard2MinterUrl} from '~/assets/utils.js';
import BaseTooltip from '~/components/base/BaseTooltip.vue';

const PRESALE_COIN = 'LAUNCHER';

export default {
    components: {
        BaseTooltip,
    },
    computed: {
        coin() {
            return PRESALE_COIN;
        },
        tooltipContent() {
            return this.$i18n.locale === 'en'
                ? `${PRESALE_COIN} tokens entitle you to enter the Metagarden Chain genesis block at the network launch and get METAGARDEN (native Metagarden Chain coins) with a bonus.`
                : `Токены ${PRESALE_COIN} дают право войти в генезисный блок Metagarden Chain при запуске сети и получить монеты METAGARDEN (нативные монеты Metagarden Chain) со бонусом.`;
        },
        card2MinterUrl() {
            return getCard2MinterUrl({
                address: this.$store.getters.address,
                returnUrl: window.location.href,
                coin: PRESALE_COIN,
            });
        },
    },
};
</script>

<template>
    <div class="card card__content--small card--metagarden card--meganet u-text-center u-mb-10">
        <div class="card__action-head" v-if="!hideHead">
            <img class="card__action-logo" alt="" src="/img/mgchain-logo.svg">
            <div class="card__action-title">
                <div class="card__action-title-type">{{ coin }}</div>
                <div class="card__action-title-value">{{ $td('Early Access', 'meganet.card-title') }}</div>
            </div>
            <BaseTooltip class="u-flex-item--no-shrink u-ml-10 card__action-tooltip" :content="tooltipContent"/>
        </div>
        <img v-if="!isSmall" class="u-image u-image-center u-mt-15 u-mb-10" src="/img/mg-chain.svg" alt="" role="presentation" width="165" height="136">
        <p class="card__action-description">{{ $td(`Join the Metagarden Chain, the ultimate EVM blockchain designed for gaming. Buy ${coin} tokens to get a bonus when the main network goes live.`, 'meganet.description', {coin}) }}</p>

        <nuxt-link :to="$i18nGetPreferredPath('/topup/coin/' + coin)" class="button button--full u-mt-15">
            {{ $td(`Buy ${coin} tokens`, 'meganet.buy-button', {coin}) }}
        </nuxt-link>
    </div>
</template>
