import createPersistedState from 'vuex-persistedstate';

export default ({store}) => {
    createPersistedState({
        paths: [
            'auth',
            'balanceDisplayType',
            'referral.isActiveOffer',
            'referral.foreignRefId',
        ],
    })(store);
};
