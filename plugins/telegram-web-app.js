// @ts-nocheck
import {TWA_SCRIPT_URL, TWA_SCRIPT_HASH} from '~/assets/variables.js';

export default ({ app, store }) => {
    const isTWA = !!window.parent?.TelegramWebviewProxy;
    // const isIframe = window.parent != null && window !== window.parent && window.parent.location.hostname !== 'honee.app';
    if (!isTWA) {
        return;
    }

    let script = document.createElement('script');
    script.async = true;
    // disable cross-origin check, because tg script doesn't provide CORS headers (anyway integrity checked by CSP meta)
    // script.integrity = TWA_SCRIPT_HASH;
    // script.crossOrigin = 'anonymous';
    script.src = TWA_SCRIPT_URL;
    script.onload = init;
    document.body.appendChild(script);

    function init() {
        sendAddress();

        store.subscribe((mutation) => {
            if (mutation.type === 'ADD_AUTH_ADVANCED') {
                sendAddress();
            }
        });
    }

    function sendAddress() {
        if (store.getters.isAuthorized) {
            const userId = window.Telegram.WebApp.initDataUnsafe.user?.id;
            window.Telegram.WebApp.sendData(`user_id=${userId}&address=${store.getters.address}`);
        }
    }
};
