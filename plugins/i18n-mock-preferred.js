import Vue from 'vue';
import {DASHBOARD_URL} from '~/assets/variables.js';

Vue.mixin({
    methods: {
        $i18nGetPreferredPath(route, locale) {
            const path = this.localePath(route, locale);
            return path.length > 1 ? path.replace(/\/$/, '') : path;
        },
        pageUrl(page = '') {
            return this.$i18nGetPreferredPath((DASHBOARD_URL + page).replace('//', '/'));
        },
    },
});

export default ({ app}) => {
    app.i18nGetPreferredPath = app.localePath;
};
