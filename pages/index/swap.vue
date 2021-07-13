<script>
    import {mapState} from 'vuex';
    import VOnsPage from 'vue-onsenui/esm/components/VOnsPage';
    import VOnsTabbar from 'vue-onsenui/esm/components/VOnsTabbar';
    import VOnsTab from 'vue-onsenui/esm/components/VOnsTab';
    import getTitle from '~/assets/get-title.js';
    import {getExplorerTxUrl} from '~/assets/utils.js';
    import ConvertSell from '~/components/ConvertSell.vue';
    import ConvertBuy from '~/components/ConvertBuy.vue';
    import Modal from '~/components/base/Modal.vue';

    export default {
        PAGE_TITLE: 'Swap coins',
        components: {
            VOnsPage,
            VOnsTabbar,
            VOnsTab,
            ConvertSell,
            ConvertBuy,
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
            this.$ons.platform.select('android'); // Or any other method
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
    <Modal :isOpen="true" :hideCloseButton="false" :disableOutsideClick="true" @modal-close="$router.push('/')">
        <v-ons-tabbar class="ons-tabbar" v-if="balance && balance.length">
            <v-ons-tab label="Sell"/>
            <v-ons-tab label="Buy"/>

            <template slot="pages">
                <v-ons-page>
                    <ConvertSell @success-tx="openSuccessModal"/>
                </v-ons-page>
                <v-ons-page>
                    <ConvertBuy @success-tx="openSuccessModal"/>
                </v-ons-page>
            </template>
        </v-ons-tabbar>

        <div class="u-section u-container" v-else>
            No coins to exchange
            <!--<span v-if="isBalanceLoading">Loading…</span>
            <span v-else>No coins to send</span>-->
        </div>

        <!-- success modal -->
        <Modal :isOpen.sync="isSuccessModalOpen" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Success</h3>
                <div class="modal__content">
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
