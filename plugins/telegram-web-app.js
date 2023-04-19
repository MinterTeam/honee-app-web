// @ts-nocheck
export default ({ app }) => {
    const isTWA = !!window.parent?.TelegramWebviewProxy;
    // const isIframe = window.parent != null && window !== window.parent && window.parent.location.hostname !== 'honee.app';
    if (!isTWA) {
        return;
    }

    let script = document.createElement('script');
    // script.async = true;
    script.integrity = 'sha384-rrYCDcTm7U/NeMS1/3PpsuYOwjAtiQZUyC8dUH9dudYxQ3BioJkRzB8ueU0oZ7zg';
    script.crossOrigin = 'anonymous';
    script.src = `https://telegram.org/js/telegram-web-app.js`;
    document.body.appendChild(script);
};
