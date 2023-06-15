// @ts-nocheck
import {getPromiseWithResolvers} from '@shrpne/utils/src/promise-resolve.js';
import {TWA_SCRIPT_URL, TWA_SCRIPT_HASH} from '~/assets/variables.js';
import {sendAddress as _sendAddress} from '~/api/telegram.js';

export default ({ app, store }) => {
    console.log(window.location.hash);
    const isTWA = !!window.parent?.TelegramWebviewProxy;
    // const isIframe = window.parent != null && window !== window.parent && window.parent.location.hostname !== 'honee.app';
    if (!isTWA) {
        return;
    }

    const [promiseLoad, resolveLoad] = getPromiseWithResolvers();
    window.isTWA = true;
    window.getTelegramWebApp = () => promiseLoad;

    let script = document.createElement('script');
    script.async = true;
    // disable cross-origin check, because tg script doesn't provide CORS headers (anyway integrity checked by CSP meta)
    // script.integrity = TWA_SCRIPT_HASH;
    // script.crossOrigin = 'anonymous';
    script.src = TWA_SCRIPT_URL;
    script.onload = init;
    document.body.appendChild(script);

    function init() {
        console.log(window.location.hash);
        console.log(window.Telegram.WebApp);
        console.log(JSON.stringify(window.Telegram.WebApp));
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
