<script>
import InlineSvg from 'vue-inline-svg';
import MetagardenGame from '~/components/MetagardenGame.vue';

export default {
    layout: 'metagarden',
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
        <a class="button button--main button--full u-mb-10 u-mt-15" href="https://perfect-city-nft.github.io/babylon/" target="_blank">{{ $td('Play', 'todo') }}</a>
        <nuxt-link class="button button--ghost-main button--full" :to="$i18nGetPreferredPath('/swap/' + game.coin)">
            {{ $t('action.title-buy-coin', {coin: game.coin}) }}
        </nuxt-link>

        <div class="u-h--uppercase u-mt-10 u-mb-10">{{ $td('Game community', 'todo') }}</div>
        <a class="button button--ghost-main button--full u-mb-10" href="https://t.me/perfect_city_nft" target="_blank">
            <InlineSvg class="button__icon" src="/img/icon-social-telegram.svg" alt="Telegram" width="24" height="24"/>
            {{ $td('Join official channel', 'todo') }}
        </a>
        <a class="button button--ghost-main button--full" href="https://t.me/perfect_city_nft_chat" target="_blank">
            <InlineSvg class="button__icon" src="/img/icon-social-telegram.svg" alt="Telegram" width="24" height="24"/>
            {{ $td('Join conversation', 'todo') }}
        </a>
    </MetagardenGame>
</template>
