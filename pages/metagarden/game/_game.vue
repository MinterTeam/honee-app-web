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
        <nuxt-link class="button button--main button--full u-mt-15" :to="$i18nGetPreferredPath('/swap/' + game.coin)">
            {{ $t('action.title-buy-coin', {coin: game.coin}) }}
        </nuxt-link>
    </MetagardenGame>
</template>
