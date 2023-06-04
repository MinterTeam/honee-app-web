<script>
import {MAINNET, NETWORK, HUB_NETWORK_SLUG} from '~/assets/variables.js';
import {getCard2MinterUrl} from '~/assets/utils.js';
import {TELEGRAM_BUY_LINKS} from '~/components/TopupCoinOptions.vue';
import TopupWaitMinter from '~/components/TopupWaitMinter.vue';
import TopupWaitSmartWalletWrap from '~/components/TopupWaitSmartWalletWrap.vue';
import FieldAddressDisplay from '~/components/base/FieldAddressDisplay.vue';
import Modal from '~/components/base/Modal.vue';
import Topup from '~/components/Topup.vue';
import Swap from '~/components/Swap.vue';


export default {
    HUB_NETWORK_SLUG,
    TELEGRAM_BUY_LINKS,
    components: {
        Topup,
        Modal,
        FieldAddressDisplay,
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
        card2MinterUrl() {
            return getCard2MinterUrl({
                address: this.$store.getters.address,
                coin: 'MEGANET',
                returnUrl: window.location.href,
                finishUrl: window.location.origin,
            });
        },
    },
    methods: {
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
        <img class="u-image u-mb-10" src="/img/logo-megachain-side.svg" alt="Metagarden Chain" width="265" height="48">
        <h1 class="u-h4 u-mb-15">{{ $td('Buy MEGANET tokens with any of these options to join the Metagarden Chain.', 'meganet.buy-text') }}</h1>



        <div class="card card--light-grey u-text-left">
            <div
                class="card__content card__content--medium"
                :class="isShowWaitSmartWallet || isDepositProcessing || successDeposit ? '' : 'u-hidden'"
            >
                <TopupWaitSmartWalletWrap
                    class="u-text-center u-text-medium"
                    :showWaitIndicator="false"
                    coin-swap-after-deposit="MEGANET"
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
                    Ethereum network fee will be ≈ $100. However, we will compensate you with MEGANET tokens. To receive compensation, please contact support.
                    </template>
                    <template v-if="$i18n.locale === 'ru'">
                    Комиссия в сети Ethereum ≈ $100. Однако, мы компенсируем ее в виде токенов MEGANET. Для получения компенсации обратитесь в службу поддержки.
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
            <div v-if="isMainnet" class="card card--light-grey u-text-left card__content card__content--medium u-mt-20">
                <h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
                    <img class="u-mr-05" src="/img/icon-card.svg" alt="" role="presentation" width="24" height="24">
                    {{ $td('Bank cards', 'deposit.title-card') }}
                </h2>
                <a class="button button--main button--full u-mt-10" :href="card2MinterUrl">
                    {{ $td('Buy with card', 'deposit.button-buy-with-card') }}
                </a>
            </div>

            <!-- Telegram -->
            <div class="card card--light-grey u-text-left card__content card__content--medium u-mt-20">
                <h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
                    <img class="u-mr-05" src="/img/icon-social-telegram-circle.svg" alt="" role="presentation" width="24" height="24">
                    {{ $td('Telegram bot', 'deposit.title-telegram') }}
                </h2>
                <a class="button button--main button--full u-mt-10" :href="$options.TELEGRAM_BUY_LINKS['MEGANET']" target="_blank" v-if="$options.TELEGRAM_BUY_LINKS['MEGANET']">
                    {{ $td('Switch to Telegram', 'deposit.button-buy-with-telegram') }}
                </a>

                <p class="u-text-medium u-mt-10">
                    {{ $td('You will need to give', 'deposit.telegram-find-address-description-1') }} <button type="button" class="link link--underline u-semantic-button" @click="isAddressModalOpen = true">{{ $td('this Minter address', 'deposit.telegram-find-address-button') }}</button> {{ $td('to the Telegram bot.', 'deposit.telegram-find-address-description-2') }}
                </p>
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

                <Swap class="u-mt-10" :params="{coinToBuy: 'MEGANET'}" :show-deposit="false"/>
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
