<script>
import {claimSpotReward, getSpotInfo} from '~/api/metagarden.js';
import {getCard2MinterUrl, pretty} from '~/assets/utils.js';
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
        return getSpotInfo(this.$store.getters.privateKey)
            .then((info) => {
                this.spotInfo = info;
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
            /** @type {MetagardenSpotInfo} */
            spotInfo: undefined,
            isClaimLoading: false,
            serverError: '',
        };
    },
    computed: {
        days() {
            return Array.from({length: 7})
                .map((item, index) => {
                    return {
                        isAvailable: this.spotInfo?.claimDays > index,
                    };
                });
        },
        tooltipOptions() {
            return {
                content: this.$i18n.locale === 'en'
                    ? 'Claim your rewards every day. Unclaimed rewards are accumulated only for the last 7 days, and can be claimed at once. Pay attention, unclaimed rewards from 8th day and later are not available for receiving.'
                    : 'Собирать награды можно каждый день. Несобранные награды копятся только за последние 7 дней, их можно забрать одним разом. Начисленные, но не собранные награды 8 и более дней назад недоступны для получения.',
                trigger: 'click hover focus',
            };
        },
        card2MinterUrl() {
            const MINER_SPOT_COIN_SYMBOL = '_SPOT';
            return getCard2MinterUrl(this.$store.getters.address, window.location.href, MINER_SPOT_COIN_SYMBOL);
        },
    },
    methods: {
        pretty,
        getErrorText,
        claimSpot() {
            if (this.isClaimLoading || this.spotInfo?.claimValue <= 0) {
                return;
            }

            this.isClaimLoading = true;
            return claimSpotReward(this.$store.getters.privateKey)
                .then(() => {
                    this.isClaimLoading = false;
                    this.spotInfo.claimValue = 0;
                    this.spotInfo.claimDays = 0;
                    this.spotInfo.isMiningStarted = true;
                })
                .catch((error) => {
                    this.isClaimLoading = false;
                    this.serverError = getErrorText(error);
                });
        },
    },
};
</script>

<template>
    <div class="card card__content--small card--metagarden card--metagarden--blobs u-text-center">
        <div class="card__action-head" v-if="!hideHead">
            <img class="card__action-logo" alt="" src="/img/logo-metagarden.svg">
            <div class="card__action-title">
                <div class="card__action-title-type">Metagarden</div>
                <div class="card__action-title-value">{{ $td('Miners', 'metagarden.mining-spots') }}</div>
            </div>
            <div class="card__action-stats">
                <div class="card__action-stats-caption">{{ $td('You own', 'metagarden.you-own') }}</div>
                <div class="card__action-stats-value">{{ pretty(spotInfo?.spots) || '—' }}</div>
            </div>
        </div>

        <!--<video class="u-image u-image-center u-mt-15 u-mb-10" width="210" height="100%" autoplay loop muted playsinline>
            <source src="/video/spot-video3.mov" type="video/mp4">
            <source src="/video/spot-video.webm" type="video/webm">
        </video>-->
        <img v-if="!hideHead" class="u-image u-image-center u-mt-15 u-mb-10" src="/img/metagarden-spot.png" srcset="/img/metagarden-spot@2x.png 2x" alt="" role="presentation">

        <div v-if="$fetchState.pending" class="u-text-center">
            <BaseLoader class="" :is-loading="true"/>
        </div>
        <div v-else-if="$fetchState.error" class="form__error">
            Can't get spots info: <br>
            {{ getErrorText($fetchState.error) }}
        </div>
        <template v-else-if="spotInfo">
            <div class="u-h--uppercase u-mb-05 u-mt-10">{{ $td('Available to claim', 'metagarden.available-to-claim') }}</div>
            <div class="u-h u-h3">${{ pretty(spotInfo.claimValue) }}</div>

            <div class="u-flex u-flex--align-center u-flex--justify-center u-mt-10" v-if="spotInfo.isMiningStarted">
                <div class="mg-spot__days u-flex u-mr-05">
                    <div
                        class="mg-spot__days-item u-flex-item--grow"
                        v-for="(day, index) in days"
                        :key="index"
                        :class="{'is-active': day.isAvailable}"
                    ></div>
                </div>

                <img
                    class="mg-spot__days-info" src="/img/icon-metagarden-info.svg" alt="Info"
                    v-tooltip="tooltipOptions"
                >
            </div>
        </template>

        <button
            type="button" class="button button--full u-mt-10"
            :class="{'is-loading': isClaimLoading, 'is-disabled': !spotInfo || spotInfo.claimValue <= 0}"
            @click="claimSpot()"
        >
            <span class="button__content" v-if="spotInfo?.isMiningStarted">{{ $td('Claim rewards', 'metagarden.claim-rewards-button') }}</span>
            <span class="button__content" v-else>{{ $td('Start mining', 'metagarden.start-mining-button') }}</span>
            <BaseLoader class="button__loader" :isLoading="true"/>
        </button>

        <div class="u-h--uppercase u-mb-05 u-mt-15">{{ $td('Buy miners', 'metagarden.buy-more-button') }}</div>
        <div class="u-grid u-grid--smaller-mobile">
            <div class="u-cell u-cell--1-2">
                <a :href="card2MinterUrl" class="button button--full button--very-narrow">
                    <img class="button__icon" src="/img/icon-topup-card.svg" alt="" role="presentation"/>
                    {{ $td('With card', 'metagarden.buy-button-card') }}
                </a>
            </div>
            <div class="u-cell u-cell--1-2">
                <nuxt-link :to="$i18nGetPreferredPath('/metagarden/buy-spot')" class="button button--full button--narrow">
                    <img class="button__icon" src="/img/icon-blockchain.svg" alt="" role="presentation"/>
                    {{ $td('With crypto', 'metagarden.buy-button-crypto') }}
                </nuxt-link>
            </div>
        </div>

        <div class="form__error u-mt-10" v-if="serverError">
            {{ serverError }}
        </div>

        <div class="u-mt-15" v-if="spotInfo?.spots > 0">
            <span class="u-h--uppercase">{{ $td('Daily yield:', 'metagarden.daily-yield') }}</span>
            <span class="u-h--uppercase-solid u-display-ib">
                {{ pretty(spotInfo.dailyYield) }} METAGARDEN + {{ pretty(spotInfo.dailyYield) }}&nbsp;VOTES
            </span>
        </div>
    </div>
</template>

<style lang="less">
@import "~/assets/less/include/variables.less";


.mg-spot__days {background: @c-night-dark; padding: 8px; border-radius: 36px; /*width: 212px;*/ /* (24 + 2 * 2) * 7 + (8 * 2) */}
.mg-spot__days-item {
    --color-spot-day-bg: @c-metagarden;
    width: 28px; height: 12px; border: 2px solid var(--color-spot-day-bg); border-radius: 6px;
    &.is-active {background: var(--color-spot-day-bg);}
    &:nth-child(2) {--color-spot-day-bg: #8bed60;}
    &:nth-child(3) {--color-spot-day-bg: #b5f44d;}
    &:nth-child(4) {--color-spot-day-bg: #e1f837;}
    &:nth-child(5) {--color-spot-day-bg: #eab328;}
    &:nth-child(6) {--color-spot-day-bg: #f26f19;}
    &:nth-child(7) {--color-spot-day-bg: #fc1b06;}
}
.mg-spot__days-info {cursor: help;}
</style>
