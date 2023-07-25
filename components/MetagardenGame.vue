<script>
import metagardenGames from '~/data/metagarden-games.js';
import {pretty} from '~/assets/utils.js';
import {translateCardField} from '~/components/Card.vue';
import CardMetagardenGame from '~/components/CardMetagardenGame.vue';

export default {
    components: {
        CardMetagardenGame,
    },
    computed: {
        gameSlug() {
            const matches = this.$route.path.match(/\/metagarden\/game\/([a-z-]*)/);
            return matches?.[1];
        },
        game() {
            return metagardenGames.find((game) => game.slug === this.gameSlug);
        },
        otherGameList() {
            return metagardenGames.filter((game) => !game?.isComingSoon && game?.slug !== this.gameSlug);
        },
    },
    methods: {
        pretty,
        translate(key) {
            // fallback to en locale
            return translateCardField(this.game, key, this.$i18n.locale);
        },
    },
};
</script>

<template>
    <div class="u-section u-container u-container--mg-cards-2">
        <div class="u-relative mg-game__cover u-mb-10">
            <img class="u-image" :src="`/img/game-${gameSlug}.jpg`" :srcset="`/img/game-${gameSlug}@2x.jpg 2x`" alt="" role="presentation">
            <div class="card__badge card__badge--coming-soon" v-if="game?.isComingSoon">
                {{ $td('Coming soon', 'mg-games.label-coming') }}
            </div>
        </div>

        <template v-if="game">
            <div class="u-grid u-mb-10">
                <div class="u-cell u-cell--1-2">
                    <div class="u-h--uppercase u-mb-05">{{ translate('category') || 'Metagarden' }}</div>
                    <h1 class="u-h4 u-mb-05">{{ translate('title') }}</h1>
                </div>
                <div class="u-cell u-cell--1-2">
                    <div class="u-h--uppercase u-mb-05">{{ $td('Game token', 'mg-games.game-token') }}</div>
                    <div class="u-flex u-flex--align-center u-fw-700">
                        <img class="u-image--round u-mr-05 " :src="$store.getters['explorer/getCoinIcon'](game.coin)" alt="" role="presentation" width="16" height="16">
                        {{ game.coin }}
                    </div>
                </div>
            </div>
            <p class="u-mb-10 u-text-medium">{{ translate('description') }}</p>

            <slot :game="game"/>
        </template>

        <h2 class="u-h--uppercase u-mb-10 u-mt-25">{{ $td('Find more games', 'mg-games.find-more') }}</h2>
        <div class="mg-cards">
            <CardMetagardenGame
                v-for="game in otherGameList"
                :key="game.slug"
                :game="game"
            />
        </div>
    </div>
</template>
