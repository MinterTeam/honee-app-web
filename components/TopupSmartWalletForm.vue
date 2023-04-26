<script>
import * as clipboard from 'clipbrd';
import QrcodeVue from 'qrcode.vue';
import BaseButtonCopyIcon from '~/components/base/BaseButtonCopyIcon.vue';

export default {
    components: {
        QrcodeVue,
        BaseButtonCopyIcon,
    },
    data() {
        return {
            isQrVisible: false,
        };
    },
    computed: {
        smartWalletAddress() {
            return this.$store.getters.smartWalletAddress;
        },
        isClipboardSupported() {
            return clipboard.isSupported();
        },
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

        <div class="h-field u-mt-10 u-mb-05">
            <div class="h-field__content" @click="copy(smartWalletAddress)">
                <div class="h-field__title">{{ $td('Smart wallet address', 'deposit.smart-wallet-address') }}</div>
                <div class="h-field__input h-field__input--medium is-not-empty">{{ smartWalletAddress }}</div>
            </div>
            <div class="h-field__aside h-field__aside--with-icon" v-if="isClipboardSupported">
                <BaseButtonCopyIcon class="" :copy-text="smartWalletAddress"/>
            </div>
        </div>

        <ul class="form-row u-text-muted u-text-small">
            <template v-if="$i18n.locale === 'en'">
                <li>Only ERC20 or BEP20 tokens</li>
                <li>Supported networks: Ethereum & BNB Smart Chain</li>
                <li>Any amount</li>
            </template>
            <template v-if="$i18n.locale === 'ru'">
                <li>Только ERC20 или BEP20 токены</li>
                <li>Сети: Ethereum и BNB Smart Chain</li>
                <li>Любое количество</li>
            </template>
        </ul>


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
