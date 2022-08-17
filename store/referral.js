import {getRefId} from '~/api/referral.js';

export const state = () => ({
    refId: undefined,
    foreignRefId: undefined,
});

export const mutations = {
    reset(state) {
        state.refId = undefined;
    },
    setRefId(state, value) {
        state.refId = value;
    },
    setForeignRefId(state, value) {
        state.foreignRefId = value;
    },
};

export const actions = {
    fetchRefId({ state, commit, rootGetters }) {
        if (!rootGetters.isAuthorized) {
            return Promise.resolve(undefined);
        }
        if (typeof state.refId === 'undefined') {
            return getRefId(rootGetters.address)
                .then((refId) => {
                    commit('setRefId', refId);
                })
                .catch((error) => {
                    console.log(error);
                    commit('setRefId', false);
                })
                .then(() => {
                    return state.refId;
                });
        } else {
            return Promise.resolve(state.refId);
        }
    },

};
