<script>
import {defineComponent} from 'vue';
import {pretty} from '~/assets/utils.js';

export default defineComponent({
    components: {

    },
    props: {
        game: {
            /** @type {PropType<MetagardenGameCard>}*/
            type: Object,
            required: true,
        },
    },
    methods: {
        pretty,
    },
});
</script>

<template>
    <div class="card card--metagarden-game">
        <nuxt-link class="u-relative u-display-block" :to="$i18nGetPreferredPath(`/metagarden/game/${game.slug}`)">
            <img class="card__cover" :src="`/img/game-${game.slug}-card.jpg`" :srcset="`/img/game-${game.slug}-card@2x.jpg 2x`" alt="" role="presentation">
            <div class="card__badge card__badge--coming-soon" v-if="game.isComingSoon">
                {{ $td('Coming soon', 'mg-games.label-coming') }}
            </div>
        </nuxt-link>
        <div class="card__content--small">
            <h3 class="u-h4 u-mb-025">{{ game.title }}</h3>
            <!--
            <div class="u-h--uppercase u-flex u-flex--align-center">
                <img class="u-image--round u-mr-05" :src="$store.getters['explorer/getCoinIcon'](game.coin)" alt="" role="presentation" width="16" height="16">
                {{ pretty($store.getters.getBalanceAmount(game.coin)) }}
                {{ game.coin }}
            </div>
            -->
            <!--<CardHead :card="card"/>-->
            <!--<p class="card__action-description">{{ translate('description') }}</p>-->

            <!--<div class="card__action-tag-list">
                <div class="card__action-tag" v-for="tag in card.tags" :key="tag">{{ $td(tag, `action.tag-${tag.toLowerCase()}`) }}</div>
            </div>-->

            <div class="u-mt-10">
                <nuxt-link class="button button--main button--full " :to="$i18nGetPreferredPath(`/metagarden/game/${game.slug}`)">
                    {{ $td('Learn more', 'mg-games.button-learn') }}
                </nuxt-link>
            </div>
        </div>
    </div>
</template>
