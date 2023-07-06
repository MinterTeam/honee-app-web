import {setStoredValue, getStoredValue} from '~/api/cloudflare-kv.js';


export const state = () => ({
    /** @type {boolean} */
    isCollectedWelcomeBonus: false,
});

export const getters = {
};

export const mutations = {
    setIsCollectedWelcomeBonus(state, data) {
        state.isCollectedWelcomeBonus = data;
    },
};

export const actions = {
    grabWelcomeBonus({ state, commit, rootGetters }) {
        commit('setIsCollectedWelcomeBonus', true);
        return setStoredValue(rootGetters.address, state);
    },
    /**
     * @param {import('vuex').ActionContext} ctx
     * @return {Promise}
     */
    fetchInitialState({getters, rootGetters, commit}) {
        return getStoredValue(rootGetters.address)
            .then((storedValue) => {
                if (storedValue.isCollectedWelcomeBonus) {
                    commit('setIsCollectedWelcomeBonus', true);
                }
            });
    },
};
