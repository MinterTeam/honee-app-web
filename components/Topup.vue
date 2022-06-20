<script>
import * as clipboard from 'clipbrd';
import QrcodeVue from 'qrcode.vue';
import {DASHBOARD_URL} from '~/assets/variables.js';

/**
 * @typedef {{prefix: string, name: string, coin: string}} TopUpNetwork
 */
/**
 * @enum {Object.<'minter'|'bnb'|'eth', TopUpNetwork>}
 */
export const TOP_UP_NETWORK = {
    minter: {
        prefix: 'Mx',
        name: 'Minter',
        coin: 'BIP',
    },
    ethereum: {
        prefix: '0x',
        name: 'Ethereum',
        coin: 'ETH',
    },
    bsc: {
        prefix: '0x',
        name: 'BNB Smart Chain',
        coin: 'BNB',
    },
};

export default {
    DASHBOARD_URL,
    components: {
        QrcodeVue,
    },
    props: {
        networkSlug: {
            type: String,
            required: true,
        },
        title: {
            type: String,
        },
        description: {
            type: [String, Boolean],
        },
        backUrl: {
            type: String,
        },
    },
    data() {
        return {
            isQrVisible: false,
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
        <p class="u-text-center" v-if="description">{{ description}}</p>
        <p class="u-text-center" v-else-if="description !== false">
            {{ $td(`Send any amount of ${network.coin} to this address`, 'topup-network.description', {coin: network.coin}) }}
        </p>

        <div class="h-field u-mt-10 u-mb-10">
            <div class="h-field__content">
                <div class="h-field__title">{{ $td('Your address', 'index.your-address') }}</div>
                <div class="h-field__input is-not-empty">{{ address }}</div>
            </div>
        </div>

        <div class="u-grid">
            <div class="u-cell u-cell--auto-grow" v-if="isClipboardSupported">
                <button
                    class="button button--main button--full button--narrow u-mt-05"
                    @click="copy(address)"
                >
                    {{ $td('Copy', 'topup-network.copy') }}
                </button>
            </div>
            <div class="u-cell u-cell--auto-grow" v-if="isShareSupported">
                <button
                    class="button button--main button--full button--narrow u-mt-05"
                    @click="shareAddress"
                >
                    {{ $td('Share', 'topup-network.share') }}
                </button>
            </div>
            <div class="u-cell u-cell--auto-grow">
                <button
                    class="button button--main button--full button--narrow u-mt-05"
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

        <nuxt-link class="button button--ghost button--full u-mt-15" :to="backUrl || $i18nGetPreferredPath('/topup')">
            {{ $td('Back', 'topup.back') }}
        </nuxt-link>
    </div>
</template>
