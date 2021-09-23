export default function() {
    return {
        auth: '',
        /** @type Array<BalanceItem> */
        balance: [],
        totalBalanceSum: '0',
        totalBalanceSumUsd: '0',
        balanceDisplayType: 0,
        lastUpdateTime: 9999999999999,
        /** @type Array<StakeItem> */
        stakeList: [],
        /** @type Array<ValidatorMeta> */
        validatorMetaList: [],
        // store only first page here
        transactionListInfo: {
            /** @type Array<Transaction> */
            data: [],
            meta: {},
        },
        history: [],
        authRedirectPath: '',
        onLine: true,
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

