import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {getBalance, getAddressStakeList, getAddressTransactionList, getCoinList, getValidatorMetaList} from "~/api/explorer.js";


export default {
    FETCH_TRANSACTION_LIST: ({ commit, dispatch, getters }, page = 1) => {
        // use only 1 address
        return getAddressTransactionList(getters.address, {
            page: page || 1,
        })
            .then((txListInfo) => {
                // commit only first page
                if (!(page > 2)) {
                    commit('SET_TRANSACTION_LIST', txListInfo);
                }
                // fetch avatars and usernames for addresses found in txs
                const addressListToFetch = txListInfo.data.reduce((accum, tx) => {
                    if (tx.type === Number(TX_TYPE.SEND)) {
                        if (tx.data.to === getters.address) {
                            accum.add(tx.from);
                        } else {
                            accum.add(tx.data.to);
                        }
                    }
                    return accum;
                }, new Set());
                return txListInfo;
            });
    },
    FETCH_BALANCE: ({ commit, getters }) => {
        // use only 1 address
        return getBalance(getters.address)
            .then((balanceResponse) => {
                commit('SET_BALANCE', balanceResponse.data.balances);
                commit('SET_BALANCE_TOTAL', balanceResponse.data);
                commit('SET_LAST_UPDATE_TIME', new Date(balanceResponse.latestBlockTime).getTime());
                return balanceResponse.data.balances;
            });
    },
    FETCH_STAKE_LIST: ({ commit, getters }) => {
        return getAddressStakeList(getters.address)
            .then((stakeList) => {
                commit('SET_STAKE_LIST', stakeList);
                return stakeList;
            });
    },
    FETCH_COIN_LIST: () => {
        return getCoinList();
    },
    FETCH_VALIDATOR_META_LIST({ commit }) {
        return getValidatorMetaList()
            .then((validatorList) => {
                commit('SET_VALIDATOR_META_LIST', validatorList);
                return validatorList;
            });
    },
};
