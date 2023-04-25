import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import MinterApi from "minter-js-sdk/src/api";
import PostTx from 'minter-js-sdk/src/api/post-tx';
import EstimateCoinSell from 'minter-js-sdk/src/api/estimate-coin-sell';
import EstimateCoinSellAll from 'minter-js-sdk/src/api/estimate-coin-sell-all.js';
import EstimateCoinBuy from 'minter-js-sdk/src/api/estimate-coin-buy';
import EstimateTxCommission, {FEE_PRECISION_SETTING} from 'minter-js-sdk/src/api/estimate-tx-commission.js';
import {ESTIMATE_SWAP_TYPE} from 'minter-js-sdk/src/variables.js';
import {ReplaceCoinSymbol, ReplaceCoinSymbolByPath} from 'minter-js-sdk/src/api/replace-coin.js';
import {GATE_API_URL, CHAIN_ID} from '~/assets/variables.js';
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';
import debounceAdapter from '~/assets/axios-debounce.js';
import {getSwapEstimate as explorerGetSwapEstimate} from '~/api/explorer.js';

const adapter = (($ = getDefaultAdapter()) => {
    $ = cacheAdapterEnhancer($, { enabledByDefault: false});
    $ = debounceAdapter($, {time: 500, leading: false});
    return $;
})();

const minterApi = new MinterApi({
    apiType: 'gate',
    baseURL: GATE_API_URL,
    chainId: CHAIN_ID,
    adapter,
});

export const postTx = PostTx(minterApi);

const estimateCache = new Cache({ttl: 5 * 1000, max: 100});
const _estimateCoinSell = (params, axiosOptions) => params.sellAll
    ? EstimateCoinSellAll(minterApi, {cache: estimateCache})(params, axiosOptions)
    : EstimateCoinSell(minterApi, {cache: estimateCache})(params, axiosOptions);
const _estimateCoinBuy = new EstimateCoinBuy(minterApi, {cache: estimateCache});
export function estimateCoinSell(params, axiosOptions) {
    // 0, '0', false, undefined
    if (!params.valueToSell || !Number(params.valueToSell)) {
        return Promise.reject(new Error('Value to sell not specified'));
    }
    if (params.findRoute && params.swapFrom !== ESTIMATE_SWAP_TYPE.BANCOR) {
        return explorerGetSwapEstimate(params.coinToSell, params.coinToBuy, {sellAmount: params.valueToSell, swapFrom: params.swapFrom}, {...axiosOptions, cache: estimateCache})
            .then((explorerEstimation) => {
                return Promise.all([
                    _estimateCoinSell({
                        ...params,
                        // remove first and last items, keep only intermediate items
                        route: explorerEstimation.coins?.map((coin) => coin.id).slice(1, -1),
                        swapFrom: explorerEstimation.swapType,
                    }, axiosOptions),
                    Promise.resolve(explorerEstimation.coins),
                ]);
            })
            .then(([estimateRouteData, route]) => {
                return {
                    ...estimateRouteData,
                    route,
                };
            });
    } else {
        return _estimateCoinSell(params, axiosOptions);
    }
}
export function estimateCoinBuy(params, axiosOptions) {
    // 0, '0', false, undefined
    if (!params.valueToBuy || !Number(params.valueToBuy)) {
        return Promise.reject(new Error('Value to buy not specified'));
    }
    if (params.findRoute && params.swapFrom !== ESTIMATE_SWAP_TYPE.BANCOR) {
        return explorerGetSwapEstimate(params.coinToSell, params.coinToBuy, {buyAmount: params.valueToBuy, swapFrom: params.swapFrom}, {...axiosOptions, cache: estimateCache})
            .then((explorerEstimation) => {
                return Promise.all([
                    _estimateCoinBuy({
                        ...params,
                        // remove first and last items, keep only intermediate items
                        route: explorerEstimation.coins?.map((coin) => coin.id).slice(1, -1),
                        swapFrom: explorerEstimation.swapType,
                    }, axiosOptions),
                    Promise.resolve(explorerEstimation.coins),
                ]);
            })
            .then(([estimateRouteData, route]) => {
                return {
                    ...estimateRouteData,
                    route,
                };
            });
    } else {
        return _estimateCoinBuy(params, axiosOptions);
    }
}

const coinCache = new Cache({ttl: 1 * 60 * 1000, max: 100});

export const estimateTxCommission = new EstimateTxCommission(minterApi, {cache: estimateCache}, {cache: coinCache});

export const estimateTxCommissionGasCoinOnly = (txParams) => {
    return estimateTxCommission({
        ...txParams,
        chainId: CHAIN_ID,
    }, {
        needGasCoinFee: FEE_PRECISION_SETTING.PRECISE,
        needBaseCoinFee: FEE_PRECISION_SETTING.OMIT,
        needPriceCoinFee: FEE_PRECISION_SETTING.OMIT,
    });
};

export const replaceCoinSymbol = ReplaceCoinSymbol(minterApi, {cache: coinCache});
export const replaceCoinSymbolByPath = ReplaceCoinSymbolByPath(minterApi, {cache: coinCache});

