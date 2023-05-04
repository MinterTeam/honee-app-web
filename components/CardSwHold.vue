<script>
import {getCurrentInstance} from 'vue';
import {pretty} from '~/assets/utils.js';
import {getErrorText} from '~/assets/server-error.js';
import {BSC_CHAIN_ID, HUB_NETWORK_SLUG} from '~/assets/variables.js';
import useWeb3TokenBalance from '~/composables/use-web3-token-balance.js';
import CardHead from '~/components/CardHead.vue';
import BaseTooltip from '~/components/base/BaseTooltip.vue';


export default {
    HUB_NETWORK_SLUG,
    components: {
        BaseTooltip,
        CardHead,
    },
    props: {
        coin: {
            type: String,
            required: true,
        },
        isSmall: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy;

        const {balance, setWeb3TokenProps} = useWeb3TokenBalance();
        setWeb3TokenProps({
            tokenSymbol: props.coin,
            chainId: BSC_CHAIN_ID,
            accountAddress: vm.$store.getters.smartWalletAddress,
        });

        return {
            evmBalance: balance,
        };
    },
    data() {
        return {
        };
    },
    computed: {
        minterBalance() {
            return this.$store.getters.getBalanceAmount(this.coin);
        },
        smartWalletAddress() {
            return this.$store.getters.smartWalletAddress;
        },
        apr() {
            // 3% monthly
            return (this.evmBalance || 0) * 0.36;
        },
        tooltipContent() {
            return this.$i18n.locale === 'en'
                ? `The program will run until May 31, 2023. Rewards are automatically paid once a week in ${this.coin} tokens. Tokens transferred to a smart wallet can be withdrawn at any time.`
                : `Программа действует до 31 мая 2023 г. Награды выплачиваются автоматически раз в неделю в токенах ${this.coin}. Токены, которые вы перечислите на смарт-кошелек можно забрать в любой момент.`;
        },
    },
    methods: {
        pretty,
        getErrorText,
    },
};
</script>

<template>
    <div class="card card__content--small card--sw-hold" :class="{'u-text-center': !isSmall, 'card--action': isSmall}">
        <CardHead
            :card="{
                caption: $td('Smart Hold', 'metagarden.smart-hold-title'),
                icon: coin,
                title: coin,
                stats: isSmall ? {
                    apr: {percent: 36},
                } : undefined,
                tooltip: isSmall ? undefined : tooltipContent ,
            }"
        />

        <img v-if="!isSmall" class="u-image u-image-center u-mt-15 u-mb-10" src="/img/metagarden-sw-hold.png" srcset="/img/metagarden-sw-hold@2x.png 2x" alt="" role="presentation" width="165" height="128">


        <p :class="isSmall ? 'card__action-description' : 'card__action-description'">{{ $td(`Hold ${coin} tokens in your smart wallet and earn 0.1% revenue per day${isSmall ? '' : ' (36% APR)'}.`, 'metagarden.smart-hold-description', {coin}) }}</p>

        <div class="u-flex u-flex--align-center u-mt-10">
            <nuxt-link v-if="minterBalance > 0" class="button button--full" :to="$i18nGetPreferredPath(`/withdraw?coin=${coin}&network=${$options.HUB_NETWORK_SLUG.BSC}&address=${smartWalletAddress}`)">
                {{ $td('Transfer to Smart-Wallet', 'metagarden.transfer-smart-wallet') }}
            </nuxt-link>
            <nuxt-link v-else class="button button--full" :class="{'button--main': !isSmall}" :to="$i18nGetPreferredPath(`/swap/${coin}`)">
                {{ $t('action.title-buy-coin', {coin}) }}
            </nuxt-link>

            <BaseTooltip class="u-flex-item--no-shrink u-ml-10" v-if="isSmall" :content="tooltipContent"/>
        </div>



        <!--<div v-if="$fetchState.pending" class="u-text-center">-->
        <!--    <BaseLoader class="" :is-loading="true"/>-->
        <!--</div>-->
        <!--<div v-else-if="$fetchState.error" class="form__error">-->
        <!--    Can't get spots info: <br>-->
        <!--    {{ getErrorText($fetchState.error) }}-->
        <!--</div>-->


        <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10" v-if="minterBalance > 0">
            <div class="u-flex u-flex--align-center">
                <img class="u-image u-image--round u-mr-05" alt="" :src="$store.getters['explorer/getCoinIcon'](coin)" width="24" height="24">
                <div class="u-h--uppercase u-text-sw-hold">{{ $td('Available for transfer', 'metagarden.available-for-transfer') }}</div>
            </div>

            <div class="u-h u-h3">{{ pretty(minterBalance) || '0' }}</div>
        </div>
        <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10" v-if="evmBalance > 0 && !isSmall">
            <div class="u-flex u-flex--align-center">
                <div class="u-mr-05" style="width: 24px"></div>
                <div class="u-h--uppercase u-text-sw-hold">{{ $td(`${coin} in Smart-Wallet`, 'metagarden.balance-smart-wallet', {coin}) }}</div>
            </div>

            <div class="u-h u-h4">{{ pretty(evmBalance) || '0' }}</div>
        </div>
        <!--
        <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10" v-if="evmBalance > 0 && !isSmall">
            <div class="u-flex u-flex--align-center">
                <div class="u-mr-05" style="width: 24px"></div>
                <div class="u-h--uppercase u-text-sw-hold">{{ $td('Rewards for hodl, annual rate of 36%', 'metagarden.todo') }}</div>
            </div>

            <div class="u-h u-h4">{{ pretty(apr) }}</div>
        </div>
        -->
    </div>
</template>

<style lang="less">
.card--sw-hold {
    color: #fff;
    background: url(/img/metagarden-sw-hold-bg.svg) no-repeat 50% 34px, radial-gradient(57.86% 117.71% at 32.94% 27.08%, #091A57 0%, #1849A9 100%) #1849A9;
}
.u-text-sw-hold {color: #a7c1f4;}
</style>
