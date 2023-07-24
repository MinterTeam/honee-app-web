<script>
import * as clipboard from 'clipbrd';
import QrcodeVue from 'qrcode.vue';
import BaseButtonCopyIcon from '~/components/base/BaseButtonCopyIcon.vue';

export default {
    components: {
        // QrcodeVue,
        BaseButtonCopyIcon,
    },
    props: {
        value: {
            type: String,
            required: true,
        },
        label: {
            type: String,
        },
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
    <div class="h-field">
        <div class="h-field__content" @click="copy(value)">
            <div class="h-field__title" v-if="label">{{ label }}</div>
            <div class="h-field__input is-not-empty">{{ value }}</div>
        </div>
        <div class="h-field__aside h-field__aside--with-icon" v-if="isClipboardSupported">
            <BaseButtonCopyIcon class="" :copy-text="value"/>
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
        <!--<qrcode-vue-->
        <!--    v-show="isQrVisible"-->
        <!--    class="u-mt-15 u-text-center"-->
        <!--    :value="value"-->
        <!--    :size="160"-->
        <!--    level="L"-->
        <!--    background="transparent"-->
        <!--/>-->
    </div>
</template>
