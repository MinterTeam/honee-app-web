<script>
import getTitle from '~/assets/get-title.js';
import Modal from '~/components/base/Modal.vue';
import Topup from '~/components/Topup.vue';

export default {
    components: {
        Modal,
        Topup,
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
            networkSlug: 'bip',
        };
    },
};
</script>

<template>
    <Modal
        :isOpen="true"
        :hideCloseButton="false"
        :disableOutsideClick="false"
        @modal-close="$router.push(getDashboardUrl())"
    >
        <Topup
            network-slug="minter"
            :title="$td('Your wallet address', 'receive.title')"
            :description="false"
            :back-url="getDashboardUrl()"
        />
    </Modal>
</template>
