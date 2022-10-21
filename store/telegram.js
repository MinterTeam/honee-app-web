import {v4 as getUid} from 'uuid';
import {getAuth} from '~/api/telegram-auth.js';

const TELEGRAM_SECRET_ID_STORAGE_KEY = 'telegram-auth-id';

export const state = () => ({
    secretDeviceId: '',
    /** @type {TelegramAuthResponse} */
    auth: undefined,
});

export const getters = {
    isAuthorized(state) {
        return !!state.auth;
    },
    authString(state) {
        if (!state.auth) {
            return '';
        }
        return `id=${state.auth.user.telegramId}&hash=${state.auth.signed}`;
    },
};

export const mutations = {
    initSecretId(state) {
        // try restore saved id
        if (!state.secretDeviceId) {
            try {
                state.secretDeviceId = window.localStorage.getItem(TELEGRAM_SECRET_ID_STORAGE_KEY);
            } catch (e) {}
        }

        // init new
        if (!state.secretDeviceId) {
            state.secretDeviceId = getUid();
            try {
                window.localStorage.setItem(TELEGRAM_SECRET_ID_STORAGE_KEY, state.secretDeviceId);
            } catch (e) {}
        }
    },
    saveAuth(state, data) {
        state.auth = data;
    },
};

export const actions = {
    fetchAuth({state, commit}) {
        if (!state.secretDeviceId) {
            commit('initSecretId');
        }
        return getAuth(state.secretDeviceId)
            .then((data) => {
                commit('saveAuth', data);
                return data;
            })
            .catch((error) => {
                if (error.response?.status !== 404) {
                    throw error;
                }
            });
    },
};
