// @ts-nocheck
import {getPromiseWithResolvers} from '@shrpne/utils/src/promise-resolve.js';
import {TWA_SCRIPT_URL, TWA_SCRIPT_HASH} from '~/assets/variables.js';
import {sendAddress as _sendAddress} from '~/api/telegram.js';

export default ({ app, store }) => {
    const isDevTWA = process.env.NODE_ENV === 'development' && window.location.hash.indexOf('tgWebAppData') !== -1;
    const isTWA = !!window.parent?.TelegramWebviewProxy || isDevTWA;
    // const isIframe = window.parent != null && window !== window.parent && window.parent.location.hostname !== 'honee.app';
    if (!isTWA) {
        return;
    }

    const [promiseLoad, resolveLoad] = getPromiseWithResolvers();
    window.isTWA = true;
    window.getTelegramWebApp = () => promiseLoad;

    let script = document.createElement('script');
    // script.async = true;
    // disable cross-origin check, because tg script doesn't provide CORS headers (anyway integrity checked by CSP meta)
    // script.integrity = TWA_SCRIPT_HASH;
    // script.crossOrigin = 'anonymous';
    script.src = TWA_SCRIPT_URL;
    script.onload = init;
    document.body.appendChild(script);

    // wait for script to load, because something (probably nuxt/vue internals) overwrite window.location.hash and prevent telegram to properly parse initData
    return promiseLoad;

    function init() {
        resolveLoad(window.Telegram.WebApp);

        window.Telegram.WebApp.expand();
        sendAddress();

        store.subscribe((mutation) => {
            if (mutation.type === 'ADD_AUTH_ADVANCED') {
                sendAddress();
            }
        });
    }

    function sendAddress() {
        if (store.getters.address) {
            const userId = window.Telegram.WebApp.initDataUnsafe.user?.id;
            // sendData not available in Keyboard WebApp
            // window.Telegram.WebApp.sendData(`user_id=${userId}&address=${store.getters.address}`);
            _sendAddress(userId, store.getters.address, window.Telegram.WebApp.initData);
        }
    }
};
