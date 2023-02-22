<script>
import * as clipboard from 'clipbrd';
import {BASE_COIN, HUB_NETWORK} from '~/assets/variables.js';
import getTitle from '~/assets/get-title.js';
import {getCard2MinterUrl} from '~/assets/utils.js';
import useWeb3SmartWallet from '~/composables/use-web3-smartwallet.js';
import QrcodeVue from 'qrcode.vue';
import BaseButtonCopyIcon from '~/components/base/BaseButtonCopyIcon.vue';
import TopupWaitMinter from '~/components/TopupWaitMinter.vue';
import TopupWaitSmartWallet from '~/components/TopupWaitSmartWallet.vue';

export default {
    HUB_NETWORK,
    layout(context) {
        return context.store.state.isMetagarden ? 'metagarden' : 'default';
    },
    components: {
        QrcodeVue,
        BaseButtonCopyIcon,
        TopupWaitMinter,
        TopupWaitSmartWallet,
    },
    setup() {
        const {
            smartWalletAddress,
            setSmartWalletProps,
        } = useWeb3SmartWallet();

        return {
            smartWalletAddress,
            setSmartWalletProps,
        };
    },
    head() {
        const title = getTitle(this.$td('Deposit with crypto or cards', 'deposit.title'));

        return {
            title,
            meta: [
                {hid: 'og-title', name: 'og:title', content: title},
            ],
        };
    },
    data() {
        return {
            isQrVisible: false,
            isDepositProcessing: false,
            successDeposit: '',
        };
    },
    computed: {
        isClipboardSupported() {
            return clipboard.isSupported();
        },
        isShareSupported() {
            return window.navigator.share;
        },
        card2MinterUrl() {
            return getCard2MinterUrl(this.$store.getters.address, window.location.origin);
        },
    },
    created() {
        this.$watch(
            () => ({
                evmAccountAddress: this.$store.getters.evmAddress,
                estimationSkip: true,
            }),
            (newVal) => this.setSmartWalletProps(newVal),
            {deep: true, immediate: true},
        );
    },
    methods: {
        copy(str) {
            const isCopied = clipboard.copy(str);
            if (isCopied) {
                // show snackbar
                this.$store.commit('SET_SNACKBAR_ACTIVE');
                this.isToastVisible = true;
            }
        },
        shareAddress() {
            window.navigator.share({
                title: this.$td('My address', 'index.my-address'),
                text: this.address,
            });
        },
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card--invert">
            <div class="card__content card__content--medium">
                <h1 class="u-h3 u-mb-025">
                    {{ $td('Instant Deposit', 'deposit.title') }}
                </h1>
                <p class="u-text-medium">
                    {{ $td(`Top up your balance with any of the following options, or share this page with anyone if you want to request payment.`, 'deposit.description') }}
                </p>
            </div>
            <div class="card card--light-grey">
                <div class="card__content card__content--medium"><!--
                --><TopupWaitSmartWallet
                        class="u-text-center u-text-medium"
                        :showWaitIndicator="false"
                        :networkSlug="$options.HUB_NETWORK.BSC"
                        @update:processing="isDepositProcessing = $event"
                        @topup="successDeposit = $event;"
                    /><!--
                --><TopupWaitMinter
                        class="u-text-center u-mt-15 u-text-medium"
                        :showWaitIndicator="false"
                        :network-slug="$options.HUB_NETWORK.MINTER"
                        @update:processing="isDepositProcessing = $event"
                        @topup="successDeposit = $event;"
                    /><!--
                --><nuxt-link v-if="successDeposit" class="button button--ghost button--full u-mt-10" :to="$getDashboardUrl()">
                        {{ $td('Finish', 'common.finish') }}
                    </nuxt-link><!--
            --></div>

                <div class="card__content card__content--medium" v-if="!isDepositProcessing && !successDeposit">
                    <h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
                        <img class="u-mr-05" src="https://explorer-static.minter.network/coins/2107.png" alt="" role="presentation" width="24" height="24">
                        {{ $td('BNB Smart Chain', 'deposit.title-evm') }}
                    </h2>
                    <p class="u-text-medium">
                        {{ $td(`Transfer any token (BEP20) from BNB Smart Chain networks to this address.`, 'deposit.description-evm') }}
                    </p>

                    <div class="h-field u-mt-10 u-mb-10">
                        <div class="h-field__content" @click="copy(smartWalletAddress)">
                            <div class="h-field__title">{{ $td('Smart wallet address', 'deposit.smart-wallet-address') }}</div>
                            <div class="h-field__input h-field__input--medium is-not-empty">{{ smartWalletAddress }}</div>
                        </div>
                        <div class="h-field__aside h-field__aside--with-icon">
                            <BaseButtonCopyIcon class="" :copy-text="smartWalletAddress"/>
                        </div>
                    </div>
                    <h2 class="u-h--uppercase-solid u-mt-20 u-mb-025 u-flex u-flex--align-center">
                        <img class="u-mr-05" src="/img/icon-card.svg" alt="" role="presentation" width="24" height="24">
                        {{ $td('Bank cards', 'deposit.title-card') }}
                    </h2>
                    <p class="u-text-medium">
                        {{ $td('Top up your balance via bank card.', 'deposit.description-card') }}
                    </p>
                    <a class="button button--main button--full u-mt-10" :href="card2MinterUrl" target="_blank">{{ $td('Top up with Card', 'deposit.button-card') }}</a>


                    <h2 class="u-h--uppercase-solid u-mt-20 u-mb-025 u-flex u-flex--align-center">
                        <img class="u-mr-05" src="/img/logo-minter.svg" alt="" role="presentation" width="24" height="24">
                        {{ $td('Minter Network', 'deposit.title-minter') }}
                    </h2>
                    <p class="u-text-medium">
                        {{ $td('Transfer any token from Minter to this address.', 'deposit.description-minter') }}
                    </p>

                    <div class="h-field u-mt-10 u-mb-10">
                        <div class="h-field__content" @click="copy($store.getters.address)">
                            <div class="h-field__title">{{ $td('Minter wallet address', 'deposit.minter-address') }}</div>
                            <div class="h-field__input h-field__input--medium is-not-empty">{{ $store.getters.address }}</div>
                        </div>
                        <div class="h-field__aside h-field__aside--with-icon">
                            <BaseButtonCopyIcon class="" :copy-text="$store.getters.address"/>
                        </div>
                    </div>

                    <!--<div class="u-grid u-grid&#45;&#45;vertical-margin&#45;&#45;small">-->
                    <!--    <div class="u-cell u-cell&#45;&#45;auto-grow">-->
                    <!--        <button-->
                    <!--            class="button button&#45;&#45;ghost-main button&#45;&#45;full button&#45;&#45;narrow"-->
                    <!--            type="button"-->
                    <!--            @click="isQrVisible = !isQrVisible"-->
                    <!--        >-->
                    <!--            <template v-if="!isQrVisible">-->
                    <!--                {{ $td('Show QR', 'topup-network.show-qr') }}-->
                    <!--            </template>-->
                    <!--            <template v-else>-->
                    <!--                {{ $td('Hide QR', 'topup-network.hide-qr') }}-->
                    <!--            </template>-->
                    <!--        </button>-->
                    <!--    </div>-->
                    <!--</div>-->

                    <qrcode-vue
                        v-show="isQrVisible"
                        class="u-mt-15 u-text-center"
                        :value="smartWalletAddress"
                        :size="160"
                        level="L"
                        background="transparent"
                    />
                </div>
            </div>
        </div>




        <!--
        <nuxt-link class="button button&#45;&#45;ghost button&#45;&#45;full u-mt-10" :to="backUrl || $i18nGetPreferredPath('/topup')">
            {{ $td('Cancel', 'topup.back') }}
        </nuxt-link>
        -->
    </div>
</template>
