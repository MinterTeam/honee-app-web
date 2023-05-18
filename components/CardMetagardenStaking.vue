<script>
import {pretty} from '~/assets/utils.js';

export default {
    methods: {
        pretty,
    },
};
</script>
<template>
    <div class="card card__content--small card--metagarden-staking u-text-center u-mt-10">
        <div class="card__action-head">
            <img class="card__action-logo" alt="" src="/img/logo-metagarden.svg">
            <div class="card__action-title">
                <div class="card__action-title-type">Metagarden</div>
                <div class="card__action-title-value">{{ $td('Staking', 'metagarden.staking-card-title') }}</div>
            </div>
            <div class="card__action-stats">
                <div class="card__action-stats-caption">{{ $td('APR', 'metagarden.staking-card-apr-title') }}</div>
                <div class="card__action-stats-value">{{ $td('up to 20%', 'metagarden.staking-card-apr-value') }}</div>
            </div>
        </div>
        <img class="u-image u-image-center u-mt-15 u-mb-10" src="/img/metagarden-staking.png" srcset="/img/metagarden-staking@2x.png 2x" alt="" role="presentation" width="135" height="137">
        <p class="card__action-description">{{ $td(`Stake METAGARDEN for 1, 2 or 3 years to get everyday rewards. The longer you stake, the more you earn!`, 'metagarden.staking-card-description') }}</p>

        <nuxt-link :to="$i18nGetPreferredPath('/stake/32')" class="button button--full button--main u-mt-15">
            {{ $td('Stake METAGARDEN', 'metagarden.staking-card-button') }}
        </nuxt-link>
        <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10">
            <div class="u-flex u-flex--align-center">
                <div class="u-h--uppercase u-text-sw-hold">{{ $td('Available for staking', 'metagarden.staking-card-available') }}</div>
            </div>
            <div class="u-h u-h3">{{ pretty($store.getters.getBalanceAmount('METAGARDEN')) }}</div>
        </div>
    </div>
</template>
