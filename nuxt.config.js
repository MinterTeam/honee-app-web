// register env before other imports @see https://www.npmjs.com/package/dotenv#how-do-i-use-dotenv-with-import-
import 'dotenv/config';
import dotenv from 'dotenv';
import webpack from 'webpack';

const envConfig = dotenv.config();
const envConfigParsed = envConfig.error ? {} : envConfig.parsed;

import langEn from './lang/en.js';
import langRu from './lang/ru.js';
import {BASE_TITLE, BASE_DESCRIPTION, I18N_ROUTE_NAME_SEPARATOR, LANGUAGE_COOKIE_KEY} from "./assets/variables.js";
import * as varsConfig from "./assets/variables.js";

const NUXT_LOADING_INLINE_SCRIPT_SHA = process.env.NODE_ENV === 'production'
    ? [
        // loader (minified)
        'tempUn1btibnrWwQxEk37lMGV1Nf8FO/GXxNhLEsPdg=',
        // module (minified)
        'yX/iyX7D+2AX+qF0YUk4EXLqu5fIbl/NS5QXjj9BX4M=',
        // window.___NUXT___ (prod)
        'YvYJ5WVzt8kOVVuSB9YcyVJLN4a6HcbOgQpzrg0BLUI=',
    ]
    : [
        // loader (not minified)
        '9VDmhXS8/iybLLyD3tql7v7NU5hn5+qvu9RRG41mugM=',
        // window.___NUXT___ (dev)
        'uMkuBZ4FQVVBqzs6NHOoGr/1vOLA1h9acPURz3E39HA=',
    ];

/**
 * prepare CSP string from env config
 * @param {Object} env - env config
 * @param {Function} keyFilter
 */
function prepareCSP(env, keyFilter) {
    // make array of filtered URLs
    const filteredKeys = Object.keys(env).filter(keyFilter);
    const filtered = filteredKeys.map((key) => env[key]).filter((item) => typeof item === 'string');

    const parsed = filtered.map((item) => {
        // remove path, remove query
        const hostname = item.replace(/(\w)\/.*$/, '$1').replace(/\?.*$/, '');
        // const domainParts = hostname.split('.');
        // const topLevelDomain = domainParts[domainParts.length - 2] + '.' + domainParts[domainParts.length - 1];
        // if (topLevelDomain !== hostname) {
        //     return '*.' + topLevelDomain;
        // } else {
        //     return topLevelDomain;
        // }
        return hostname;
    });

    const parsedUnique = parsed.filter((item, pos) => {
        return parsed.indexOf(item) === pos && parsed.indexOf('*.' + item) === -1;
    });

    return parsedUnique.join(' ');
}

const connectCSP = prepareCSP(varsConfig, (item) => {
    return item.indexOf('API_URL') >= 0 || item.indexOf('RTM_URL') >= 0 || item.indexOf('API_HOST') >= 0;
});
const imageCSP = prepareCSP(varsConfig, (item) => {
    return item === 'APP_ACCOUNTS_API_URL';
});
const scriptCSP = NUXT_LOADING_INLINE_SCRIPT_SHA.map((item) => {
    return `'sha256-${item}'`;
}).join(' ');


module.exports = {
    ssr: false,
    // ssr prerender fails yet
    // target: 'static',
    telemetry: false,
    /*
    ** Headers of the page
    */
    head: {
        title: BASE_TITLE,
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { 'http-equiv': 'Content-Security-Policy-Report-Only', content: `
                    default-src 'self' ${connectCSP};
                    script-src 'self' ${scriptCSP} 'unsafe-eval';
                    style-src 'self' 'unsafe-inline';
                    img-src 'self' ${imageCSP} *.minter.network data:;
                    font-src 'self' data:;
                    base-uri 'none';
                    form-action 'none';
                    frame-ancestors https://honee.app;
                    report-uri https://csp-report-collector.minter.network https://1ba68dd21788a2dfc5522a62c6674f25.report-uri.com/r/d/csp/reportOnly;
                    report-to default;
                `,
            },
            { hid: 'description', name: 'description', content: BASE_DESCRIPTION },
            { hid: 'og-title', name: 'og:title', content: BASE_TITLE },
            { hid: 'og-description', name: 'og:description', content: BASE_DESCRIPTION },
            { hid: 'og-image', name: 'og:image', content: '/social-share.png' },
        ],
        link: [
            { rel: 'icon', href: '/favicon.png' },
            { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        ],
    },
    css: [
        './static/css/style.min.css',
    ],
    /*
    ** Customize the progress bar color
    */
    loading: { color: '#ff8a00' },
    router: {
        linkActiveClass: 'is-active-inner',
        linkExactActiveClass: 'is-active',
        middleware: [
            'auth',
            'history',
            'explorer',
            'portfolio',
            'balance',
        ],
    },
    env: envConfigParsed,
    modules: [
        /*
        ['nuxt-i18n-preferred', {
            routesNameSeparator: I18N_ROUTE_NAME_SEPARATOR,
            languageCookieKey: LANGUAGE_COOKIE_KEY,
            detectBrowserLanguage: false,
        }],
        */
        'nuxt-i18n-default',
        ['@nuxtjs/i18n', {
            locales: [
                {
                    code: 'en',
                    iso: 'en',
                    name: 'English',
                },
                {
                    code: 'ru',
                    iso: 'ru',
                    name: 'Russian',
                },
            ],
            defaultLocale: 'en',
            routesNameSeparator: I18N_ROUTE_NAME_SEPARATOR,
            strategy: 'prefix_except_default',
            rootRedirect: null,
            vueI18n: {
                fallbackLocale: 'en',
                messages: {
                    ru: langRu,
                    en: langEn,
                },
            },
            seo: false,
            detectBrowserLanguage: false,
        }],
        function() {
            // fix wrong order for '/ru' page with child routes
            this.extendRoutes((routes, resolve) => {
                const rootRuIndex = routes.findIndex((item) => item.path === '/ru');
                const rootRu = routes.splice(rootRuIndex, 1)[0];
                const rootEnIndex = routes.findIndex((item) => item.path === '/');
                routes.splice(rootEnIndex, 0, rootRu);
            });
        },
        // '@nuxt/content',
    ],
    buildModules: [
        setVueAliasesModule,
    ],
    plugins: [
        { src: '~/plugins/i18n-mock-preferred.js'},
        { src: '~/plugins/base-url-prefix.js'},
        { src: '~/plugins/composition-api.js'},
        { src: '~/plugins/online.js', ssr: false },
        { src: '~/plugins/custom-event-polyfill.js', ssr: false },
        { src: '~/plugins/persisted-state.js', ssr: false },
        { src: '~/plugins/click-blur.js', ssr: false },
        { src: '~/plugins/referral.js', ssr: false },
        { src: '~/plugins/goatcounter.js', ssr: false },
    ],
    content: {
        liveEdit: false,
        markdown: {
            remarkAutolinkHeadings: false,
        },
    },
    /*
    ** PWA manifest
     */
    manifest: {
        name: BASE_TITLE,
        short_name: BASE_TITLE,
        lang: 'en',
    },
    /*
    ** PWA meta
     */
    meta: {
        mobileAppIOS: true,
        name: BASE_TITLE,
        author: 'Minter',
        favicon: false,
    },
    modern: process.env.NODE_ENV === 'development' ? false : 'client',
    /*
    ** Build configuration
    */
    build: {
        extractCSS: true,
        optimizeCSS: false,
        postcss: false,
        watch: [
            './api/',
            // `./lang/`, // this watcher dont-work yet
        ],
        extend(config, { isDev, isClient, isServer }) {
            if (!config.resolve) {
                config.resolve = {};
            }
            // use module over the browser for better bundle size
            config.resolve.mainFields =  ['module', 'browser', 'main'];

            // fix @vueuse/core https://github.com/vueuse/vueuse/issues/718#issuecomment-913319680
            config.module.rules.push({
                test: /\.mjs$/,
                include: /node_modules/,
                type: "javascript/auto",
            });
        },
        plugins: [
            new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
            new webpack.IgnorePlugin(/^\.\/genesisStates\/\w+\.json/, /@ethereumjs\/common/),
            new webpack.IgnorePlugin(/^\.\/\w+\.json/, /@ethereumjs\/common\/dist\.browser\/genesisStates/),
        ],
        babel: {
            presets: [
                [
                    '@nuxt/babel-preset-app',
                    {
                        // debug: false,
                        // targets: isServer ? { node: '10' } : { ie: '11' },
                        corejs: { version: 3 },
                    },
                ],
            ],
            plugins: [
                // '@babel/plugin-proposal-optional-chaining',
            ],
            // prevent @babel/plugin-transform-runtime from inserting `import` statement into commonjs files (bc. it breaks webpack)
            sourceType: 'unambiguous',
        },
        transpile: [
            /es6-promise|\.(?!(?:js|json)$).{1,5}$/i,
            '@material/',
            '/base-x/',
            'date-fns/esm',
            'vue-simple-suggest/dist/es7',
            'vue-simple-suggest/lib',
            'centrifuge/src',
            'autonumeric/src',
            'vue-autonumeric/src',
            'vuelidate/src',
            'lodash-es',
            // 'nuxt-i18n/src',
            'v-file-input/src',
            'clipbrd/src',
            'pretty-num/src',
            'from-exponential/src',
            'minterjs-util',
            'minterjs-tx',
            'minterjs-wallet',
            'minter-js-sdk',
        ],
    },
};


// @see https://github.com/nuxt-community/composition-api/blob/main/src/module/index.ts#L24
function setVueAliasesModule() {
    const nuxt = this.nuxt;
    const vueEntry =
        nuxt.options.alias.vue ||
        (nuxt.options.dev
            ? this.nuxt.resolver.resolveModule('vue/dist/vue.common.dev.js')
            : this.nuxt.resolver.resolveModule('vue/dist/vue.runtime.esm.js'));

    const vueAliases = Object.fromEntries(
        [
            // vue 2 dist files
            '.common.dev',
            '.common',
            '.common.prod',
            '.esm.browser',
            '.esm.browser.min',
            '.esm',
            '',
            '.min',
            '.runtime.common.dev',
            '.runtime.common',
            '.runtime.common.prod',
            '.runtime.esm',
            '.runtime',
            '.runtime.min',
        ]
            .flatMap((m) => [`vue/dist/vue${m}`, `vue/dist/vue${m}.js`])
            .map((m) => [m, vueEntry]),
    );

    nuxt.options.alias = {
        ...vueAliases,
        ...nuxt.options.alias,
        vue: vueEntry,
    };
}
