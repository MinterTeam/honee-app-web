/**
 // * @typedef {import('~/api/explorer').BalanceItem} BalanceItem
 // * @typedef {import('~/api/explorer.js').StakeItem} StakeItem
 // * @typedef {import('~/api/explorer.js').PoolProvider} PoolProvider
 // * @typedef {import('~/api/explorer.js').ValidatorMeta} ValidatorMeta
 */

export default function() {
    return {
        auth: '',
        /** @type Array<BalanceItem> */
        balance: [],
        totalBalanceSum: '0',
        totalBalanceSumUsd: '0',
        balanceTimestamp: 0,
        balanceDisplayType: 0,
        /** @type Array<StakeItem> */
        stakeList: [],
        /** @type Array<PoolProvider> */
        liquidityList: [],
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
 * @typedef {object} Transaction
 * @property {string} name
 * @property {number} amount
 * @property {string} coin
 * @property {string} image
 * @property {string} timestamp
 */

