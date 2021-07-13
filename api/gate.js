import Big from 'big.js';
import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import MinterApi from "minter-js-sdk/src/api";
import PostTx from 'minter-js-sdk/src/api/post-tx';
// import GetCoinInfoById from 'minter-js-sdk/src/api/get-coin-info-by-id.js';
import EstimateCoinSell from 'minter-js-sdk/src/api/estimate-coin-sell';
import EstimateCoinSellAll from 'minter-js-sdk/src/api/estimate-coin-sell-all.js';
import EstimateCoinBuy from 'minter-js-sdk/src/api/estimate-coin-buy';
import EstimateTxCommission from 'minter-js-sdk/src/api/estimate-tx-commission.js';
import {ESTIMATE_SWAP_TYPE} from 'minter-js-sdk/src/variables.js';
import {ReplaceCoinSymbol, ReplaceCoinSymbolByPath} from 'minter-js-sdk/src/api/replace-coin.js';
import {GATE_API_URL, CHAIN_ID} from '~/assets/variables.js';
import {getSwapRoute} from '~/api/explorer.js';

const minterApi = new MinterApi({
    apiType: 'gate',
    baseURL: GATE_API_URL,
    chainId: CHAIN_ID,
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});

export const postTx = PostTx(minterApi);

const estimateCache = new Cache({maxAge: 10 * 1000});
const _estimateCoinSell = (params, axiosOptions) => params.sellAll
    ? EstimateCoinSellAll(minterApi)(params, {...axiosOptions, cache: estimateCache})
    : EstimateCoinSell(minterApi)(params, {...axiosOptions, cache: estimateCache});
const _estimateCoinBuy = (params, axiosOptions) => EstimateCoinBuy(minterApi)(params, {...axiosOptions, cache: estimateCache});
export function estimateCoinSell(params, axiosOptions) {
    // 0, '0', false, undefined
    if (!params.valueToSell || !Number(params.valueToSell)) {
        return Promise.reject(new Error('Value to sell not specified'));
    }
    if (params.findRoute && params.swapFrom !== ESTIMATE_SWAP_TYPE.BANCOR) {
        let estimateError;
        const estimatePromise = _estimateCoinSell(params, axiosOptions)
            .catch((error) => {
                estimateError = error;
            });
        const routePromise = getSwapRoute(params.coinToSell, params.coinToBuy, {sellAmount: params.valueToSell}, axiosOptions)
            // ignore route errors
            .catch((error) => {
                console.log(error);
            });
        return Promise.all([estimatePromise, routePromise])
            .then(([estimateData, routeData]) => {
                if (estimateError && !routeData) {
                    throw estimateError;
                }
                const isRouteOnly = routeData && estimateError;
                const isRouteBetter = estimateData && routeData && new Big(estimateData.will_get).lt(routeData.amountOut) && routeData.coins.length > 2;

                if (isRouteOnly || isRouteBetter) {
                    // swap by route is better
                    const idRoute = routeData.coins.map((coin) => coin.id);
                    // remove first and last items, keep only intermediate items
                    idRoute.pop();
                    idRoute.shift();
                    return Promise.all([
                            _estimateCoinSell({
                                ...params,
                                route: idRoute,
                                swapFrom: ESTIMATE_SWAP_TYPE.POOL,
                            }, axiosOptions),
                            Promise.resolve(routeData.coins),
                        ])
                        .then(([estimateRouteData, route]) => {
                            estimateRouteData = {
                                ...estimateRouteData,
                                route,
                            };
                            const isEstimateRouteBetter = estimateData && estimateRouteData && new Big(estimateData.will_get).lt(estimateRouteData.will_get);

                            if (isRouteOnly || isEstimateRouteBetter) {
                                return estimateRouteData;
                            } else {
                                // direct estimation may be better
                                return estimateData;
                            }
                        });
                }
                return estimateData;
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
        let estimateError;
        const estimatePromise = _estimateCoinBuy(params, axiosOptions)
            .catch((error) => {
                estimateError = error;
            });
        const routePromise = getSwapRoute(params.coinToSell, params.coinToBuy, {buyAmount: params.valueToBuy}, axiosOptions)
            // ignore route errors
            .catch((error) => {
                console.log(error);
            });
        return Promise.all([estimatePromise, routePromise])
            .then(([estimateData, routeData]) => {
                if (estimateError && !routeData) {
                    throw estimateError;
                }
                const isRouteOnly = routeData && estimateError;
                const isRouteBetter = estimateData && routeData && new Big(estimateData.will_pay).gt(routeData.amountIn) && routeData.coins.length > 2;

                if (isRouteOnly || isRouteBetter) {
                    const idRoute = routeData.coins.map((coin) => coin.id);
                    // remove first and last items, keep only intermediate items
                    idRoute.pop();
                    idRoute.shift();
                    return Promise.all([
                            _estimateCoinBuy({
                                ...params,
                                route: idRoute,
                                swapFrom: ESTIMATE_SWAP_TYPE.POOL,
                            }, axiosOptions),
                            Promise.resolve(routeData.coins),
                        ])
                        .then(([estimateRouteData, route]) => {
                            estimateRouteData = {
                                ...estimateRouteData,
                                route,
                            };
                            const isEstimateRouteBetter = estimateData && estimateRouteData && new Big(estimateData.will_pay).gt(estimateRouteData.will_pay);

                            if (isRouteOnly || isEstimateRouteBetter) {
                                return estimateRouteData;
                            } else {
                                // direct estimation may be better
                                return estimateData;
                            }
                        });
                }
                return estimateData;
            });
    } else {
        return _estimateCoinBuy(params, axiosOptions);
    }
}

export const estimateTxCommission = (params, axiosOptions) => EstimateTxCommission(minterApi)(params, {direct: false}, {...axiosOptions, cache: estimateCache});

export const replaceCoinSymbol = ReplaceCoinSymbol(minterApi);
export const replaceCoinSymbolByPath = ReplaceCoinSymbolByPath(minterApi);


