<script>
import {pretty, getExplorerAddressUrl} from '~/assets/utils.js';
import InlineSvg from 'vue-inline-svg';
import BaseTabs from '~/components/base/BaseTabs.vue';
import AddressBalanceList from '~/components/AddressBalanceList.vue';
import AddressStakeList from '~/components/AddressStakeList.vue';

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
        InlineSvg,
        BaseTabs,
        AddressBalanceList,
        AddressStakeList,
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
                    <div class="wallet__balance-value u-mb-05">
                        ${{ pretty($store.state.totalBalanceSumUsd) }}
                    </div>
                    <div class="button-group button-group--small">
                        <nuxt-link class="button button--small button--light-gray" :to="$getDashboardUrl('topup')">
                            {{ $td('&#43; Deposit', 'index.topup') }}
                        </nuxt-link>
                        <nuxt-link class="button button--small button--light-gray" :to="$getDashboardUrl('withdraw')">
                            {{ $td('&#8599; Withdraw', 'index.withdraw') }}
                        </nuxt-link>
                    </div>
                </div>

                <div class="card__fake-divider u-hidden-medium-up"></div>

                <div class="button-group button-group--center">
                    <nuxt-link class="button button--main wallet__action-button link--opacity" :to="$getDashboardUrl('swap')">
                        <!--<img class="button__icon u-hidden-medium-down" src="/img/icon-white-swap.svg" width="24" height="24" alt="" role="presentation">-->
                        <InlineSvg class="button__icon" src="/img/icon-swap.svg" width="24" height="24" alt="" role="presentation"/>
                        {{ $td('Swap', 'index.swap-wallet-button') }}
                    </nuxt-link>
                    <nuxt-link class="button button--main wallet__action-button link--opacity" :to="$getDashboardUrl('send')">
                        <!--<img class="button__icon u-hidden-medium-down" src="/img/icon-white-send.svg" width="24" height="24" alt="" role="presentation">-->
                        <InlineSvg class="button__icon" src="/img/icon-send.svg" width="24" height="24" alt="" role="presentation"/>
                        {{ $td('Send', 'index.send') }}
                    </nuxt-link>
                    <nuxt-link class="button button--main wallet__action-button link--opacity" :to="$getDashboardUrl('/topup/minter')">
                        <!--<img class="button__icon u-hidden-medium-down" src="/img/icon-white-receive.svg" width="24" height="24" alt="" role="presentation">-->
                        <InlineSvg class="button__icon" src="/img/icon-receive.svg" width="24" height="24" alt="" role="presentation"/>
                        {{ $td('Receive', 'index.receive') }}
                    </nuxt-link>
                </div>
            </div>
        </div>
        <section class="card__content">
            <div class="u-flex u-flex--align-start u-mb-15">
                <BaseTabs
                    v-model="selectedAssetType"
                    :tabs="[
                        {value: $options.ASSET_TYPE.BALANCE, label: $td('Coins', 'index.assets-coins')},
                        {value: $options.ASSET_TYPE.STAKE_BY_LOCK, label: $td('Stakes', 'index.assets-stakes')},
                    ]"
                />

                <a class="wallet__asset-list-tx-link link--default" :href="getExplorerAddressUrl($store.getters.address) + '?active_tab=tx#explorer-tabs'" target="_blank">{{ $td('Transactions', 'index.assets-transactions') }}</a>
            </div>
            <KeepAlive>
                <AddressBalanceList v-if="selectedAssetType === $options.ASSET_TYPE.BALANCE"/>
                <AddressStakeList v-if="selectedAssetType === $options.ASSET_TYPE.STAKE_BY_LOCK"/>
            </KeepAlive>
        </section>
    </div>
</template>
