import createPersistedState from 'vuex-persistedstate';

export default ({store}) => {
    createPersistedState({
        paths: [
            'auth',
            'balanceDisplayType',
            'referral.foreignRefId',
        ],
    })(store);
};
