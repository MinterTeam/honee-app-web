<script>
import {getSpotFarmerInfo} from '~/api/metagarden.js';
import {pretty, prettyRound, prettyFloor} from '~/assets/utils.js';
import {getErrorText} from '~/assets/server-error.js';
import tooltip from 'v-tooltip/src/directives/v-tooltip.js';
import BaseLoader from '~/components/base/BaseLoader.vue';

export default {
    components: {
        BaseLoader,
    },
    directives: {
        tooltip,
    },
    fetch() {
        return getSpotFarmerInfo(this.$store.getters.privateKey)
            .then((info) => {
                this.spotAmount = info.addressTotal;
                this.totalSold = info.total;
            });
    },
    props: {
        hideHead: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            spotAmount: 0,
            totalSold: 0,
        };
    },
    computed: {
        farmersLeft() {
            return 111 - this.totalSold % 111;
        },
    },
    methods: {
        pretty,
        prettyRound,
        prettyFloor,
        getErrorText,
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card__content--small card--megachain-farming card--megachain-farming--blobs u-text-center">
            <img class="u-image u-image-center u-mt-25" style="margin-bottom: -16px; padding-right: 8px;" src="/img/megachain-farmers.png" srcset="/img/megachain-farmers@2x.png 2x" alt="" role="presentation" width="315" height="230">
            <div class="card__badge card__badge--top card__badge--megachain-farmers">
                {{ $td(`Limited Offer: ${prettyRound(farmersLeft)} Farmers left`, 'mg-farming.offer-left', {left: prettyRound(farmersLeft)}) }}
            </div>
            <h1 class="u-h3">{{ $td('NFT farmer bot', 'mg-farming.buy-block-title') }}</h1>
            <p class="u-mt-10">{{ $td('Costs $100 and mines $200 for 6-18 months depending on the game you choose. Games earn fees, NFT bots collect them and send to you.', 'mg-farming.buy-block-description') }}</p>
            <nuxt-link :to="$i18nGetPreferredPath('/buy/FARMER')" class="button button--full u-mt-15 u-mb-15">
                {{ $td('Buy farmer bot for $100', 'mg-farming.buy-block-button') }}
            </nuxt-link>

            <div v-if="$fetchState.pending" class="u-text-center">
                <BaseLoader class="" :is-loading="true"/>
            </div>
            <div v-else-if="$fetchState.error" class="form__error">
                Can't get spots info: <br>
                {{ getErrorText($fetchState.error) }}
            </div>
            <div class="u-mb-05" v-else>
                <span class="u-h--uppercase">{{ $td('You own', 'metagarden.you-own') }}</span>
                <span class="u-h--uppercase-solid">{{ prettyFloor(spotAmount) || '—' }}</span>
            </div>

            <div class="u-h--uppercase-solid">{{ $td('Soon to be activated', 'mg-farming.buy-block-soon') }}</div>
        </div>

        <div class="card card__content--small card--megachain-farming u-mt-15">
            <h2 class="u-h4 u-mb-10 u-text-center">{{ $td('Farmer bots', 'mg-farming.about-farmers-title') }}</h2>

            <ul class="list-simple u-text-medium">
                <template v-if="$i18n.locale === 'en'">
                    <li>Farming in-game currency in games like Heist, Snatch, Wonder, Carrots and more;</li>
                    <li>Once activated, you can pick up rewards every day;</li>
                    <li>Rewards come in game currency of the selected game;</li>
                    <li>Once a month you can choose a different game, thus changing the farming of tokens to other games;</li>
                    <li>Each farmer bot has a unique design;</li>
                    <li>Available as an NFT;</li>
                    <li>Can be part of a collection, and as a consequence has a resale value;</li>
                    <li>Gives premium opportunities in the game whose tokens are farmed that month;</li>
                    <li>A player can have from 1 to 10 farmers on one account;</li>
                    <li>Tokens can be sold in USDT at any time and sent to Ethereum and BNB Smart Chain addresses with minimal commissions;</li>
                    <li>A player can put tokens up for sale at any price or realize them on the market;</li>
                    <li>Farmers can be sold at any inventory level;</li>
                    <li>The remaining farming potential is reflected as a percentage on each farmer;</li>
                    <li>Buying, rewarding and managing farmers is available from the games individually or from the Launchpad all at once.</li>
                </template>
                <template v-if="$i18n.locale === 'ru'">
                    <li>Добывают игровую валюту в таких играх как Heist, Snatch, Wonder, Carrots и других;</li>
                    <li>После активации можно забирать награды каждый день;</li>
                    <li>Награды поступают в игровой валюте выбранной игры;</li>
                    <li>Раз в месяц можно выбрать другую игру, тем самым сменить добычу токенов на другие;</li>
                    <li>У каждого фармера уникальный дизайн;</li>
                    <li>Выпускается в виде NFT;</li>
                    <li>Может быть частью коллекции и, как следствие, имеет ресейл стоимость;</li>
                    <li>Дает премиальные возможности в той игре, токены которой фармит в этом месяце;</li>
                    <li>Игрок может иметь от 1 до 10 фармеров на одном аккаунте;</li>
                    <li>Токены можно продать за USDT в любой момент и отправить на адреса в Ethereum и BNB Smart Chain с минимальными комиссиями;</li>
                    <li>Игрок может выставить токены на продажу по любой цене или реализовать их по рынку;</li>
                    <li>Фармеры можно продать с любым уровнем запаса;</li>
                    <li>Остаток потенциала фармера отображается в процентах на каждом фармере;</li>
                    <li>Покупка фармеров, получение наград и управление доступно как из игр по отдельности, так из Лаунчпада сразу всеми.</li>
                </template>
            </ul>
        </div>
    </div>
</template>

<style>

</style>
