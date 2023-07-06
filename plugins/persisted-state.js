import createPersistedState from 'vuex-persistedstate';

export default ({store}) => {
    createPersistedState({
        paths: [
            'auth',
            'balanceDisplayType',
            'isMetagarden',
            // 'megachain.isCollectedWelcomeBonus',
        ],
    })(store);

    store.dispatch('megachain/fetchInitialState');
};
