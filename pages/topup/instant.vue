<script>
import * as clipboard from 'clipbrd';
import {HUB_NETWORK_SLUG, MAINNET, NETWORK} from '~/assets/variables.js';
import getTitle from '~/assets/get-title.js';
import BaseButtonCopyIcon from '~/components/base/BaseButtonCopyIcon.vue';
import TopupSmartWalletForm from '~/components/TopupSmartWalletForm.vue';
import TopupWaitMinter from '~/components/TopupWaitMinter.vue';
import TopupWaitSmartWalletWrap from '~/components/TopupWaitSmartWalletWrap.vue';

export default {
    HUB_NETWORK_SLUG,
    layout(context) {
        return context.store.state.isMetagarden ? 'metagarden' : 'default';
    },
    components: {
        BaseButtonCopyIcon,
        TopupSmartWalletForm,
        TopupWaitMinter,
        TopupWaitSmartWalletWrap,
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
            isShowWaitSmartWallet: false,
        };
    },
    computed: {
        isClipboardSupported() {
            return clipboard.isSupported();
        },
        isShareSupported() {
            return window.navigator.share;
        },
        isMainnet() {
            return NETWORK === MAINNET;
        },
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
        getTopupInnerPage(inner) {
            const base = this.$options.isOnboarding ? '/onboarding/topup/' : '/topup/';
            return this.$i18nGetPreferredPath(base + inner);
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
                    {{ $td(`Top up your balance with any of the following options.`, 'deposit.description') }}
                </p>
            </div>
            <div class="card card--light-grey">
                <div
                    class="card__content card__content--medium"
                    :class="isShowWaitSmartWallet || isDepositProcessing || successDeposit ? '' : 'u-hidden'"
                >
                    <TopupWaitSmartWalletWrap
                        class="u-text-center u-text-medium"
                        :showWaitIndicator="false"
                        @update:processing="isDepositProcessing = $event"
                        @topup="successDeposit = $event;"
                        @is-show="isShowWaitSmartWallet = $event;"
                    />
                    <TopupWaitMinter
                        class="u-text-center u-mt-15 u-text-medium"
                        :showWaitIndicator="false"
                        :network-slug="$options.HUB_NETWORK_SLUG.MINTER"
                        @update:processing="isDepositProcessing = $event"
                        @topup="successDeposit = $event;"
                    />
                    <nuxt-link v-if="successDeposit" class="button button--ghost button--full u-mt-10" :to="$getDashboardUrl()">
                        {{ $td('Finish', 'common.finish') }}
                    </nuxt-link>
                </div>

                <div class="card__content card__content--medium" v-if="!isDepositProcessing && !successDeposit">
                    <!-- evm -->
                    <TopupSmartWalletForm/>

                    <!-- p2p -->
                    <template v-if="isMainnet">
                        <h2 class="u-h--uppercase-solid u-mt-20 u-mb-025 u-flex u-flex--align-center">
                            <img class="u-mr-05" src="/img/icon-card.svg" alt="" role="presentation" width="24" height="24">
                            {{ $td('Bank cards', 'deposit.title-card') }}
                        </h2>
                        <nuxt-link class="button button--main button--full u-mt-10" :to="getTopupInnerPage('card')">{{ $td('Top up with Card', 'deposit.button-card') }}</nuxt-link>
                    </template>


                    <!-- minter -->
                    <h2 class="u-h--uppercase-solid u-mt-20 u-mb-025 u-flex u-flex--align-center">
                        <img class="u-mr-05" src="/img/logo-minter.svg" alt="" role="presentation" width="24" height="24">
                        {{ $td('Minter Network', 'deposit.title-minter') }}
                    </h2>

                    <div class="h-field u-mt-10">
                        <div class="h-field__content" @click="copy($store.getters.address)">
                            <div class="h-field__title">{{ $td('Minter wallet address', 'deposit.minter-address') }}</div>
                            <div class="h-field__input h-field__input--medium is-not-empty">{{ $store.getters.address }}</div>
                        </div>
                        <div class="h-field__aside h-field__aside--with-icon" v-if="isClipboardSupported">
                            <BaseButtonCopyIcon class="" :copy-text="$store.getters.address"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>




        <!--
        <nuxt-link class="button button&#45;&#45;ghost button&#45;&#45;full u-mt-10" :to="backUrl || $i18nGetPreferredPath('/topup')">
            {{ $td('Cancel', 'topup.back') }}
        </nuxt-link>
        -->

        <div class="u-text-center u-mt-15" v-if="$options.isOnboarding">
            <nuxt-link class="link--default-black" :to="$i18nGetPreferredPath($store.state.authRedirectPath || DASHBOARD_URL)" @click.native="$nextTick(() => $store.commit('SET_AUTH_REDIRECT_PATH', ''))">
                {{ $td('I\'ll do it later', 'onboarding.skip') }}
            </nuxt-link>
        </div>
    </div>
</template>
