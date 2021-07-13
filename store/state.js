export default function() {
    return {
        auth: '',
        /** @type Array<CoinItem> */
        balance: [],
        totalBalanceSum: '0',
        totalBalanceSumUsd: '0',
        balanceDisplayType: 0,
        lastUpdateTime: 9999999999999,
        delegation: {},
        // store only first page here
        transactionListInfo: {
            /** @type Array<Transaction> */
            data: [],
            meta: {},
        },
        history: [],
        authRedirectPath: '',
        isSnackbarActive: false,
    };
    // vuex-persistedstate enabled in nuxt.config.js
}




/**
 * @typedef {Object} Transaction
 * @property {string} name
 * @property {number} amount
 * @property {string} coin
 * @property {string} image
 * @property {string} timestamp
 */

