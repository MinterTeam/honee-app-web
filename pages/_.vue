<script>
import getTitle from '~/assets/get-title.js';
import TheAction from '~/components/Action.vue';

export default {
    layout(context) {
        return context.store.getters.isMetagarden ? 'metagarden' : 'default';
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
    methods: {
        handleSuccess() {
            const lastHistory = this.$store.state.history.at(-1)?.url;
            const redirectUrl = lastHistory ? this.$i18nGetPreferredPath(lastHistory) : this.$getDashboardUrl();
            this.$router.push(redirectUrl);
        },
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <TheAction
            :base-url="$getDashboardUrl()"
            @update:action="action = $event"
            @success-modal-close="handleSuccess()"
        />
    </div>
</template>
