import axios from 'axios';
// import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {HUB_DEPOSIT_PROXY_API_URL, HUB_DEPOSIT_PROXY_CONTRACT_ADDRESS, NETWORK, MAINNET} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';

const instance = axios.create({
    baseURL: HUB_DEPOSIT_PROXY_API_URL,
    // adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});
addToCamelInterceptor(instance);

// 10 min cache
// const cache = new Cache({ttl: 10 * 60 * 1000, max: 100});
/**
 * build tx to proxy contract which will swap on 1inch and deposit result to Minter via Hub
 * @param {number|string} chainId
 * @param {OneInchExchangeControllerGetSwapParams&{destination: string, refundTo?: string}} swapParams
 * @return {Promise<Partial<OneInchSwapResponseDto>>}
 */
export function buildTxForSwap(chainId, swapParams) {
    return instance.get(`new/swap`, {
        params: {
            // destReceiver: HUB_DEPOSIT_PROXY_CONTRACT_ADDRESS,
            ...swapParams,
            refundTo: swapParams.refundTo || swapParams.destination,
        },
    })
        .then((response) => {
            return {
                ...response.data,
                tx: response.data.steps[0].tx,
            };
        });
}
