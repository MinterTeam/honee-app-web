<script>
import metagardenGames from '~/data/metagarden-games.js';
import {pretty, prettyRound} from '~/assets/utils';
import LiteYoutube from '~/components/base/LiteYoutube.vue';
import FieldAddressDisplay from '~/components/base/FieldAddressDisplay.vue';
import MetagardenLootboxCard from '~/components/MetagardenLootboxCard.vue';
import ReferralCard from '~/components/ReferralCard.vue';
import CardMetagardenGame from '~/components/CardMetagardenGame.vue';

export default {
    components: {
        CardMetagardenGame,
        LiteYoutube,
        // FieldAddressDisplay,
        MetagardenLootboxCard,
        ReferralCard,
    },
    head: {
        bodyAttrs: {
            class: 'megachain__body',
        },
    },
    fetch() {
    },
    /*
    head: {
        htmlAttrs: {
            class: 'metagarden-layout theme--metagarden',
        },
    },
    */
    data() {
        return {
            isJustGrubbed: false,
        };
    },
    computed: {
        coin() {
            return 'LAUNCHER';
        },
        gameList() {
            return metagardenGames;
        },
    },
    methods: {
        pretty,
        prettyRound,
        grabWelcomeBonus() {
            this.isJustGrubbed = true;
            this.$store.dispatch('megachain/grabWelcomeBonus');
        },
    },
};
</script>

<template>
    <div class="u-container--small">
        <img class="u-image u-image-center u-mb-15" src="/img/logo-megachain-side.svg" alt="Metagarden Chain" width="265" height="48">

        <div class="card card--megachain-welcome card__content card__content--medium u-mb-15 u-text-center">
            <img class="u-image u-image-center u-mb-05" src="/img/megachain-gamepad.png" srcset="/img/megachain-gamepad@2x.png 2x" alt="">
            <h2 class="u-h3 u-mb-05">{{ $td('Welcome!', 'meganet.welcome-title') }}</h2>
            <p>{{ $td('Thank you for launching Launchpad with best games in Telegram. Here you can get bonuses for playing everyday. We give you $10 of the new blockchain as welcome bonus.', 'meganet.welcome-description') }}</p>
            <button
                v-if="!$store.state.megachain.isCollectedWelcomeBonus || isJustGrubbed"
                class="button button--full u-mt-10" type="button"
                :class="isJustGrubbed ? 'is-disabled' : 'button--meganet-welcome'"
                @click="grabWelcomeBonus()"
            >
                <img class="button__icon" src="/img/icon-present.svg" alt="" role="presentation">
                <template v-if="!isJustGrubbed">{{ $td('Grab your $10', 'todo') }}</template>
                <template v-else>{{ $td('Success!', 'todo') }}</template>

            </button>
            <a class="button button--telegram button--full u-mt-10" target="_blank" href="https://t.me/+Uy8uBelJEx1iNTVi">
                <img class="button__icon" src="/img/icon-social-telegram.svg" alt="Telegram">
                {{ $td('Join our private group', 'todo') }}
            </a>
        </div>

        <MetagardenLootboxCard
            class="card card__content card__content--medium u-mb-15"
            :allow-empty="true"
            external-link="https://my.honee.app/metagarden/lootbox"
        />

        <h2 class="u-h--uppercase-solid u-mb-10 u-mt-25">{{ $td('Play our games', 'meganet.play-our-games') }}</h2>
        <div class="mg-cards mg-cards--inline u-mb-15">
            <CardMetagardenGame
                v-for="game in gameList"
                :key="game.slug"
                :game="game"
            />
        </div>

        <div class="card card--megachain u-mb-15">
            <div class="card__content card__content--medium u-text-center">
                <h2 class="u-h3 u-mb-05">{{ $td(`Buy ${coin} tokens to receive bonus & aidrops from games`, 'meganet.early-adopter-title') }}</h2>
                <p class="u-text-medium">
                    {{ $td(`All ${coin} token holders will receive MEGA coins (native Metagarden Chain coins) with a bonus after the Mainnet launch.`, 'meganet.early-adopter-description', {coin}) }}
                    <!--
                    {{ $td('The current price of ${coin} is ', 'early-adopter-description-price', {coin}) }}
                    <span class="span-green">$0.64</span>
                    {{ $td('per token.', 'meganet.token-price-stages-description-2') }}
                    -->
                </p>

                <!--<div class="meganet__range u-mt-15" :style="`--val: 905; --min: 0; --max: 1000; --step: 1`"></div>

                <div class="u-mt-10 u-text-medium u-fw-700">{{ $td('', 'meganet.tokens-left-1') }}{{ prettyRound(1000000 - 905000) }} {{ $td('of 1 000 000 tokens left', 'meganet.tokens-left-2') }}</div>-->

                <nuxt-link class="button button--main button--full u-mt-10" :to="$i18nGetPreferredPath('/meganet/balance')">
                    {{ $td(`Buy ${coin} tokens`, 'meganet.buy-button', {coin}) }}
                </nuxt-link>
            </div>
        </div>

        <!--<div class="card card--megachain card__content card__content--medium u-text-center u-mb-15">
            <h2 class="u-h3 u-mb-05">{{ $td('MEGANET price stages', 'meganet.token-price-stages-title') }}</h2>
            <p class="u-text-medium u-mb-10">{{ $td('The current price of early access MEGANET tokens is', 'meganet.token-price-stages-description-1') }} <span class="span-green">$0.64</span> {{ $td('per token.', 'meganet.token-price-stages-description-2') }}</p>
            <img src="/img/megachain-prices.svg" alt="MEGANET Price Stages" width="100%">
            <p class="u-text-small">{{ $td('The token price can be subject to increase at any time.', 'meganet.token-price-stages-p') }}</p>
        </div>-->

        <div class="card card--megachain card__content card__content--medium u-text-center u-mb-15">
            <div class="video-section-video">
                <LiteYoutube
                    class="video-youtube u-mb-10"
                    :video-id="$td('xC97gHtKO6w', 'meganet.gaming-platform-videoid')"
                />
            </div>
            <h2 class="u-h3 u-mb-05">{{ $td('Gaming Platform', 'meganet.gaming-platform-title') }}</h2>
            <p class="u-text-medium u-mb-10">{{ $td('Try out the first play-to-earn Metagarden platform games. By the end of 2023, we plan to launch more than 100 mini-games from different developers. The games presented are in alpha status and can be played from a single Telegram bot, so you can easily switch between them without leaving your favorite messenger.', 'meganet.gaming-platform-p') }}</p>
            <a class="button button--main button--full u-mb-05" href="https://t.me/metagardenbot?start=start" target="_blank">{{ $td('Play', 'meganet.gaming-platform-button') }}</a>
            <p class="u-text-small u-mb-10">{{ $td('Try α-versions of our games in Telegram', 'meganet.gaming-platform-p-small') }}</p>
            <a :href="$td('https://metagarden.io/platform', 'meganet.gaming-platform-more-url')" target="_blank" class="link link--bold link--underline">{{ $td('Read more about platform', 'meganet.gaming-platform-more') }}</a>
        </div>

        <!--
        <div class="card card&#45;&#45;megachain card__content card__content&#45;&#45;medium u-text-center u-mb-15">
            <h2 class="u-h3 u-mb-05">{{ $td('Your testnet address', 'meganet.testnet-address-title') }}</h2>

            <FieldAddressDisplay
                class="u-mt-10"
                :value="$store.getters.evmAddress"
                :label="$td('Metagarden testnet address', 'meganet.testnet-address-label')"
            />

            <a class="button button&#45;&#45;main button&#45;&#45;full u-mt-10" :href="`https://scan.testnet.metagarden.io/address/${$store.getters.evmAddress}`" target="_blank">{{ $td('View in block explorer', 'meganet.testnet-address-button') }}</a>
        </div>
        -->
        <div class="card card--megachain card__content card__content--medium u-text-center">
            <h2 class="u-h3 u-mb-05">{{ $td('Useful links', 'meganet.useful-links-title') }}</h2>

            <a class="button button--ghost-main button--full u-mt-10" :href="$td('https://metagarden.io/', 'meganet.useful-links-button-about-url')" target="_blank">{{ $td('About EVM blockchain', 'meganet.useful-links-button-about') }}</a>
            <a class="button button--ghost-main button--full u-mt-10" :href="$td('https://metagarden.io/tokenomics', 'meganet.useful-links-button-tokenomics-url')" target="_blank">{{ $td('Tokenomics', 'meganet.useful-links-button-tokenomics') }}</a>
            <a class="button button--ghost-main button--full u-mt-10" :href="$td('https://metagarden.io/platform', 'meganet.useful-links-button-platform-url')" target="_blank">{{ $td('Gaming platform', 'meganet.useful-links-button-platform') }}</a>
            <a class="button button--ghost-main button--full u-mt-10" :href="$td('https://metagarden.io/influencer', 'meganet.useful-links-button-influencer-url')" target="_blank">{{ $td('For Influencers', 'meganet.useful-links-button-influencer') }}</a>
        </div>

        <ReferralCard class="card card--megachain card__content card__content--medium u-mt-10" :is-modal-button="false" v-if="$route.query.debug"/>
    </div>
</template>

<style lang="less">
@import '~/assets/less/include/variables.less';

.u-text-mega-muted {color: #8b5ab9;}
.meganet-range-track() {
    border-radius: 8px;
    height: 16px;
}
.meganet__range {
    .meganet-range-track(); background: #1c082f; position: relative;
    --meganet-width-percent: var(--val) / var(--max) * 100%;
    // progress
    &::before {
        .meganet-range-track();
        content: ''; position: absolute; left: 0; top: 0;
        background: var(--color-main);
        width: ~"calc(max(var(--meganet-width-percent), 8px))";
    }
    // thumb
    &::after {
        content: '';
        position: absolute;
        width: 40px;
        height: 40px;
        left: ~"calc(max(var(--meganet-width-percent) - 24px, -16px))";
        top: (-1 * (40px - 16px) / 2);
        background: var(--color-main);
        opacity: 0.56;
        filter: blur(12px);
        border-radius: 50%;
    }
}
</style>
