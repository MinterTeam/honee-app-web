<script>
import {translateCardField} from '~/components/Card.vue';
import {getProductSettings} from '~/components/TopupCoinOptions.vue';

export default {
    components: {
    },
    fetch() {
        if (!this.settings.custom) {
            return this.$nuxt.error({ status: 404, message: 'Page not found' });
        }
    },
    computed: {
        settings() {
            return getProductSettings(this.$route.params.coin);
        },
    },
    methods: {
        translate(item, key) {
            return translateCardField(item, key, this.$i18n.locale);
        },
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small u-text-center">
        <div class="card card__content card__content--medium">
            <h1 class="u-h3 u-mb-05">{{ translate(settings.custom, 'label') }}</h1>
            <component :is="settings.custom.component" />
        </div>
    </div>
</template>
