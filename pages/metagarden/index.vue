<script>
import metagardenGames from '~/data/metagarden-games.js';
import CardMetagardenGame from '~/components/CardMetagardenGame.vue';

const recentSlugList = [
    'miner',
    'magic-box',
];

export default {
    layout: 'metagarden',
    components: {
        CardMetagardenGame,
    },
    computed: {
        recentList() {
            return this.gameList.filter((game) => recentSlugList.includes(game.slug));
        },
        gameList() {
            return metagardenGames;
        },
        comingSoonList() {
            return metagardenGames.filter((game) => game.isComingSoon);
        },
    },
};
</script>

<template>
    <div class="u-section u-container u-container--mg-cards-4">
        <h2 class="u-h--uppercase u-mb-10">{{ $td('Recent games', 'mg-games.title-recent') }}</h2>
        <div class="mg-cards">
            <CardMetagardenGame
                v-for="game in recentList"
                :key="game.slug"
                :game="game"
            />
        </div>

        <h2 class="u-h--uppercase u-mb-10 u-mt-25">{{ $td('All games', 'mg-games.title-all') }}</h2>
        <div class="mg-cards">
            <CardMetagardenGame
                v-for="game in gameList"
                :key="game.slug"
                :game="game"
            />
        </div>

        <h2 class="u-h--uppercase u-mb-10 u-mt-25">{{ $td('Coming soon', 'mg-games.title-coming') }}</h2>
        <div class="mg-cards">
            <CardMetagardenGame
                v-for="game in comingSoonList"
                :key="game.slug"
                :game="game"
            />
        </div>
    </div>
</template>
