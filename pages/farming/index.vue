<script>
import {getSpotFarmerInfo} from '~/api/metagarden.js';
import {pretty} from '~/assets/utils.js';
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
        getErrorText,
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card__content--small card--megachain-farming card--megachain-farming--blobs u-text-center">
            <img class="u-image u-image-center u-mt-15" style="margin-bottom: -16px; padding-right: 8px;" src="/img/megachain-farmers.png" srcset="/img/megachain-farmers@2x.png 2x" alt="" role="presentation" width="315" height="230">
            <div class="card__badge card__badge--top card__badge--megachain-farmers">
                {{ $td(`Limited offer: ${farmersLeft} Farmers left`, 'todo', {left: farmersLeft}) }}
            </div>
            <h1 class="u-h3">{{ $td('Gaming Token Farmers', 'todo') }}</h1>

            <nuxt-link :to="$i18nGetPreferredPath('/farming/options')" class="button button--full u-mt-15 u-mb-15">
                {{ $td('Buy Farmers for $100', 'todo') }}
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
                <span class="u-h--uppercase-solid">{{ spotAmount }}</span>
            </div>

            <div class="u-h--uppercase-solid">{{ $td('Soon to be activated', 'todo') }}</div>
        </div>

        <div class="card card__content--small card--megachain-farming u-mt-15">
            <h2 class="u-h4 u-mb-10 u-text-center">{{ $td('About Farmers', 'todo') }}</h2>

            <ul class="list-simple u-text-medium">
                <li>Добывают игровую валюту в таких играх как Heist, Snatch, Wonder, Carrots и&nbsp;других</li>
                <li>После активации можно забирать награды каждый день</li>
                <li>Награды поступают в игровой валюте выбранной игры</li>
                <li>Раз в месяц можно выбрать другую игру, тем&nbsp;самым сменить добычу токенов на&nbsp;другие</li>
                <li>У каждого майнера уникальный дизайн</li>
                <li>У каждого майнера уникальный дизайн</li>
                <li>Может быть частью коллекции, и&nbsp;как следствие имеет ресейл стоимость</li>
                <li>Дает премиальные возможности в&nbsp;той игре, токены которой майнит в&nbsp;этом&nbsp;месяце</li>
                <li>Игрок может иметь от 1 до 10 майнеров на одном аккаунте</li>
                <li>Токены можно продать в USDT в любой момент и&nbsp;отправить на&nbsp;адреса в Ethereum и BNB Smart Chain с&nbsp;минимальными комиссиями</li>
                <li>Игрок может выставить токены на продажу по&nbsp;любой цене или реализовать их&nbsp;по&nbsp;рынку</li>
                <li>Майнеры можно продать с любым уровнем запаса</li>
                <li>Остаток потенциала майнинга отражается в&nbsp;процентах на каждом майнере</li>
                <li>Покупка майнеров, получение наград и&nbsp;управление доступно как из&nbsp;игр по&nbsp;отдельности, так из&nbsp;Лаунчпада сразу&nbsp;всеми</li>
            </ul>
        </div>
    </div>
</template>

<style>

</style>
