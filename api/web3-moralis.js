import MoralisCore, {CoreProvider} from '@moralisweb3/common-core';
import {ApiUtils} from '@moralisweb3/api-utils';
import { CommonEvmUtils, EvmChain, Erc20Value, EvmChainResolver } from '@moralisweb3/common-evm-utils';
// import MoralisEvmApi from '@moralisweb3/evm-api';
import MoralisEvmApi from '~/api/web3-moralis-evm-api.js';
import {getProviderByChain} from '~/api/web3.js';
import {NATIVE_COIN_ADDRESS, MORALIS_API_URL, MORALIS_API_KEY, HUB_CHAIN_BY_ID} from "~/assets/variables.js";


const core = MoralisCore.create();
// Register all imported modules to the @moralisweb3/core module
const commonEvmUtils = CommonEvmUtils.create(core);
const apiUtils = ApiUtils.create(core);
const evmApi = MoralisEvmApi.create(core, MORALIS_API_URL);
core.registerModules([commonEvmUtils, apiUtils, evmApi]);
// CoreProvider.setDefault(core);

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
 * #@return {Promise<import('@moralisweb3/common-evm-utils/lib/operations/token/getWalletTokenBalancesOperation').GetWalletTokenBalancesResponse>}
 * @return {Promise<Array<Erc20Value>>}
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

/**
 * @param {ChainId} chainId
 * @param {import('@moralisweb3/common-evm-utils').EvmAddressInput} address
 * @return {Promise<Erc20Value>}
 */
function getNativeBalanceAsErc20(chainId, address) {
    const web3Eth = getProviderByChain(chainId);
    return web3Eth.getBalance(address)
        .then((balance) => {
            const hubData = HUB_CHAIN_BY_ID[chainId];

            return Erc20Value.create(balance, {
                decimals: 18,
                token: {
                    decimals: 18,
                    name: hubData.coinSymbol,
                    symbol: hubData.coinSymbol,
                    contractAddress: NATIVE_COIN_ADDRESS,
                    logo: '',
                    thumbnail: '',
                    chain: EvmChainResolver.resolve(chainId, core),
                },
            }, core);
        });
}

/**
 *
 * @param {ChainId} chainId
 * @param {import('@moralisweb3/common-evm-utils').EvmAddressInput} address
 * @return {Promise<Array<Erc20Value>>}
 */
export function getWalletBalances(chainId, address) {
    return Promise.all([
        getWalletTokenBalances(chainId, address),
        getNativeBalanceAsErc20(chainId, address),
    ])
        .then(([balanceList, nativeBalance]) => {
            if (Number(nativeBalance.value) > 0) {
                return [].concat(nativeBalance, balanceList);
            } else {
                return balanceList;
            }
        });
}


