import axios from 'axios';
import {Cache, cacheAdapterEnhancer} from 'axios-extensions';
import {ONE_INCH_API_URL, NETWORK, MAINNET} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import {fromErcDecimals} from '~/api/web3.js';

//@TODO exclude limit orders https://api.1inch.io/v5.0/56/liquidity-sources
const instance = axios.create({
    baseURL: ONE_INCH_API_URL,
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});
// addToCamelInterceptor(instance);

const fastCache = new Cache({ttl: 2 * 1000, max: 100});

/**
 * @param {number|string} chainId
 * @param {OneInchExchangeControllerGetSwapParams} swapParams
 * @return {Promise<OneInchTx>}
 */
export function buildTxForSwap(chainId, swapParams) {
    return instance.get(`${chainId}/swap`, {
        params: swapParams,
        cache: fastCache,
    })
        .then((response) => {
            return response.data.tx;
        });
}

/**
 * @param {number|string} chainId
 * @param {OneInchExchangeControllerGetQuoteParams} swapParams
 * @return {Promise<{estimatedGas: number, estimatedAmount: string}>}
 */
export function getQuoteForSwap(chainId, swapParams) {
    return instance.get(`${chainId}/quote`, {
            params: swapParams,
        })
        .then((response) => {
            /** @type {OneInchQuoteResponseDto} */
            const responseData = response.data;
            const estimatedAmount = fromErcDecimals(responseData.toTokenAmount, responseData.toToken.decimals);
            return {
                estimatedAmount,
                estimatedGas: responseData.estimatedGas,
            };
        });
}
