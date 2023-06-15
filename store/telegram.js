import {v4 as getUid} from 'uuid';
import {getAuth, getLegacyAuth, getUserPortfolioNotificationList, switchLegacyAuth} from '~/api/telegram.js';
import {IS_SUBAPP_MEGAGAMER} from '~/assets/variables.js';

/**
 // * @typedef {import('~/api/telegram.js').TelegramAuthResponse} TelegramAuthResponse
 */

const LEGACY_TELEGRAM_SECRET_ID_STORAGE_KEY = 'telegram-auth-id';

export const state = () => ({
    legacySecretDeviceId: '',
    /** @type {TelegramAuthResponse} */
    auth: undefined,
    userPortfolioNotificationMap: {},
});

export const getters = {
    isAuthorized(state) {
        return !!state.auth;
    },
    // proof for portfolio api that address has signed in to telegram
    authProof(state) {
        if (!state.auth) {
            return '';
        }
        return `id=${state.auth.user.telegramId}&hash=${state.auth.signed}`;
    },
    username(state) {
        if (!state.auth) {
            return '';
        } else {
            return state.auth.user.username || state.auth.user.telegramId;
        }
    },
};

export const mutations = {
    loadLegacySecretId(state) {
        // try restore saved id
        if (!state.legacySecretDeviceId) {
            try {
                state.legacySecretDeviceId = window.localStorage.getItem(LEGACY_TELEGRAM_SECRET_ID_STORAGE_KEY);
            } catch (e) {}
        }
    },
    initLegacySecretId(state) {
        // init new
        if (!state.legacySecretDeviceId) {
            state.legacySecretDeviceId = getUid();
            try {
                window.localStorage.setItem(LEGACY_TELEGRAM_SECRET_ID_STORAGE_KEY, state.legacySecretDeviceId);
            } catch (e) {}
        }
    },
    cleanLegacySecretId(state) {
        state.legacySecretDeviceId = '';
        try {
            window.localStorage.removeItem(LEGACY_TELEGRAM_SECRET_ID_STORAGE_KEY);
        } catch (e) {}
    },
    saveAuth(state, data) {
        state.auth = data;
    },
    setUserPortfolioNotificationList(state, data) {
        state.userPortfolioNotificationMap = Object.freeze(Object.fromEntries(data.map((id) => [id, true])));
    },
    addUserPortfolioNotification(state, id) {
        state.userPortfolioNotificationMap = Object.freeze({
            ...state.userPortfolioNotificationMap,
            [id]: true,
        });
    },
    removeUserPortfolioNotification(state, id) {
        const {[id]: idToDelete, ...newMap} = state.userPortfolioNotificationMap;
        state.userPortfolioNotificationMap = Object.freeze(newMap);
    },
};

export const actions = {
    fetchAuth({dispatch}) {
        if (IS_SUBAPP_MEGAGAMER) {
            return dispatch('fetchLegacyAuth');
        } else {
            return dispatch('fetchEcdsaAuth');
        }
    },
    /**
     * @return {Promise<TelegramAuthResponse|void>}
     */
    fetchEcdsaAuth({state, getters, commit, dispatch, rootGetters}) {
        if (!rootGetters.privateKey) {
            return Promise.reject(new Error('Minter user not logged in'));
        }
        if (getters.isAuthorized) {
            return Promise.resolve(state.auth);
        }
        /* legacy auth is disabled (for now it only implemented for IS_SUBAPP_MEGAGAMER)
        if (!state.legacySecretDeviceId) {
            commit('loadLegacySecretId');
        }
        const authPromise = state.legacySecretDeviceId
            ? dispatch('tryFetchAndSwitchLegacyAuth')
            : getAuth(rootGetters.privateKey);
        return authPromise
        */
        return getAuth(rootGetters.privateKey)
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
    fetchLegacyAuth({state, commit}) {
        if (!state.legacySecretDeviceId) {
            commit('loadLegacySecretId');
            commit('initLegacySecretId');
        }
        return getLegacyAuth(state.legacySecretDeviceId)
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
    tryFetchAndSwitchLegacyAuth({state, commit, rootGetters}) {
        return getLegacyAuth(state.legacySecretDeviceId)
            .catch((error) => {
                // if no legacy auth - clean
                if (error.response?.status === 404) {
                    commit('cleanLegacySecretId');
                }
                throw error;
            })
            .then((data) => {
                return Promise.all([data, switchLegacyAuth(state.legacySecretDeviceId, rootGetters.privateKey)]);
            })
            .then(([data]) => {
                // if switched from legacy auth - clean
                commit('cleanLegacySecretId');
                return data;
            });
    },
    fetchUserPortfolioNotificationList({commit, rootGetters}) {
        return getUserPortfolioNotificationList(rootGetters.privateKey)
            .then((data) => {
                commit('setUserPortfolioNotificationList', data);
                return data;
            });
    },
    reset({commit}) {
        commit('saveAuth', undefined);
        commit('setUserPortfolioNotificationList', []);
    },
};
