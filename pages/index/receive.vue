<script>
import getTitle from '~/assets/get-title.js';
import {HUB_CHAIN_ID} from '~/assets/variables.js';
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
            networkSlug: HUB_CHAIN_ID.MINTER,
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
            :network-slug="networkSlug"
            :title="$td('Your wallet address', 'receive.title')"
            :description="false"
            :back-url="getDashboardUrl()"
        />
    </Modal>
</template>
