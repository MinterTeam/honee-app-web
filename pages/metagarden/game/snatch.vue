<script>
import {IS_SUBAPP_HONEE} from '~/assets/variables.js';
import MetagardenGame from '~/components/MetagardenGame.vue';

export default {
    layout: IS_SUBAPP_HONEE ? 'metagarden' : undefined,
    components: {
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
        <a class="button button--main button--full u-mb-10 u-mt-15" href="http://t.me/metagardenbot?start=snatch" target="_blank">{{ $td('Play', 'mg-games.button-play') }}</a>
        <nuxt-link class="button button--ghost-main button--full u-mb-10" :to="$i18nGetPreferredPath('/swap/' + game.coin)">
            {{ $t('action.title-buy-coin', {coin: game.coin}) }}
        </nuxt-link>
        <a class="button button--ghost-main button--full" :href="$i18nGetPreferredPath('/send/-/' + game.coin)">{{ $td('Send tokens to the Game', 'mg-games.button-send-tokens') }}</a>
    </MetagardenGame>
</template>
