import Vue from 'vue';
import {getTimeOffset} from '~/assets/time-offset.js';

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
        state.balance = balanceList || [];
    },
    SET_BALANCE_TOTAL: (state, balanceData) => {
        state.totalBalanceSum = balanceData.totalBalanceSum;
        state.totalBalanceSumUsd = balanceData.totalBalanceSumUsd;
    },
    SET_BALANCE_DISPLAY_TYPE: (state, balanceDisplayType) => {
        state.balanceDisplayType = balanceDisplayType;
    },
    SET_LAST_UPDATE_TIME: (state, timestamp) => {
        state.lastUpdateTime = timestamp - getTimeOffset();
    },
    SET_STAKE_LIST: (state, stakeList) => {
        state.stakeList = Object.freeze(stakeList);
    },
    SET_VALIDATOR_META_LIST(state, validatorList) {
        state.validatorMetaList = Object.freeze(validatorList);
    },
    SET_AUTH_REDIRECT_PATH: (state, authRedirectPath) => {
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
};
