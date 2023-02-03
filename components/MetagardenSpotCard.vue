<script>
import {claimSpotReward, getSpotInfo} from '~/api/metagarden.js';
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
    data() {
        return {
            spotInfo: {
                spots: 0,
                claimValue: 0,
                claimDays: 0,
                dailyYield: 0,
            },
            isClaimLoading: false,
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
    },
    methods: {
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
                })
                .catch(() => {
                    this.isClaimLoading = false;
                });
        },
    },
};
</script>

<template>
    <div class="card card__content--small card--metagarden card--metagarden--blobs u-text-center">
        <div class="card__action-head">
            <img class="card__action-logo" alt="" src="/img/logo-metagarden.svg">
            <div class="card__action-title">
                <div class="card__action-title-type">Metagarden</div>
                <div class="card__action-title-value">{{ $td('Mining Spot', 'todo') }}</div>
            </div>
            <div class="card__action-stats">
                <div class="card__action-stats-caption">{{ $td('You own', 'todo') }}</div>
                <div class="card__action-stats-value">{{ spotInfo.spots }}</div>
            </div>
        </div>

        <img class="u-image u-image-center u-mt-15 u-mb-10" src="/img/metagarden-spot.png" srcset="/img/metagarden-spot@2x.png 2x" alt="" role="presentation">

        <div class="u-h--uppercase u-mb-05">{{ $td('Available to claim', 'todo') }}</div>
        <div class="u-h u-h3">{{ spotInfo.claimValue }}</div>

        <div class="u-flex u-flex--align-center u-flex--justify-center u-mt-10 u-mb-10">
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

        <button
            type="button" class="button button--full"
            :class="{'is-loading': isClaimLoading, 'is-disabled': spotInfo.claimValue <= 0}"
            @click="claimSpot()"
        >
            <span class="button__content">{{ $td('Claim rewards', 'todo') }}</span>
            <BaseLoader class="button__loader" :isLoading="true"/>
        </button>
        <nuxt-link :to="$i18nGetPreferredPath('/metagarden/buy-spot')" class="button button--full">
            {{ $td('Buy more', 'todo') }}
        </nuxt-link>

        <div class="u-mt-15">
            <span class="u-h--uppercase">Daily yield:</span>
            <span class="u-h--uppercase-solid u-display-ib">
                {{ spotInfo.dailyYield }} METAGARDEN + {{ spotInfo.dailyYield }}&nbsp;VOTES
            </span>
        </div>
    </div>
</template>

<style lang="less">
@import "~/assets/less/include/variables.less";


.mg-spot__days {background: @c-night; padding: 8px; border-radius: 36px; /*width: 212px;*/ /* (24 + 2 * 2) * 7 + (8 * 2) */}
.mg-spot__days-item {
    width: 28px; height: 12px; border: 2px solid @c-metagarden; border-radius: 6px;
    &.is-active {background: @c-metagarden;;}
}
.mg-spot__days-info {cursor: help;}
</style>
