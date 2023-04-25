import Vue from 'vue';
import {getConsumerPortfolioList, getCmcCoinList} from '~/api/portfolio.js';
import NotFoundError from '~/assets/utils/error-404.js';
import {arrayToMap} from '~/assets/utils/collection.js';

/**
 // * @typedef {import('~/api/portfolio-models').ConsumerPortfolio} ConsumerPortfolio
 // * @typedef {import('~/api/portfolio-models').CoinItem} CoinItem
 // * @typedef {import('~/api/portfolio-models').ConsumerPortfolioList} ConsumerPortfolioList
 */

export const state = () => ({
    /** @type Array<ConsumerPortfolio> */
    consumerPortfolioList: [],
    /** @type {Array<CoinItem>}*/
    coinList: [],
    /** @type {Record.<string, CoinItem>} */
    coinMap: {},
});

export const getters = {
    consumerPortfolioMap(state) {
        return arrayToMap(state.consumerPortfolioList, 'id');
    },
    getCoinPrice(state) {
        return function(coinSymbol) {
            return state.coinMap[coinSymbol]?.price || 0;
        };
    },
};

export const mutations = {
    setConsumerPortfolioList(state, data) {
        state.consumerPortfolioList = data;
    },
    addConsumerPortfolio(state, portfolio) {
        const index = state.consumerPortfolioList.findIndex((item) => item.id === portfolio.id);
        if (index !== -1) {
            Vue.set(state.consumerPortfolioList, index, portfolio);
        } else {
            state.consumerPortfolioList.push(portfolio);
        }
    },
    removeConsumerPortfolio(state, portfolioId) {
        const index = state.consumerPortfolioList.findIndex((item) => item.id === portfolioId);
        if (index !== -1) {
            state.consumerPortfolioList.splice(index, 1);
        }
    },
    setCoinList(state, data) {
        state.coinList = Object.freeze(data);
        state.coinMap = Object.freeze(arrayToMap(data, 'symbol'));
    },
};

export const actions = {
    /**
     * @return {Promise<ConsumerPortfolioList>}
     */
    fetchConsumerPortfolioList({ commit, rootGetters }) {
        return getConsumerPortfolioList(rootGetters.address)
            .then((data) => {
                commit('setConsumerPortfolioList', data.list);
                return data;
            });
    },
    /**
     * @param {import('vuex').ActionContext} ctx
     * @param {number|string} id
     * @return {Promise<ConsumerPortfolio>}
     */
    fetchConsumerPortfolio({dispatch, getters}, id) {
        return dispatch('fetchConsumerPortfolioList')
            .then(() => {
                const portfolio = getters.consumerPortfolioMap[id];
                if (!portfolio) {
                    return Promise.reject(new NotFoundError('Copied portfolio not found'));
                }
                return portfolio;
            });
    },
    fetchCoinList({ commit }) {
        return getCmcCoinList()
            .then((data) => {
                commit('setCoinList', data);
                return data;
            });
    },
};
