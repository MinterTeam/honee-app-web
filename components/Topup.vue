<script>
import * as clipboard from 'clipbrd';
import {BASE_COIN, HUB_NETWORK} from '~/assets/variables.js';
import QrcodeVue from 'qrcode.vue';
import TopupWaitMinter from '~/components/TopupWaitMinter.vue';
import TopupWaitEvm from '~/components/TopupWaitEvm.vue';

/**
 * @typedef {{prefix: string, name: string, coin: string}} TopUpNetwork
 */
/**
 * @enum {Record.<'minter'|'bnb'|'eth', TopUpNetwork>}
 */
export const TOP_UP_NETWORK = {
    [HUB_NETWORK.MINTER]: {
        prefix: 'Mx',
        name: 'Minter',
        coin: BASE_COIN,
    },
    [HUB_NETWORK.ETHEREUM]: {
        prefix: '0x',
        name: 'Ethereum',
        coin: 'ETH',
    },
    [HUB_NETWORK.BSC]: {
        prefix: '0x',
        name: 'BNB Smart Chain',
        coin: 'BNB',
    },
};

export default {
    HUB_NETWORK,
    components: {
        QrcodeVue,
        TopupWaitMinter,
        TopupWaitEvm,
    },
    props: {
        /** @type {HUB_NETWORK} */
        networkSlug: {
            type: String,
            required: true,
        },
        title: {
            type: String,
        },
        description: {
            type: [String, Boolean],
            default: undefined,
        },
        backUrl: {
            type: [String, Boolean],
            default: '',
        },
        showWaitIndicator: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        'topup',
        'click-back',
    ],
    data() {
        return {
            isQrVisible: false,
            isDepositProcessing: false,
            successDeposit: false,
        };
    },
    computed: {
        /** @type {TopUpNetwork} */
        network() {
            return TOP_UP_NETWORK[this.networkSlug];
        },
        address() {
            return this.network.prefix + this.$store.getters.address.slice(2);
        },
        isOnlyCloseOnBack() {
            return this.backUrl === false;
        },
        isClipboardSupported() {
            return clipboard.isSupported();
        },
        isShareSupported() {
            return window.navigator.share;
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
    },
};
</script>

<template>
    <div>
        <h1 class="u-h3 u-mb-025 u-text-center">
            <template v-if="title">{{ title }}</template>
            <template v-else>
                {{ $td('Top up with', 'topup-network.title') }} {{ network.coin }}
            </template>
        </h1>
        <template v-if="!isDepositProcessing && !successDeposit">
            <p class="u-text-center u-text-medium" v-if="description">{{ description }}</p>
            <p class="u-text-center u-text-medium" v-else-if="description !== false">
                <template v-if="network.coin === $store.getters.BASE_COIN">
                    {{ $td(`Send any amount of ${network.coin}, BEE, or any other Minter coin to this address`, 'topup-network.description-minter', {coin: network.coin}) }}
                </template>
                <template v-else>
                    {{ $td(`Send any amount of ${network.coin} to this address`, 'topup-network.description', {coin: network.coin}) }}
                </template>
            </p>

            <div class="h-field h-field--is-readonly u-mt-10 u-mb-10">
                <div class="h-field__content" @click="copy(address)">
                    <div class="h-field__title">{{ $td('Your address', 'index.your-address') }}</div>
                    <div class="h-field__input h-field__input--medium is-not-empty">{{ address }}</div>
                </div>
            </div>

            <div class="u-grid u-grid--vertical-margin--small">
                <div class="u-cell u-cell--auto-grow" v-if="isClipboardSupported">
                    <button
                        class="button button--ghost-main button--full button--narrow"
                        type="button"
                        @click="copy(address)"
                    >
                        {{ $td('Copy', 'topup-network.copy') }}
                    </button>
                </div>
                <div class="u-cell u-cell--auto-grow" v-if="isShareSupported">
                    <button
                        class="button button--ghost-main button--full button--narrow"
                        type="button"
                        @click="shareAddress()"
                    >
                        {{ $td('Share', 'topup-network.share') }}
                    </button>
                </div>
                <div class="u-cell u-cell--auto-grow">
                    <button
                        class="button button--ghost-main button--full button--narrow"
                        type="button"
                        @click="isQrVisible = !isQrVisible"
                    >
                        <template v-if="!isQrVisible">
                            {{ $td('Show QR', 'topup-network.show-qr') }}
                        </template>
                        <template v-else>
                            {{ $td('Hide QR', 'topup-network.hide-qr') }}
                        </template>
                    </button>
                </div>
            </div>

            <qrcode-vue
                v-show="isQrVisible"
                class="u-mt-10 qr-wrap u-text-center"
                :value="address"
                :size="160"
                level="L"
                background="#fff"
            />
        </template>

        <component
            :is="networkSlug === $options.HUB_NETWORK.MINTER ? 'TopupWaitMinter' : 'TopupWaitEvm'"
            class="u-text-center u-mt-10 u-text-medium"
            :showWaitIndicator="showWaitIndicator"
            :network-slug="networkSlug"
            @update:processing="isDepositProcessing = $event"
            @topup="successDeposit = $event; $emit('topup', $event)"
        />

        <button v-if="isOnlyCloseOnBack" class="button button--ghost button--full u-mt-10" type="button" @click="$emit('click-back')">
            {{ $td('Cancel', 'topup.back') }}
        </button>
        <nuxt-link v-else class="button button--ghost button--full u-mt-10" :to="backUrl || $i18nGetPreferredPath('/topup')">
            {{ $td('Cancel', 'topup.back') }}
        </nuxt-link>
    </div>
</template>
