<script>
    import * as clipboard from 'clipbrd';
    import QrcodeVue from 'qrcode.vue';
    import getTitle from '~/assets/get-title.js';
    import {DASHBOARD_URL} from '~/assets/variables.js';
    import Modal from '~/components/base/Modal.vue';
    import BaseButtonCopy from '~/components/base/BaseButtonCopy.vue';

    export default {
        DASHBOARD_URL,
        components: {
            QrcodeVue,
            Modal,
            BaseButtonCopy,
        },
        head() {
        const title = getTitle(this.$td('Receive coins', 'index.receive-coins'));

            return {
                title,
                meta: [
                    { hid: 'og-title', name: 'og:title', content: title },
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
                    title: this.$td('My address', 'index.my-address'),
                    text: this.$store.getters.address,
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
        <div class="form-field form-field--with-icon u-text-left">
            <div class="form-field__input is-not-empty">{{ $store.getters.address }}</div>
            <div class="form-field__label">{{ $td('Your address', 'index.your-address') }}</div>
            <BaseButtonCopy class="form-field__icon form-field__icon--copy u-semantic-button link--opacity" :copy-text="$store.getters.address">
                <img src="/img/icon-copy.svg" alt="Copy">
            </BaseButtonCopy>
        </div>
        <qrcode-vue class="u-mt-10 u-text-center" :value="$store.getters.address" :size="160" level="L"/>

        <div class="u-mt-10" v-if="isShareSupported">
            <button class="button button--ghost-main button--full" @click="shareAddress">{{ $td('Share address', 'index.share-address') }}</button>
        </div>

        <nuxt-link class="button button--main button--full u-mt-10" :to="$i18nGetPreferredPath($options.DASHBOARD_URL + 'buy')">
            {{ $td('Top up with BNB & ETH', 'index.top-up-with-eth') }}
        </nuxt-link>
    </Modal>
</template>
