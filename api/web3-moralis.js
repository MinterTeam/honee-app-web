import MoralisCore, {CoreProvider} from '@moralisweb3/common-core';
import {ApiUtils} from '@moralisweb3/api-utils';
import { CommonEvmUtils, EvmChain } from '@moralisweb3/common-evm-utils';
// import MoralisEvmApi from '@moralisweb3/evm-api';
import MoralisEvmApi from '~/api/web3-moralis-evm-api.js';
import {NATIVE_COIN_ADDRESS, MORALIS_API_URL, MORALIS_API_KEY} from "~/assets/variables.js";


const core = MoralisCore.create();
// Register all imported modules to the @moralisweb3/core module
const commonEvmUtils = CommonEvmUtils.create(core);
const apiUtils = ApiUtils.create(core);
const evmApi = MoralisEvmApi.create(core, MORALIS_API_URL);
core.registerModules([commonEvmUtils, apiUtils, evmApi]);
CoreProvider.setDefault(core);

core.start({
    apiKey: MORALIS_API_KEY,
    // ...and any other configuration
}).then(() => {
    // console.log('moralis started');
});

export const Moralis = {
    EvmUtils: commonEvmUtils,
    ApiUtils: apiUtils,
    EvmApi: evmApi,
};



/**
 * @param {import('@moralisweb3/common-evm-utils').EvmChainish} chainId
 * @param {import('@moralisweb3/common-evm-utils').EvmAddressish} address
 * #@return {Promise<import('@moralisweb3/common-evm-utils').GetWalletTokenBalancesResponseAdapter.result>}
 * #@return {Promise<Array<import('@moralisweb3/common-evm-utils/lib/operations/openapi').components.schemas.erc20TokenBalance>>}
 * @return {Promise<import('@moralisweb3/common-evm-utils/lib/operations/token/getWalletTokenBalancesOperation').GetWalletTokenBalancesResponse>}
 */
export function getWalletTokenBalances(chainId, address) {
    // const evmApi = core.getModule(MoralisEvmApi.moduleName);
    const evmApi = Moralis.EvmApi;
    return evmApi.token.getWalletTokenBalances({
        address,
        chain: chainId,
    })
        .then((response) => {
            return response?.result;
        });
}
