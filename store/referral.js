import Cookies from 'js-cookie';
import {getReferralBonus, getRefId} from '~/api/referral.js';

const FOREIGN_REF_COOKIE_KEY = 'foreignRefId';

export const state = () => ({
    // ref to share
    refId: undefined,
    // ref to follow
    foreignRefId: undefined,
    referralBonus: 0,
});

export const mutations = {
    reset(state) {
        state.refId = undefined;
    },
    setRefId(state, value) {
        state.refId = value;
    },
    setReferralBonus(state, value) {
        state.referralBonus = value;
    },
    initForeignRefId(state, value) {
        if (value) {
            state.foreignRefId = value;

            // save to cookies
            const getExpiry = () => {
                const date = new Date();
                date.setDate(date.getDate() + 30);
                return date;
            };
            Cookies.set(FOREIGN_REF_COOKIE_KEY, value, {
                expires: getExpiry(),
                // keep last 2 domain parts (top level domain) and remove port
                domain: window.location.host.split('.').slice(-2).join('.').replace(/:\d+$/, ''),
                sameSite: 'Lax',
            });
        } else {
            state.foreignRefId = Cookies.get(FOREIGN_REF_COOKIE_KEY);
        }
    },
    clearForeignRefId(state) {
        state.foreignRefId = undefined;
        Cookies.remove(FOREIGN_REF_COOKIE_KEY);
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
                    if (error.response?.status !== 404) {
                        console.error(error);
                    }
                    commit('setRefId', false);
                })
                .then(() => {
                    return state.refId;
                });
        } else {
            return Promise.resolve(state.refId);
        }
    },
    fetchReferralBonus({state, commit}) {
        return getReferralBonus(state.refId)
            .then((bonus) => {
                commit('setReferralBonus', bonus);
            })
            .catch((error) => {
                console.log(error);
            });
    },
};
