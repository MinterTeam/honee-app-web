<script>
import axios from 'axios';
import {getErrorText} from '~/assets/server-error.js';
import {DASHBOARD_URL} from '~/assets/variables.js';

export default {
    layout: 'splash',
    asyncData({redirect, app, store}) {
        if (!window.isTWA) {
            return {
                error: 'Not a TWA',
            };
        }
        return window.getTelegramWebApp()
            .then((WebApp) => {
                if (!WebApp.initDataUnsafe?.hash) {
                    return {
                        error: 'No data from Telegram Bot',
                    };
                }
                const urlSearchParams = new URLSearchParams();
                urlSearchParams.append("req_data", WebApp.initData);

                return axios.get('https://dali.io/mnemonic', {
                    params: urlSearchParams,
                });
            })
            .then((response) => {
                store.commit('LOGOUT');
                store.commit('ADD_AUTH_ADVANCED', response.data.mnemonic);
                return app.router.push(app.i18nGetPreferredPath({path: DASHBOARD_URL}));
            })
            .catch((error) => {
                console.log(error);
                const errorText = typeof error.response?.data === 'string' ? error.response.data : getErrorText(error);
                return {
                    error: errorText,
                };
            });
    },
    data() {
        return {
            error: '',
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <template v-if="error">
            {{ error }}
        </template>
        <template v-else>Loading…</template>
    </div>
</template>
