<script>
import getTitle from '~/assets/get-title.js';
import Modal from '~/components/base/Modal.vue';
import Topup, {TOP_UP_NETWORK} from '~/components/Topup.vue';

export default {
    components: {
        Modal,
        Topup,
    },
    asyncData({route, error}) {
        const networkSlug = route.params.name;
        const network = TOP_UP_NETWORK[route.params.name];
        if (!network) {
            return error({status: 404, message: 'Page not found'});
        } else {
            return {
                network,
                networkSlug,
            };
        }
    },
    head() {
        const title = getTitle(this.$td('Top up with', 'topup-network.title') + ' ' + this.network.coin);

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
            networkSlug: '',
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
        <Topup v-if="networkSlug" :network-slug="networkSlug"/>
    </Modal>
</template>
