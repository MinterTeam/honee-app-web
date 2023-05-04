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
            default: true,
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
        // apr() {
        //     // 3% monthly
        //     return (this.evmBalance || 0) * 0.36;
        // },
        tooltipContent() {
            return false;
            // eslint-disable-next-line no-unreachable
            return this.$i18n.locale === 'en'
                ? `todo ${this.coin}`
                : `todo ${this.coin}`;
        },
    },
    methods: {
        pretty,
        getErrorText,
    },
};
</script>

<template>
    <div class="card card__content--small u-relative card--metagarden card--loans-mg" :class="{'u-text-center': !isSmall, 'card--action': isSmall}">
        <CardHead
            :card="{
                caption: 'Loans',
                icon: coin,
                title: coin,
                tooltip: isSmall ? undefined : tooltipContent,
                stats: isSmall ? {
                    apr: {percent: 12},
                } : undefined,
                ru: {
                    caption: 'Заём'
                }
            }"
        />

        <img
            v-if="coin === 'METAGARDEN' && !isSmall"
            style="margin-top: -40px;"
            class="u-image u-z-down u-image-center u-mb-10"
            src="/img/metagarden-loans.png"
            srcset="/img/metagarden-loans@2x.png 2x"
            alt="" role="presentation"
            width="193" height="184"
        >


        <p class="card__action-description">{{ $td(`Получи токены BNB под залог токенов ${coin}. Перед оформлением прочитай условия программы!`, 'loans.card-description', {coin}) }}</p>

        <div class="u-flex u-flex--align-center u-mt-10">
            <nuxt-link v-if="minterBalance > 0" class="button button--full" :to="$i18nGetPreferredPath(`/loans/borrow/${coin}`)">
                {{ $td('Перейти к получению займа', 'loans.card-button') }}
            </nuxt-link>
            <nuxt-link v-else class="button button--full" :class="{'button--main': !isSmall}" :to="$i18nGetPreferredPath(`/swap/${coin}`)">
                {{ $t('action.title-buy-coin', {coin}) }}
            </nuxt-link>

            <BaseTooltip class="u-flex-item--no-shrink u-ml-10" v-if="isSmall" :content="tooltipContent"/>
        </div>

        <p class="u-mt-10 u-text-medium u-text-center">
            Желаете зарабатывать на кредитовании других?
            <nuxt-link class="link--underline u-fw-600" :to="$i18nGetPreferredPath(`/loans/lend/${coin}`)">Вам сюда</nuxt-link>
        </p>
    </div>
</template>

<style lang="less">
@import "~/assets/less/include/variables.less";

.card--loans-mg {
    color: #fff;
    background: url(/img/metagarden-loans-bg.svg) no-repeat 50% 0 @c-night/*, radial-gradient(57.86% 117.71% at 32.94% 27.08%, #091A57 0%, #1849A9 100%)*/;
}
.u-text-sw-hold {color: #a7c1f4;}
</style>
