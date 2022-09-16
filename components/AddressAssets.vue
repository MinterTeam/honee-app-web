<script>
import {pretty, getExplorerAddressUrl} from '~/assets/utils.js';
import AddressBalanceList from '~/components/AddressBalanceList.vue';
import AddressStakeList from '~/components/AddressStakeList.vue';
import ReferralCard from '~/components/ReferralCard.vue';

const BALANCE_DISPLAY_BIP = 1;
const BALANCE_DISPLAY_TOTAL = 2;
const BALANCE_DISPLAY_TOTAL_USD = 3;

const ASSET_TYPE = {
    BALANCE: 'balance',
    STAKE_BY_LOCK: 'stake_by_lock',
};

export default {
    BALANCE_DISPLAY_BIP,
    BALANCE_DISPLAY_TOTAL,
    BALANCE_DISPLAY_TOTAL_USD,
    ASSET_TYPE,
    components: {
        AddressBalanceList,
        AddressStakeList,
        ReferralCard,
    },
    data() {
        return {
            selectedAssetType: ASSET_TYPE.BALANCE,
        };
    },
    watch: {
        // update tx list on balance updated
        // "$store.state.balance": function() {
        //     this.$store.dispatch('FETCH_TRANSACTION_LIST');
        // },
    },
    methods: {
        pretty,
        getExplorerAddressUrl,
    },
};
</script>

<template>
    <div class="card">
        <div class="card__content">
            <h2 class="u-h--uppercase">{{ $td('Total balance', 'index.total-balance') }}</h2>
            <div class="wallet__balance-wrap">
                <div class="wallet__balance">
                    <div class="wallet__balance-value">
                        ${{ pretty($store.state.totalBalanceSumUsd) }}
                    </div>
                </div>
                <nuxt-link class="button button--ghost-main" :to="getDashboardUrl('topup')">
                    <img class="button__icon u-hidden-small-down" src="/img/icon-deposit.svg" width="24" height="24" alt="" role="presentation">
                    {{ $td('Top up', 'index.topup') }}
                </nuxt-link>
                <nuxt-link class="button button--ghost-main" :to="getDashboardUrl('withdraw')">
                    {{ $td('Withdraw', 'index.withdraw') }}
                </nuxt-link>
                <!--<nuxt-link class="wallet__balance-buy-link button button--yellow-light button--full-mobile u-text-nowrap" :to="getDashboardUrl('buy')">
                    <img class="button__icon" src="/img/icon-category-buy.svg" width="24" height="24" alt="" role="presentation">
                    {{ $td('Buy BIP, HUB, & BEE', 'index.wallet-balance-links') }}
                </nuxt-link>-->
            </div>
        </div>
        <div class="card__content wallet__controls">
            <div class="button-group button-group--center">
                <nuxt-link class="button button--main wallet__action-button" :to="getDashboardUrl('swap')">
                    <img class="button__icon" src="/img/icon-white-swap.svg" width="24" height="24" alt="" role="presentation">
                    {{ $td('Swap', 'index.swap-wallet-button') }}
                </nuxt-link>
                <nuxt-link class="button button--main wallet__action-button" :to="getDashboardUrl('send')">
                    <img class="button__icon" src="/img/icon-white-send.svg" width="24" height="24" alt="" role="presentation">
                    {{ $td('Send', 'index.send') }}
                </nuxt-link>
                <nuxt-link class="button button--main wallet__action-button" :to="getDashboardUrl('receive')">
                    <img class="button__icon" src="/img/icon-white-receive.svg" width="24" height="24" alt="" role="presentation">
                    {{ $td('Receive', 'index.receive') }}
                </nuxt-link>
            </div>

            <hr class="card__fake-divider u-hidden-large-up">
            <ReferralCard class="wallet__controls-fancy-button"/>
        </div>
        <section class="card__content">
            <div class="wallet__asset-list-control-group u-mb-15">
                <button
                    class="wallet__asset-list-control-item u-h u-h3 u-semantic-button" type="button"
                    :class="{'is-active': selectedAssetType === $options.ASSET_TYPE.BALANCE}"
                    @click="selectedAssetType = $options.ASSET_TYPE.BALANCE"
                >
                    {{ $td('Coins', 'index.assets-coins') }}
                </button>
                <button
                    class="wallet__asset-list-control-item u-h u-h3 u-semantic-button" type="button"
                    :class="{'is-active': selectedAssetType === $options.ASSET_TYPE.STAKE_BY_LOCK}"
                    @click="selectedAssetType = $options.ASSET_TYPE.STAKE_BY_LOCK"
                >
                    {{ $td('Stakes', 'index.assets-stakes') }}
                </button>

                <a class="wallet__asset-list-tx-link link--default" :href="getExplorerAddressUrl($store.getters.address) + '?active_tab=tx#explorer-tabs'" target="_blank">{{ $td('Transactions', 'index.assets-transactions') }}</a>
            </div>
            <KeepAlive>
                <AddressBalanceList v-if="selectedAssetType === $options.ASSET_TYPE.BALANCE"/>
                <AddressStakeList v-if="selectedAssetType === $options.ASSET_TYPE.STAKE_BY_LOCK"/>
            </KeepAlive>
        </section>
    </div>
</template>
