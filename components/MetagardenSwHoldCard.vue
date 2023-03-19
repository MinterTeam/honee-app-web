<script>
import {getCurrentInstance, watch} from 'vue';
import tooltip from 'v-tooltip/src/directives/v-tooltip.js';
import {pretty} from '~/assets/utils.js';
import {getErrorText} from '~/assets/server-error.js';
import {BSC_CHAIN_ID, HUB_NETWORK_SLUG} from '~/assets/variables.js';
import useWeb3TokenBalance from '~/composables/use-web3-token-balance.js';
import useWeb3SmartWallet from '~/composables/use-web3-smartwallet.js';


export default {
    HUB_NETWORK_SLUG,
    components: {
    },
    directives: {
        tooltip,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy;

        const {smartWalletAddress, setSmartWalletProps} = useWeb3SmartWallet();
        setSmartWalletProps({
            evmAccountAddress: vm.$store.getters.evmAddress,
        });

        const {balance, setWeb3TokenProps} = useWeb3TokenBalance();

        watch(smartWalletAddress, () => {
            setWeb3TokenProps({
                tokenSymbol: 'METAGARDEN',
                chainId: BSC_CHAIN_ID,
                accountAddress: smartWalletAddress.value,
            });
        }, {immediate: true});

        return {
            evmBalance: balance,
            smartWalletAddress,
        };
    },
    data() {
        return {
        };
    },
    computed: {
        minterBalance() {
            return this.$store.getters.getBalanceAmount('METAGARDEN');
        },
        apr() {
            // 3% monthly
            return (this.evmBalance || 0) * 0.36;
        },
        tooltipOptions() {
            return {
                content: this.$i18n.locale === 'en'
                    ? 'The program will run until May 31, 2023. Rewards are automatically paid once a week in METAGARDEN tokens. Tokens transferred to a smart wallet can be withdrawn at any time.'
                    : 'Программа действует до 31 мая 2023 г. Награды выплачиваются автоматически раз в неделю в токенах METAGARDEN. Токены, которые вы перечислите на смарт-кошелек можно забрать в любой момент.',
                trigger: 'click hover focus',
            };
        },
    },
    methods: {
        pretty,
        getErrorText,
    },
};
</script>

<template>
    <div class="card card__content--small card--sw-hold u-text-center">
        <img
            class="mg-sw-hold__info" src="/img/icon-metagarden-info.svg" alt="Info"
            v-tooltip="tooltipOptions"
        >

        <img class="u-image u-image-center u-mb-10" src="/img/metagarden-sw-hold.png" srcset="/img/metagarden-sw-hold@2x.png 2x" alt="" role="presentation" width="165" height="128">

        <h2 class="u-h4 u-mb-10">{{ $td('Hold METAGARDEN tokens in your smart wallet and earn 3% revenue per month.', 'metagarden.smart-hold') }}</h2>

        <nuxt-link v-if="minterBalance > 0" class="button button--full" :to="$i18nGetPreferredPath(`/withdraw?coin=METAGARDEN&network=${$options.HUB_NETWORK_SLUG.BSC}&address=${smartWalletAddress}`)">
            {{ $td('Transfer to Smart-Wallet', 'metagarden.transfer-smart-wallet') }}
        </nuxt-link>
        <nuxt-link v-else class="button button--main button--full" :to="$i18nGetPreferredPath('/swap/METAGARDEN')">
            {{ $t('action.title-buy-coin', {coin: 'METAGARDEN'}) }}
        </nuxt-link>


        <!--<div v-if="$fetchState.pending" class="u-text-center">-->
        <!--    <BaseLoader class="" :is-loading="true"/>-->
        <!--</div>-->
        <!--<div v-else-if="$fetchState.error" class="form__error">-->
        <!--    Can't get spots info: <br>-->
        <!--    {{ getErrorText($fetchState.error) }}-->
        <!--</div>-->


        <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10" v-if="minterBalance > 0">
            <div class="u-flex u-flex--align-center">
                <img class="u-image u-mr-05" alt="" src="/img/logo-metagarden.svg" width="24" height="24">
                <div class="u-h--uppercase u-text-sw-hold">{{ $td('Available for transfer', 'metagarden.available-for-transfer') }}</div>
            </div>

            <div class="u-h u-h3">{{ pretty(minterBalance) || '0' }}</div>
        </div>
        <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10" v-if="evmBalance > 0">
            <div class="u-flex u-flex--align-center">
                <div class="u-mr-05" style="width: 24px"></div>
                <div class="u-h--uppercase u-text-sw-hold">{{ $td('METAGARDEN in Smart-Wallet', 'metagarden.balance-smart-wallet') }}</div>
            </div>

            <div class="u-h u-h3">{{ pretty(evmBalance) || '0' }}</div>
        </div>
        <!--<div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10" v-if="evmBalance > 0">
            <div class="u-flex u-flex--align-center">
                <div class="u-mr-05" style="width: 24px"></div>
                <div class="u-h--uppercase u-text-sw-hold">{{ $td('Rewards for hodl, annual rate of 36%', 'metagarden.todo') }}</div>
            </div>

            <div class="u-h u-h3">{{ pretty(apr) }}</div>
        </div>-->
    </div>
</template>

<style lang="less">
.card--sw-hold {
    background: url(/img/metagarden-sw-hold-bg.svg) no-repeat 50% 34px, radial-gradient(57.86% 117.71% at 32.94% 27.08%, #091A57 0%, #1849A9 100%) #1849A9;
}
.u-text-sw-hold {color: #a7c1f4;}
.mg-sw-hold__info {position: absolute; right: 16px; top: 16px; cursor: help;}
</style>
