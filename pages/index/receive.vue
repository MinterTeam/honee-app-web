<script>
import getTitle from '~/assets/get-title.js';
import {DASHBOARD_URL} from '~/assets/variables.js';
import Modal from '~/components/base/Modal.vue';
import Topup, {TOP_UP_NETWORK} from '~/components/Topup.vue';

export default {
    DASHBOARD_URL,
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
        @modal-close="$router.push($i18nGetPreferredPath({path: $options.DASHBOARD_URL}))"
    >
        <Topup
            network-slug="minter"
            :title="$td('Your wallet address', 'receive.title')"
            :description="false"
            :back-url="$i18nGetPreferredPath({path: $options.DASHBOARD_URL})"
        />
    </Modal>
</template>
