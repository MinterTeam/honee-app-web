<script>
import * as clipboard from 'clipbrd';
import useWeb3SmartWallet from '~/composables/use-web3-smartwallet.js';
import QrcodeVue from 'qrcode.vue';
import BaseButtonCopyIcon from '~/components/base/BaseButtonCopyIcon.vue';

export default {
    components: {
        QrcodeVue,
        BaseButtonCopyIcon,
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
    data() {
        return {
            isQrVisible: false,
        };
    },
    computed: {
        isClipboardSupported() {
            return clipboard.isSupported();
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
                // this.isToastVisible = true;
            }
        },
    },
};
</script>

<template>
    <div>
        <h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
            <img class="u-mr-minus-025" src="https://explorer-static.minter.network/coins/2065.png" alt="" role="presentation" width="24" height="24">
            <img class="u-mr-05" src="https://explorer-static.minter.network/coins/2107.png" alt="" role="presentation" width="24" height="24">
            {{ $td('Ethereum & BNB Smart Chain', 'deposit.title-evm') }}
        </h2>
        <p class="u-text-medium">
            {{ $td(`Transfer any token (ERC20 or BEP20) from Ethereum or BNB Smart Chain networks to this address.`, 'deposit.description-evm') }}
        </p>

        <div class="h-field u-mt-10 u-mb-10">
            <div class="h-field__content" @click="copy(smartWalletAddress)">
                <div class="h-field__title">{{ $td('Smart wallet address', 'deposit.smart-wallet-address') }}</div>
                <div class="h-field__input h-field__input--medium is-not-empty">{{ smartWalletAddress }}</div>
            </div>
            <div class="h-field__aside h-field__aside--with-icon" v-if="isClipboardSupported">
                <BaseButtonCopyIcon class="" :copy-text="smartWalletAddress"/>
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
</template>
