<script>
    import * as clipboard from 'clipbrd';
    import QrcodeVue from 'qrcode.vue';
    import getTitle from '~/assets/get-title.js';
    import Modal from '~/components/base/Modal.vue';
    import BaseButtonCopy from '~/components/base/BaseButtonCopy.vue';

    export default {
        PAGE_TITLE: 'Receive Coins',
        components: {
            QrcodeVue,
            Modal,
            BaseButtonCopy,
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            };
        },
        data() {
            return {
            };
        },
        computed: {
            isClipboardSupported() {
                return clipboard.isSupported();
            },
            isShareSupported() {
                return window.navigator.share;
            },
        },
        methods: {
            copy(str) {
                clipboard.copy(str);
                this.isToastVisible = true;
            },
            shareAddress() {
                window.navigator.share({
                    title: 'My address',
                    text: this.$store.getters.address,
                });
            },
        },
    };
</script>

<template>
    <Modal :isOpen="true" :hideCloseButton="false" :disableOutsideClick="true" @modal-close="$router.push('/')">
        <div class="form-field form-field--with-icon u-text-left">
            <div class="form-field__input is-not-empty">{{ $store.getters.address }}</div>
            <div class="form-field__label">Your address</div>
            <BaseButtonCopy class="form-field__icon form-field__icon--copy u-semantic-button link--opacity" :copy-text="$store.getters.address">
                <img src="/img/icon-copy.svg" alt="Copy">
            </BaseButtonCopy>
        </div>
        <qrcode-vue class="u-mt-20" :value="$store.getters.address" :size="160" level="L"/>
        <div class="u-section u-container" v-if="isShareSupported">
            <button class="bip-button bip-button--main" @click="shareAddress">Share Address</button>
        </div>
    </Modal>
</template>
