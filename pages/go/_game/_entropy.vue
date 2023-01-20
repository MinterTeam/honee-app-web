<script>
import {entropyToMnemonic} from 'bip39';

export default {
    layout: 'splash',
    asyncData({route, store, app, error}) {
        const game = route.params.game;
        const entropy = route.params.entropy;
        if (!game || !entropy) {
            return error({status: 404, message: 'Page not found'});
        }
        if (entropy.length !== 32) {
            return error({status: 404, message: 'Invalid auth link'});
        }

        const mnemonic = entropyToMnemonic(entropy);

        store.commit('LOGOUT');
        store.commit('ADD_AUTH_ADVANCED', mnemonic);

        return app.router.replace(app.i18nGetPreferredPath('/' + game));
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        Authorizing…
    </div>
</template>

