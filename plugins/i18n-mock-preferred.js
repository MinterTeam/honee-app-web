import Vue from 'vue';

Vue.mixin({
    methods: {
        $i18nGetPreferredPath(route, locale) {
            const path = this.localePath(route, locale);
            return path.length > 1 ? path.replace(/\/$/, '') : path;
        },
    },
});

export default ({ app}) => {
    app.i18nGetPreferredPath = app.localePath;
};
