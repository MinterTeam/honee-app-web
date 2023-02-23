import axios from 'axios';
import {Cache, cacheAdapterEnhancer} from 'axios-extensions';
import {HUB_DEPOSIT_PROXY_API_URL, HUB_DEPOSIT_PROXY_CONTRACT_ADDRESS, NATIVE_COIN_ADDRESS, HUB_CHAIN_BY_ID} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import preventConcurrencyAdapter from '~/assets/axios-prevent-concurrency.js';
import {prepareProtocolsCached} from '~/api/swap-1inch.js';


const adapter = (($ = axios.defaults.adapter) => {
    $ = cacheAdapterEnhancer($, { enabledByDefault: false});
    $ = preventConcurrencyAdapter($);
    return $;
})();

const instance = axios.create({
    baseURL: HUB_DEPOSIT_PROXY_API_URL,
    adapter,
});
addToCamelInterceptor(instance);

const fastCache = new Cache({ttl: 2 * 1000, max: 100});

/**
 * build tx to proxy contract which will swap on 1inch and deposit result to Minter via Hub
 * @param {number|string} chainId
 * @param {OneInchExchangeControllerGetSwapParams&{destination: string, refundTo?: string}} swapParams
 * @param {object} [axiosOptions]
 * @param {string} [axiosOptions.idPreventConcurrency]
 * @return {Promise<{toTokenAmount: string, txList: Array<OneInchTx>, steps: object}>}
 */
// @ts-expect-error @TODO https://github.com/microsoft/TypeScript/issues/50286
export async function buildTxForSwap(chainId, swapParams, {idPreventConcurrency} = {}) {
    const hubNetworkSlug = HUB_CHAIN_BY_ID[chainId].hubNetworkSlug;
    const protocols = await prepareProtocolsCached(chainId);
    swapParams = {
        ...swapParams,
        protocols,
    };
    return instance.get(`${hubNetworkSlug}/new/swap`, {
        params: {
            // destReceiver: HUB_DEPOSIT_PROXY_CONTRACT_ADDRESS,
            ...swapParams,
            // HubDepositProxy contract can't handle native coin in output, so replace with wrapped
            toTokenAddress: swapParams.toTokenAddress === NATIVE_COIN_ADDRESS ? HUB_CHAIN_BY_ID[chainId].wrappedNativeContractAddress : swapParams.toTokenAddress,
            refundTo: swapParams.refundTo || swapParams.destination,
        },
        cache: fastCache,
        idPreventConcurrency,
    })
        .then((response) => {
            return {
                ...response.data,
                txList: response.data.steps.map((item) => item.tx),
            };
        });
}
