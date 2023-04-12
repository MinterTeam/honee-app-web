import Big from '~/assets/big.js';

export default {
    ADD_AUTH_ADVANCED: (state, mnemonic) => {
        state.auth = mnemonic;
    },
    DELETE_ADVANCED_ADDRESS: (state, addressHash) => {
        state.auth = '';
    },
    LOGOUT: (state) => {
        state.auth = '';
        // clear data
        state.balance = [];
        state.transactionListInfo = {
            data: [],
            meta: {},
        };
    },
    SET_TRANSACTION_LIST: (state, txListInfo) => {
        state.transactionListInfo = txListInfo;
    },
    SET_BALANCE: (state, balanceList) => {
        state.balance = Object.freeze(balanceList) || [];
    },
    SET_BALANCE_TOTAL: (state, balanceData) => {
        state.totalBalanceSum = balanceData.totalBalanceSum;
        state.totalBalanceSumUsd = balanceData.totalBalanceSumUsd;
    },
    SET_BALANCE_TIMESTAMP: (state, timestamp) => {
        state.balanceTimestamp = timestamp;
    },
    SET_BALANCE_DISPLAY_TYPE: (state, balanceDisplayType) => {
        state.balanceDisplayType = balanceDisplayType;
    },
    // @TODO properly update bipAmount
    UPDATE_BALANCE: (state, changes) => {
        let newBalance = JSON.parse(JSON.stringify(state.balance));
        changes.deduct?.forEach((deductItem) => {
            const balanceItem = newBalance.find((balanceItem) => Number(balanceItem.coin.id) === Number(deductItem.coin.id));
            if (balanceItem) {
                balanceItem.amount = new Big(balanceItem.amount).minus(deductItem.amount).toString();
            } else {
                // @TODO probably caused by race between gate tx success and rtm balance update
                console.error("Can't deduct from not existent balance item", deductItem, state.balanceTimestamp, changes.tx);
            }
        });
        changes.add?.forEach((addItem) => {
            const balanceItem = newBalance.find((balanceItem) => Number(balanceItem.coin.id) === Number(addItem.coin.id));
            if (balanceItem) {
                balanceItem.amount = new Big(balanceItem.amount).plus(addItem.amount).toString();
            } else {
                newBalance.push(addItem);
            }
        });
        state.balance = newBalance;
    },
    SET_STAKE_LIST: (state, stakeList) => {
        state.stakeList = Object.freeze(stakeList);
    },
    SET_LIQUIDITY_LIST: (state, liquidityList) => {
        state.liquidityList = Object.freeze(liquidityList);
    },
    SET_VALIDATOR_META_LIST(state, validatorList) {
        state.validatorMetaList = Object.freeze(validatorList);
    },
    SET_AUTH_REDIRECT_PATH: (state, authRedirectPath) => {
        const cleanPath = authRedirectPath.replace(/^\/ru/, '').replace(/\?.*/, '');
        if (!cleanPath || cleanPath === '/') {
            state.authRedirectPath = '';
            return;
        }
        state.authRedirectPath = authRedirectPath;
    },
    PUSH_HISTORY: (state, historyItem) => {
        state.history.push(historyItem);
    },
    POP_HISTORY: (state) => {
        state.history.pop();
    },
    SET_ONLINE(state, onLine) {
        state.onLine = onLine;
    },
    /**
     * Show snackbar if it is inactive
     */
    SET_SNACKBAR_ACTIVE: (state) => {
        state.isSnackbarActive = true;
    },
    /**
     * Set snackbar inactive so it can react to next SET_SNACKBAR_ACTIVE call
     */
    SET_SNACKBAR_INACTIVE: (state) => {
        state.isSnackbarActive = false;
    },
    SET_METAGARDEN: (state, data = true) => {
        state.isMetagarden = data;
    },
};
