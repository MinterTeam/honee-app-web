<script>
import InlineSvg from 'vue-inline-svg';
import {IS_SUBAPP_HONEE} from '~/assets/variables.js';
import MetagardenGame from '~/components/MetagardenGame.vue';

export default {
    layout: IS_SUBAPP_HONEE ? 'metagarden' : undefined,
    components: {
        InlineSvg,
        MetagardenGame,
    },
    data() {
        return {
        };
    },
    computed: {
    },
};
</script>

<template>
    <MetagardenGame v-slot="{game}">
        <a class="button button--main button--full u-mb-10 u-mt-15" href="https://perfect-city-nft.github.io/babylon/" target="_blank">{{ $td('Play', 'mg-games.button-play') }}</a>
        <nuxt-link class="button button--ghost-main button--full u-mb-10" :to="$i18nGetPreferredPath('/swap/' + game.coin)">
            {{ $t('action.title-buy-coin', {coin: game.coin}) }}
        </nuxt-link>
        <a class="button button--ghost-main button--full" :href="$i18nGetPreferredPath('/withdraw?coin='+ game.coin +'&network=bsc')">{{ $td('Send tokens to the Game', 'mg-games.button-send-tokens') }}</a>

        <div class="u-h--uppercase u-mt-10 u-mb-10">{{ $td('Game community', 'mg-games.game-community') }}</div>
        <a class="button button--ghost-main button--full u-mb-10" href="https://t.me/perfect_city_nft" target="_blank">
            <InlineSvg class="button__icon" src="/img/icon-social-telegram.svg" alt="Telegram" width="24" height="24"/>
            {{ $td('Join official channel', 'mg-games.join-channel') }}
        </a>
        <a class="button button--ghost-main button--full" href="https://t.me/perfect_city_nft_chat" target="_blank">
            <InlineSvg class="button__icon" src="/img/icon-social-telegram.svg" alt="Telegram" width="24" height="24"/>
            {{ $td('Join conversation', 'mg-games.join-conversation') }}
        </a>
    </MetagardenGame>
</template>
