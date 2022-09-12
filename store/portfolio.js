import Vue from 'vue';
import {getConsumerPortfolioList} from '~/api/portfolio.js';
import NotFoundError from '~/assets/utils/error-404.js';
import {arrayToMap} from '~/assets/utils/collection.js';

export const state = () => ({
    /** @type Array<ConsumerPortfolio> */
    consumerPortfolioList: [],
});

export const getters = {
    consumerPortfolioMap(state) {
        return arrayToMap(state.consumerPortfolioList, 'id');
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
     * @param {import('vuex').ActionContext}
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
};
