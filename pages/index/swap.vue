<script>
    import {mapState} from 'vuex';
    import getTitle from '~/assets/get-title.js';
    import {getExplorerTxUrl} from '~/assets/utils.js';
    import Swap from '~/components/Swap.vue';
    import Modal from '~/components/base/Modal.vue';

    export default {
        PAGE_TITLE: 'Swap coins',
        components: {
            Swap,
            Modal,
        },

        directives: {

        },
        filters: {

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
                // activeIndex: 0,
                isSuccessModalOpen: false,
                successHash: '',
            };
        },
        computed: {
            ...mapState({
                balance: 'balance',
            }),
        },
        beforeCreate() {
            // this.$ons.platform.select('android'); // Or any other method
        },
        methods: {
            openSuccessModal({hash}) {
                this.successHash = hash;
                this.isSuccessModalOpen = true;
            },
            getExplorerTxUrl,
        },


    };
</script>

<template id="main">
    <Modal
        :isOpen="true"
        :hideCloseButton="false"
        :disableOutsideClick="true"
        modalContainerClass="card card--light-grey"
        @modal-close="$router.push('/')"
    >
        <Swap class="card__content" @success-tx="openSuccessModal"/>

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

        <!-- success modal -->
        <Modal :isOpen.sync="isSuccessModalOpen" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Success</h3>
                <div class="modal__content u-mb-10">
                    <p>Coins successfully exchanged!</p>
                </div>
                <div class="modal__footer">
                    <a class="bip-button bip-button--ghost-main" :href="getExplorerTxUrl(successHash)" target="_blank">View transaction</a>
                    <button class="bip-button bip-button--ghost-main" @click="isSuccessModalOpen = false">Close</button>
                </div>
            </div>
        </Modal>

    </Modal>
</template>
