import Vue from 'vue';

Vue.mixin({
    computed: {
        isIosWebView() {
            const ua = navigator.userAgent;
            // https://github.com/atomantic/is-ua-webview/blob/main/data/rules.js#L5
            return /(iPhone|iPod|iPad)(?!.*Safari)/i.test(ua)
                // https://github.com/atomantic/is-ua-webview/issues/2
                || /(iPhone|iPod|iPad).*AppleWebKit/i.test(ua);

        },
    },
});
