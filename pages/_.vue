<script>
import getTitle from '~/assets/get-title.js';
import TheAction from '~/components/Action.vue';

export default {
    layout(context) {
        return context.store.state.isMetagarden ? 'metagarden' : 'default';
    },
    components: {
        TheAction,
    },
    head() {
        if (!this.action) {
            return {};
        }

        const title = getTitle(this.action.title);
        return {
            title,
            meta: [
                {hid: 'og-title', name: 'og:title', content: title},
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
    <div class="u-section u-container u-container--small">
        <TheAction
            :base-url="getDashboardUrl()"
            @update:action="action = $event"
            @success-modal-close="$router.push(getDashboardUrl())"
        />
    </div>
</template>
