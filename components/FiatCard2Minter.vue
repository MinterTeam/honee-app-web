<script>
import {CARD_TO_MINTER_HOST} from '~/assets/variables.js';
import Modal from '~/components/base/Modal.vue';

export default {
    CARD_TO_MINTER_HOST,
    components: {
        Modal,
    },
    props: {
        isOpen: {
            type: Boolean,
            required: true,
        },
        amount: {
            type: [Number, String],
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
    },
    mounted() {
        window.addEventListener("message", function(event) {
            console.log('message', event);
            if (event.origin !== CARD_TO_MINTER_HOST || event.data.name !== 'card2minter_order_updated') {
                return;
            }
            //
            // alert( "received: " + event.data );

            // can message back using event.source.postMessage(...)
        });
    },
};
</script>

<template>
    <Modal :is-open="isOpen" modal-class="ctm-modal" modal-container-class="">
        <iframe :src="`${$options.CARD_TO_MINTER_HOST}/?amount=${amount}&address=${address}`"/>
    </Modal>
</template>

<style>
.ctm-modal {padding-top: 24px;}
.ctm-modal .modal__wrap {padding-bottom: 24px;}
.ctm-modal .modal__container {max-width: 488px;}
.ctm-modal iframe {width: 100%; height: calc(100vh - 48px); border: none; border-radius: 10px;}
</style>
