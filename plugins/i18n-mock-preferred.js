import Vue from 'vue';

Vue.mixin({
    methods: {
        $i18nGetPreferredPath(route, locale) {
            return this.localePath(route, locale);
        },
    },
});

export default ({ app}) => {
    app.i18nGetPreferredPath = app.localePath;
};
