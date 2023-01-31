<script>
import {getSpotInfo} from '~/api/metagarden.js';

export default {
    fetch() {
        return getSpotInfo(this.$store.getters.address)
            .then((info) => {
                this.spotInfo = info;
            });
    },
    data() {
        return {
            spotInfo: null,
        };
    },
};
</script>

<template>
    <div class="card card__content--small card--metagarden">
        <div class="card__action-head">
            <img class="card__action-logo" alt="" src="/img/logo-metagarden.svg">
            <div class="card__action-title">
                <div class="card__action-title-type">Metagarden</div>
                <div class="card__action-title-value">{{ $td('Mining Spot', 'todo') }}</div>
            </div>
            <div class="card__action-stats">
                <div class="card__action-stats-caption">{{ $td('You own', 'todo') }}</div>
                <div class="card__action-stats-value">{{ spotInfo ? spotInfo.spots : 0 }}</div>
            </div>
        </div>

        <img class="u-image u-image-center u-mt-15 u-mb-10" src="/img/metagarden-spot.png" srcset="/img/metagarden-spot@2x.png 2x" alt="" role="presentation">

        <!--
        <nuxt-link :to="$i18nGetPreferredPath('/metagarden/claim')" class="button button&#45;&#45;full">
            {{ $td('Claim rewards', 'todo') }}
        </nuxt-link>
        -->
        <nuxt-link :to="$i18nGetPreferredPath('/metagarden/buy-spot')" class="button button--full">
            {{ $td('Buy more', 'todo') }}
        </nuxt-link>
    </div>
</template>
