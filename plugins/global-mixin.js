import Vue from 'vue';
import {BASE_URL_PREFIX, DASHBOARD_URL, DASHBOARD_URL_METAGARDEN} from '~/assets/variables.js';

Vue.mixin({
    computed: {
        BASE_URL_PREFIX: () => BASE_URL_PREFIX,
        DASHBOARD_URL: () => DASHBOARD_URL,
        DASHBOARD_URL_METAGARDEN: () => DASHBOARD_URL_METAGARDEN,
    },
    methods: {
        $i18nGetPreferredPath(route, locale) {
            const path = this.localePath(route, locale);
            return path.length > 1 ? path.replace(/\/$/, '') : path;
        },
        $getDashboardUrl(page = '/', baseUrl) {
            if (!baseUrl) {
                baseUrl = this.$store.getters.isMetagarden ? DASHBOARD_URL_METAGARDEN : DASHBOARD_URL;
            }
            return this.$i18nGetPreferredPath((baseUrl + page).replace('//', '/'));
        },
        /** @deprecated */
        getDashboardUrl(page, baseUrl) {
            return this.$getDashboardUrl(page, baseUrl);
        },
    },
});

export default ({ app}) => {
    app.i18nGetPreferredPath = app.localePath;
};
