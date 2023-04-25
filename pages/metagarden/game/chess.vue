<script>
import MetagardenGame from '~/components/MetagardenGame.vue';

export default {
    layout: 'metagarden',
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
        <nuxt-link class="button button--main button--full u-mt-15" :to="$i18nGetPreferredPath('/swap/' + game.coin)">
            {{ $t('action.title-buy-coin', {coin: game.coin}) }}
        </nuxt-link>
    </MetagardenGame>
</template>
