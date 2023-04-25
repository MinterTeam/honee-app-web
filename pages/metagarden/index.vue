<script>
import metagardenGames from '~/data/metagarden-games.js';
import CardMetagardenGame from '~/components/CardMetagardenGame.vue';
import InlineSvg from 'vue-inline-svg';
import {getCard2MinterUrl} from '~/assets/utils.js';

const recentSlugList = [
    'miner',
    'magic-box',
];

export default {
    layout: 'metagarden',
    components: {
        InlineSvg,
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
        card2MinterUrl() {
            return getCard2MinterUrl({
                address: this.$store.getters.address,
                returnUrl: window.location.origin,
                coin: 'METAGARDEN',
            });
        },
    },
};
</script>

<template>
    <div class="u-section u-container u-container--mg-cards-4">
        <div class="button-group button-group--center u-mb-25">
            <a class="wallet__topup-button link link--main link--opacity" :href="card2MinterUrl">
                <InlineSvg class="button__icon" src="/img/icon-topup-card.svg" width="24" height="24" alt="" role="presentation"/>
                {{ $td('Topup with cards', 'deposit.title-cards') }}
            </a>
            <nuxt-link class="wallet__topup-button link link--main link--opacity" :to="$i18nGetPreferredPath('/topup/crypto')">
                <InlineSvg class="button__icon" src="/img/icon-blockchain.svg" width="24" height="24" alt="" role="presentation"/>
                {{ $td('Topup with crypto', 'deposit.title-crypto') }}
            </nuxt-link>
            <nuxt-link class="wallet__topup-button link link--main link--opacity" :to="$i18nGetPreferredPath('/swap/METAGARDEN')">
                <InlineSvg class="button__icon" src="/img/logo-metagarden-simple.svg" width="24" height="24" alt="" role="presentation"/>
                {{ $td('Buy more tokens', 'deposit.title-buy-more') }}
            </nuxt-link>
        </div>

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
