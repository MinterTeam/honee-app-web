<script>
import {entropyToMnemonic} from 'bip39';
import {DASHBOARD_URL_METAGARDEN} from '~/assets/variables.js';

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

        store.dispatch('AUTHORIZE_MNEMONIC', mnemonic);
        store.commit('SET_METAGARDEN');

        const newPath = game === 'metagarden' ? DASHBOARD_URL_METAGARDEN : '/' + game;

        return app.router.replace(app.i18nGetPreferredPath(newPath))
            .catch((error) => {
                // fix error on double redirect @see https://stackoverflow.com/a/65326844
                if (error.type !== app.router.constructor.NavigationFailureType.redirected) {
                    throw error;
                }
            });
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        Authorizing…
    </div>
</template>

