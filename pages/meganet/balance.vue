<script>
import {MAINNET, NETWORK, HUB_NETWORK_SLUG} from '~/assets/variables.js';
import {getCard2MinterUrl, pretty, prettyRound} from '~/assets/utils.js';
import {TELEGRAM_BUY_LINKS, getProductSettings} from '~/components/TopupCoinOptions.vue';
import TopupWaitMinter from '~/components/TopupWaitMinter.vue';
import TopupWaitSmartWalletWrap from '~/components/TopupWaitSmartWalletWrap.vue';
import FieldAddressDisplay from '~/components/base/FieldAddressDisplay.vue';
import Modal from '~/components/base/Modal.vue';
import MetagardenTokenBalance from '~/components/MetagardenTokenBalance.vue';
import Topup from '~/components/Topup.vue';
import Swap from '~/components/Swap.vue';
import TopupCoinOptionsTelegram from '~/components/TopupCoinOptionsTelegram.vue';

const PRESALE_COIN = 'LAUNCHER';


export default {
    PRESALE_COIN,
    HUB_NETWORK_SLUG,
    TELEGRAM_BUY_LINKS,
    components: {
        TopupCoinOptionsTelegram,
        Topup,
        Modal,
        FieldAddressDisplay,
        MetagardenTokenBalance,
        TopupWaitSmartWalletWrap,
        // TopupWaitMinter,
        Swap,
    },
    head: {
        bodyAttrs: {
            class: 'megachain__body',
        },
    },
    fetch() {
        // this.$store.commit('SET_METAGARDEN');
    },
    /*
    head: {
        htmlAttrs: {
            class: 'metagarden-layout theme--metagarden',
        },
    },
    */
    data() {
        return {
            isDepositProcessing: false,
            successDeposit: '',
            isShowWaitSmartWallet: false,
            isAddressModalOpen: false,
        };
    },
    computed: {
        isMainnet() {
            return NETWORK === MAINNET;
        },
        coin() {
            return PRESALE_COIN;
        },
        card2MinterUrl() {
            return getCard2MinterUrl({
                address: this.$store.getters.address,
                coin: PRESALE_COIN,
                returnUrl: window.location.href,
                finishUrl: window.location.origin,
            });
        },
        welcomeBonus() {
            return this.$store.state.megachain.isCollectedWelcomeBonus ? 10 : 0;
        },
        meganetBalance() {
            return this.$store.getters.getBalanceAmount('MEGANET');
        },
        minterBalance() {
            return this.$store.getters.getBalanceAmount(this.coin);
        },
        receiveAmount() {
            return this.welcomeBonus + (this.meganetBalance || 0) * 2 + Number(this.$store.state.referral.referralBonus) + Number(this.minterBalance);
        },
    },
    methods: {
        pretty,
        prettyRound,
        getProductSettings,
        getTopupInnerPage(inner) {
            const base = this.$options.isOnboarding ? '/onboarding/topup/' : '/topup/';
            return this.$i18nGetPreferredPath(base + inner);
        },
        logout() {
            this.$store.commit('LOGOUT');
            this.$router.push(this.$i18nGetPreferredPath('/auth'));
        },
        backToHonee() {
            // this.$store.commit('SET_METAGARDEN', false);
            this.$router.push(this.$i18nGetPreferredPath('/'));
        },
    },
};
</script>

<template>
    <div class="u-text-center u-container--small">
        <div class="card card--megachain u-mb-20 u-text-left">
            <div class="card__content card__content--medium">
                <div class="u-flex u-flex--align-center u-mb-10">
                    <img class="u-image u-image--round u-mr-05" alt="" :src="$store.getters['explorer/getCoinIcon']('MEGANET')" width="24" height="24">
                    <div class="u-h--uppercase-solid">
                        {{ $td(`Your balance`, 'meganet.your-balance') }}
                    </div>
                </div>

                <div class="u-flex u-flex--justify-between u-flex--align-center">
                    <div class="u-flex u-flex--align-center u-mr-10">
                        <div class="u-h--uppercase u-text-mega-muted">
                            {{ $td(`Welcome bonus`, 'meganet.welcome-bonus-balance') }}
                        </div>
                    </div>

                    <div class="u-h u-h4">{{ pretty(welcomeBonus) }}</div>
                </div>
                <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10" v-if="meganetBalance > 0">
                    <div class="u-flex u-flex--align-center u-mr-10">
                        <div class="u-h--uppercase u-text-mega-muted">
                            {{ $td(`MEGANET tokens`, 'meganet.launch-balance', {coin: 'MEGANET'}) }}
                        </div>
                    </div>

                    <div class="u-h u-h4">{{ pretty(meganetBalance) || '0' }}</div>
                </div>
                <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10" v-if="meganetBalance > 0">
                    <div class="u-flex u-flex--align-center u-mr-10">
                        <div class="u-h--uppercase u-text-mega-muted">{{ $td('Early adopter bonus (+100%)', 'meganet.launch-bonus') }}</div>
                    </div>

                    <div class="u-h u-h4">{{ pretty(meganetBalance) || '0' }}</div>
                </div>
                <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10">
                    <div class="u-flex u-flex--align-center u-mr-10">
                        <div class="u-h--uppercase u-text-mega-muted">{{ $td(`${coin} tokens`, 'meganet.launch-balance', {coin}) }}</div>
                    </div>

                    <div class="u-h u-h4">{{ pretty(minterBalance) || '0' }}</div>
                </div>
                <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10">
                    <div class="u-flex u-flex--align-center u-mr-10">
                        <div class="u-h--uppercase u-text-mega-muted">{{ $td('Extra bonus', 'todo') }}</div>
                    </div>

                    <div class="u-h u-h4">{{ pretty($store.state.referral.referralBonus) }}</div>
                </div>
            </div>
            <div class="card__content card__content--medium">
                <div class="u-flex u-flex--justify-between u-flex--align-center">
                    <div class="u-flex u-flex--align-center u-mr-10">
                        <div class="u-h--uppercase u-text-mega-muted">{{ $td('Total balance after Mainnet&nbsp;launch', 'meganet.launch-receive') }}</div>
                    </div>

                    <div class="u-h u-h4">{{ pretty(receiveAmount) }}</div>
                </div>
            </div>
        </div>

        <MetagardenTokenBalance class="card__content--medium card--megachain u-mb-20"/>


        <h1 class="u-h4 u-mb-15">{{ $td(`Buy ${coin} tokens with any of these options to join the Metagarden Chain.`, 'meganet.buy-text', {coin: $options.PRESALE_COIN}) }}</h1>

        <div class="card card--light-grey u-text-left">
            <div
                class="card__content card__content--medium"
                :class="isShowWaitSmartWallet || isDepositProcessing || successDeposit ? '' : 'u-hidden'"
            >
                <TopupWaitSmartWalletWrap
                    class="u-text-center u-text-medium"
                    :showWaitIndicator="false"
                    :coin-swap-after-deposit="$options.PRESALE_COIN"
                    @update:processing="isDepositProcessing = $event"
                    @topup="successDeposit = $event;"
                    @is-show="isShowWaitSmartWallet = $event;"
                />
                <!--<TopupWaitMinter-->
                <!--    class="u-text-center u-mt-15 u-text-medium"-->
                <!--    :showWaitIndicator="false"-->
                <!--    :network-slug="$options.HUB_NETWORK_SLUG.MINTER"-->
                <!--    @update:processing="isDepositProcessing = $event"-->
                <!--    @topup="successDeposit = $event;"-->
                <!--/>-->
                <nuxt-link v-if="successDeposit" class="button button--ghost button--full u-mt-10" :to="$getDashboardUrl()">
                    {{ $td('Finish', 'common.finish') }}
                </nuxt-link>
            </div>

            <div class="card__content card__content--medium" v-if="!isDepositProcessing && !successDeposit">
                <!-- evm eth -->
                <h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
                    <img class="u-mr-05" src="https://explorer-static.minter.network/coins/2065.png" alt="" role="presentation" width="24" height="24">
                    ETHEREUM NETWORK
                </h2>
                <p class="u-text-medium">{{ $td('Send ETH or USDT (ERC-20) to this address', 'deposit.label-buy-with-eth') }}</p>
                <FieldAddressDisplay
                    class="u-mt-05 u-mb-05"
                    :value="$store.getters.smartWalletAddress"
                />
                <p class="form-row u-text-muted u-text-small u-text-left u-mb-25">
                    <template v-if="$i18n.locale === 'en'">
                        Ethereum network fee will be ≈ $100. However, we will compensate you with {{ $options.PRESALE_COIN }} tokens. To receive compensation, please contact support.
                    </template>
                    <template v-if="$i18n.locale === 'ru'">
                        Комиссия в сети Ethereum ≈ $100. Однако, мы компенсируем ее в виде токенов {{ $options.PRESALE_COIN }}. Для получения компенсации обратитесь в службу поддержки.
                    </template>
                </p>
                <!-- evm bsc -->
                <h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
                    <img class="u-mr-05" src="https://explorer-static.minter.network/coins/2107.png" alt="" role="presentation" width="24" height="24">
                    BNB SMART CHAIN
                </h2>
                <p class="u-text-medium">{{ $td('Send BNB or USDT (BEP-20) to this address', 'deposit.label-buy-with-bnb') }}</p>
                <FieldAddressDisplay
                    class="u-mt-05 u-mb-05"
                    :value="$store.getters.smartWalletAddress"
                />
                <p class="form-row u-text-muted u-text-small u-text-left">
                    <template v-if="$i18n.locale === 'en'">
                        BNB Smart Chain network fee ≈ 3$.
                    </template>
                    <template v-if="$i18n.locale === 'ru'">
                        Комиссия в сети BNB Smart Chain ≈ $3.
                    </template>
                </p>
                <!-- evm token -->
                <!--<h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
                    <img class="u-mr-minus-025" src="https://explorer-static.minter.network/coins/2065.png" alt="" role="presentation" width="24" height="24">
                    <img class="u-mr-05" src="https://explorer-static.minter.network/coins/2107.png" alt="" role="presentation" width="24" height="24">
                    {{ $td('Any ERC-20 / BEP-20 token', 'deposit.title-buy-with-token') }}
                </h2>
                <p class="u-text-medium">{{ $td('Transfer any token from Ethereum or BNB Smart Chain networks to this address.', 'deposit.description-buy-with-token') }}</p>
                <FieldAddressDisplay
                    class="u-mt-10"
                    :value="$store.getters.smartWalletAddress"
                    :label="$td('Your smart wallet address', 'deposit.smart-wallet-address')"
                />-->
            </div>
        </div>

        <template v-if="!isDepositProcessing && !successDeposit">
            <!-- p2p -->
            <!--<div v-if="isMainnet" class="card card--light-grey u-text-left card__content card__content--medium u-mt-20">
                <h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
                    <img class="u-mr-05" src="/img/icon-card.svg" alt="" role="presentation" width="24" height="24">
                    {{ $td('Bank cards', 'deposit.title-card') }}
                </h2>
                <a class="button button--main button--full u-mt-10" :href="card2MinterUrl">
                    {{ $td('Buy with card', 'deposit.button-buy-with-card') }}
                </a>
            </div>-->

            <!-- Telegram -->
            <div class="card card--light-grey u-text-left card__content card__content--medium u-mt-20">
                <h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
                    <img class="u-mr-05" src="/img/icon-social-telegram-circle.svg" alt="" role="presentation" width="24" height="24">
                    {{ $td('Telegram bot', 'deposit.title-telegram') }}
                </h2>
                <TopupCoinOptionsTelegram
                    class="button button--main button--full u-mt-10"
                    :coin="$options.PRESALE_COIN"
                    :settings="getProductSettings($options.PRESALE_COIN)"
                >
                    {{ $td('Switch to Telegram', 'deposit.button-buy-with-telegram') }}
                </TopupCoinOptionsTelegram>

                <!--
                <p class="u-text-medium u-mt-10">
                    {{ $td('You will need to give', 'deposit.telegram-find-address-description-1') }} <button type="button" class="link link&#45;&#45;underline u-semantic-button" @click="isAddressModalOpen = true">{{ $td('this Minter address', 'deposit.telegram-find-address-button') }}</button> {{ $td('to the Telegram bot.', 'deposit.telegram-find-address-description-2') }}
                </p>
                -->
            </div>

            <!-- minter -->
            <div class="card card--light-grey u-text-left card__content card__content--medium u-mt-20">
                <h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
                    <img class="u-mr-05" src="/img/logo-minter.svg" alt="" role="presentation" width="24" height="24">
                    {{ $td('Minter Network', 'deposit.title-minter') }}
                </h2>

                <FieldAddressDisplay
                    class="u-mt-10"
                    :value="$store.getters.address"
                    :label="$td('Your Minter wallet address', 'meganet.minter-address-label')"
                />

                <Swap class="u-mt-10" :params="{coinToBuy: $options.PRESALE_COIN}" :show-deposit="false"/>
            </div>



            <button type="button" class="button button--full button--ghost u-mt-15" @click="logout()">{{ $td('Logout', 'common.logout') }}</button>
        </template>

        <Modal
            modalContainerClass="card card__content u-text-center"
            :isOpen.sync="isAddressModalOpen"
            :hideCloseButton="false"
            :disableOutsideClick="false"
        >
            <Topup
                :network-slug="$options.HUB_NETWORK_SLUG.MINTER"
                :title="$td('Your wallet address', 'receive.title')"
                :description="false"
                :back-url="false"
                @click-back="isAddressModalOpen = false"
            />
        </Modal>
    </div>
</template>
