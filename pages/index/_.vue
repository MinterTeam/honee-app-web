<script>
import getTitle from '~/assets/get-title.js';
import Modal from '~/components/base/Modal.vue';
import CardAction from '~/components/CardAction.vue';

export default {
    components: {
        CardAction,
        Modal,
    },
    head() {
        if (!this.action) {
            return {};
        }

        const title = getTitle(this.action.title);
        return {
            title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
            ],
        };
    },
    data() {
        // https://github.com/nuxt/nuxt.js/issues/2444
        return {
            /** @type {ActionItem|null} */
            action: this.action || null,
        };
    },
};
</script>

<template>
    <Modal
        v-if="$route.params.pathMatch"
        :isOpen="true"
        :hideCloseButton="false"
        :disableOutsideClick="true"
        modalContainerClass=""
        @modal-close="$router.push(getDashboardUrl())"
    >
        <CardAction
            :base-url="getDashboardUrl()"
            @update:action="action = $event"
            @success-modal-close="$router.push(getDashboardUrl())"
        />
    </Modal>
</template>
