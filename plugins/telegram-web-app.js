// @ts-nocheck
import {TWA_SCRIPT_URL, TWA_SCRIPT_HASH} from '~/assets/variables.js';

export default ({ app }) => {
    const isTWA = !!window.parent?.TelegramWebviewProxy;
    // const isIframe = window.parent != null && window !== window.parent && window.parent.location.hostname !== 'honee.app';
    if (!isTWA) {
        return;
    }

    let script = document.createElement('script');
    // script.async = true;
    // disable cross-origin check, because tg script doesn't provide CORS headers (anyway integrity checked by CSP meta)
    // script.integrity = TWA_SCRIPT_HASH;
    // script.crossOrigin = 'anonymous';
    script.src = TWA_SCRIPT_URL;
    document.body.appendChild(script);
};
