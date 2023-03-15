<script>
import CardMetagardenGame from '~/components/CardMetagardenGame.vue';

const recentSlugList = [
    'mining-spot',
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
            return [
                {
                    title: this.$td('Perfect City NFT', 'mg-games.game-perfect-city'),
                    coin: 'SHEKEL',
                    slug: 'perfect-city',
                },
                {
                    title: this.$td('Miner', 'mg-games.game-miner'),
                    coin: 'METAGARDEN',
                    slug: 'mining-spot',
                },
                {
                    title: this.$td('Magic Box', 'mg-games.game-magic-box'),
                    coin: 'METAGARDEN',
                    slug: 'magic-box',
                },
                {
                    title: this.$td('Chess', 'mg-games.game-chess'),
                    coin: 'CHESS',
                    slug: 'chess',
                    isComingSoon: true,
                },
                {
                    title: this.$td('Carrots Mafia', 'mg-games.game-carrots-mafia'),
                    coin: 'CARROTS',
                    slug: 'carrots-mafia',
                    isComingSoon: true,
                },
            ];
        },
        comingSoonList() {
            return [
                {
                    title: this.$td('Chess', 'mg-games.game-chess'),
                    coin: 'CHESS',
                    slug: 'chess',
                    isComingSoon: true,
                },
                {
                    title: this.$td('Carrots Mafia', 'mg-games.game-carrots-mafia'),
                    coin: 'CARROTS',
                    slug: 'carrots-mafia',
                    isComingSoon: true,
                },
            ];
        },
    },
};
</script>

<template>
    <div class="u-section u-container u-container--mg-cards">
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
