<script>
import getTitle from '~/assets/get-title.js';
import HubBuyForm from '~/components/HubBuyForm.vue';
import Modal from '~/components/base/Modal.vue';

export default {
    PAGE_TITLE: 'Buy BIP & HUB for ETH',
    components: {
        HubBuyForm,
        Modal,
    },
    head() {
        return {
            title: getTitle(this.$options.PAGE_TITLE),
            meta: [
                { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
            ],
        };
    },
};
</script>

<template>
    <Modal
        :isOpen="true"
        :hideCloseButton="false"
        :disableOutsideClick="true"
        modalContainerClass="card card--light-grey"
        @modal-close="$router.push('/')"
    >
        <HubBuyForm class="card__content"/>

        <div class="card__content">
            <h3 class="u-h5 u-mb-05">What’s BIP?</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus. Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>

            <h3 class="u-h5 u-mb-05 u-mt-15">What's swap?</h3>
            <p>Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>

            <h3 class="u-h5 u-mb-05 u-mt-15">Is it possible to cancel the transaction?</h3>
            <p>Augue nisi quis dignissim sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>

            <h3 class="u-h5 u-mb-05 u-mt-15">How long does a transaction take to complete?</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquet ac tellus etiam.</p>
        </div>

    </Modal>
</template>
