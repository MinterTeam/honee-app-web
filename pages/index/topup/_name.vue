<script>
import * as clipboard from 'clipbrd';
import QrcodeVue from 'qrcode.vue';
import getTitle from '@/assets/get-title.js';
import {DASHBOARD_URL} from '@/assets/variables.js';
import Modal from '@/components/base/Modal.vue';

/**
 * @typedef {{prefix: string, name: string, coin: string}} TopUpNetwork
 */
/**
 * @enum {Object.<'minter'|'bnb'|'eth', TopUpNetwork>}
 */
const TOP_UP_NETWORK = {
    minter: {
        prefix: 'Mx',
        name: 'Minter',
        coin: 'BIP',
    },
    eth: {
        prefix: '0x',
        name: 'Ethereum',
        coin: 'ETH',
    },
    bnb: {
        prefix: '0x',
        name: 'BNB',
        coin: 'BNB',
    },
};

export default {
    DASHBOARD_URL,
    components: {
        QrcodeVue,
        Modal,
    },
    asyncData({route, error}) {
        const network = TOP_UP_NETWORK[route.params.name];
        if (!network) {
            return error({status: 404, message: 'Page not found'});
        } else {
            return {
                network,
            };
        }
    },
    head() {
        const title = getTitle(this.$td('Top up with', 'topup-network.title') + ' ' + this.network.name);

        return {
            title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
            ],
        };
    },
    data() {
        return {
            /** @type {TopUpNetwork|null} */
            network: null,
            isQrVisible: false,
        };
    },
    computed: {
        address() {
            return this.network.prefix + this.$store.getters.address.slice(2);
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
    <Modal
        :isOpen="true"
        :hideCloseButton="false"
        :disableOutsideClick="false"
        @modal-close="$router.push($i18nGetPreferredPath({path: $options.DASHBOARD_URL}))"
    >
        <h1 class="u-h3 u-mb-025 u-text-center">
            {{ $td('Top up with', 'topup-network.title') }} {{ network.name }}
        </h1>
        <p class="u-text-center">{{ $td(`Send any amount of ${network.coin} to this address`, 'topup-network.description', {coin: network.coin}) }}</p>

        <div class="h-field u-mt-10 u-mb-10">
            <div class="h-field__content">
                <div class="h-field__title">{{ $td('Your address', 'index.your-address') }}</div>
                <div class="h-field__input is-not-empty">{{ address }}</div>
            </div>
        </div>

        <div class="u-grid">
            <div class="u-cell u-cell--auto-grow" v-if="isClipboardSupported">
                <button
                    class="button button--main button--full button--narrow"
                    @click="copy(address)"
                >
                    {{ $td('Copy', 'topup-network.copy') }}
                </button>
            </div>
            <div class="u-cell u-cell--auto-grow" v-if="isShareSupported">
                <button
                    class="button button--main button--full button--narrow"
                    @click="shareAddress"
                >
                    {{ $td('Share', 'topup-network.share') }}
                </button>
            </div>
            <div class="u-cell u-cell--auto-grow">
                <button
                    class="button button--main button--full button--narrow"
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
            class="u-mt-15 u-text-center"
            :value="address"
            :size="160"
            level="L"
            background="transparent"
        />

        <nuxt-link class="button button--ghost button--full u-mt-15" :to="$i18nGetPreferredPath('/topup')">
            {{ $td('Back', 'topup.back') }}
        </nuxt-link>
    </Modal>
</template>
