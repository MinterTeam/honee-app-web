import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {PORTFOLIO_API_URL, NETWORK, MAINNET} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import addEcdsaAuthInterceptor from '~/assets/axios-ecdsa-auth.js';


const instance = axios.create({
    baseURL: PORTFOLIO_API_URL,
    // adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
    // timeout: 5,
});
addToCamelInterceptor(instance);
addEcdsaAuthInterceptor(instance);


/**
 * https://app.swaggerhub.com/apis/KLIM0VSERGEY/honee_portfolio
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
