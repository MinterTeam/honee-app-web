<script>
import getTitle from '~/assets/get-title.js';
import Modal from '~/components/base/Modal.vue';
import TheAction from '~/components/Action.vue';

export default {
    components: {
        TheAction,
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
        <TheAction
            :base-url="getDashboardUrl()"
            @update:action="action = $event"
            @success-modal-close="$router.push(getDashboardUrl())"
        />
    </Modal>
</template>
