import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {PORTFOLIO_API_URL, NETWORK, MAINNET} from "~/assets/variables.js";
import {toSnake} from '~/assets/utils/snake-case.js';
import NotFoundError from '~/assets/utils/error-404.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import addEcdsaAuthInterceptor from '~/assets/axios-ecdsa-auth.js';


const instance = axios.create({
    baseURL: PORTFOLIO_API_URL,
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
    // timeout: 5,
});
addToCamelInterceptor(instance);
addEcdsaAuthInterceptor(instance);


/**
 * https://github.com/MinterTeam/honee-portfolio/blob/master/swagger.json
 * https://portfolio-api.honee.app/v1/docs
 */


/**
 * @param {UpdatePortfolio} portfolio
 * @param {string} privateKey
 * @return {Promise<Portfolio>}
 */
export function createPortfolio(portfolio, privateKey) {
    return instance.post('portfolio', portfolio, {
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => response.data);
}

/**
 * @param {number} id
 * @param {UpdatePortfolio} portfolio
 * @param {string} privateKey
 * @return {Promise<Portfolio>}
 */
export function updatePortfolio(id, portfolio, privateKey) {
    return instance.put(`portfolio/${id}`, portfolio, {
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => response.data);
}

/**
 * @return {Promise<Portfolio>}
 */
export function getPortfolio(id) {
    return instance.get(`portfolio/${id}`)
        .then((response) => response.data);
}

/**
 * @param {PaginationParams&{owner?: string, profitPeriod?: PORTFOLIO_PROFIT_PERIOD}} [params]
 * @return {Promise<PortfolioList>}
 */
export function getPortfolioList(params) {
    params.profitPeriod = params.profitPeriod || PORTFOLIO_PROFIT_PERIOD.AWP;
    return instance.get(`portfolio`, {
            params: toSnake(params),
        })
        .then((response) => response.data);
}

/**
 * @typedef {object} PaginationParams
 * @property {number} [page]
 * @property {number} [limit]
 */


/**
 * @param {'init'|'buy'|'sell'} type
 * @param {number} id - portfolio id
 * @param {string} address - isolated account
 * @param {string} privateKey - private key of the main account
 * @return {Promise<ConsumerPortfolio|void>}
 */
export function postConsumerPortfolio(type, id, address, privateKey) {
    return instance.post(`consumer/portfolio/${type}`, {
        id,
        isolatedAddress: address,
    }, {
        ecdsaAuth: {
            privateKey,
        },
    })
        .then((response) => response.data);
}

// consumer portfolio list can be cached, because we will update local state on init/buy/sell change manually
const consumerCache = new Cache({maxAge: 1 * 60 * 1000});

/**
 * @param {string} address
 * @return {Promise<ConsumerPortfolioList>}
 */
export function getConsumerPortfolioList(address) {
    return instance.get(`consumer/portfolio/${address}`, {
        cache: consumerCache,
    })
        .then((response) => response.data)
        .catch((error) => {
            if (error.response?.status === 404) {
                return {list: []};
            } else {
                throw error;
            }
        });

}

/**
 * @param {string} address
 * @param {number|string} id
 * @return {Promise<ConsumerPortfolio>}
 */
export function getConsumerPortfolio(address, id) {
    id = Number(id);
    return getConsumerPortfolioList(address)
        .then((result) => {
            const portfolio = result.list.find((item) => item.id === id);
            if (!portfolio) {
                return Promise.reject(new NotFoundError('Copied portfolio not found'));
            }
            return portfolio;
        });
}

const coinsCache = new Cache({maxAge: 5 * 60 * 1000});

/**
 * @return {Promise<Array<CoinItem>>}
 */
export function getCmcCoinList() {
    return instance.get('coins', {
            cache: coinsCache,
        })
        .then((response) => response.data.list.map((item) => {
            item.symbol = item.name;
            return item;
        }));
}


/**
 * @enum {string}
 */
export const PORTFOLIO_PROFIT_PERIOD = {
    // average weekly profit: average of last 4 full weeks (monday-sunday) (negative week bans metric)
    AWP: 'weekly',
    // average of last 7 days
    DAILY7: 'daily7',
};
