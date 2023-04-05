import axios from 'axios';
import {Cache, cacheAdapterEnhancer} from 'axios-extensions';
import {HUB_DEPOSIT_PROXY_API_URL, HUB_DEPOSIT_PROXY_ETHEREUM_CONTRACT_ADDRESS, HUB_DEPOSIT_PROXY_BSC_CONTRACT_ADDRESS, NATIVE_COIN_ADDRESS, HUB_CHAIN_BY_ID} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import preventConcurrencyAdapter from 'axios-prevent-concurrency';
import {buildTxForSwap as buildOneInchTx, prepareProtocolsCached} from '~/api/swap-1inch.js';
import {AbiEncoder, addApproveTx, getHubDestinationAddressBytes, getHubDestinationChainBytes} from '~/api/web3.js';
import hubProxyAbi from '~/assets/abi-hub-proxy.js';
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';

const HUB_DEPOSIT_PROXY_CONTRACT_ADDRESS_LIST = {
    1: HUB_DEPOSIT_PROXY_ETHEREUM_CONTRACT_ADDRESS,
    56: HUB_DEPOSIT_PROXY_BSC_CONTRACT_ADDRESS,
};


const adapter = (($ = getDefaultAdapter()) => {
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
 * @return {Promise<{toTokenAmount: string, txList: Array<OneInchTx>}>}
 */
export async function buildSwapWithApproveTxList(chainId, swapParams, {idPreventConcurrency} = {}) {
    const hubProxyContractAddress = HUB_DEPOSIT_PROXY_CONTRACT_ADDRESS_LIST[chainId];
    swapParams = {
        ...swapParams,
        destReceiver: hubProxyContractAddress,
        // HubDepositProxy contract can't handle native coin in output, so replace with wrapped
        toTokenAddress: swapParams.toTokenAddress === NATIVE_COIN_ADDRESS ? HUB_CHAIN_BY_ID[chainId].wrappedNativeContractAddress : swapParams.toTokenAddress,
    };

    return buildOneInchTx(chainId, swapParams, {idPreventConcurrency})
        .then(async (oneInchResponse) => {
            const refundTo = swapParams.refundTo || swapParams.destination;

            // reference https://github.com/MinterTeam/transaction-composer/blob/master/main.go

            const destinationChain = getHubDestinationChainBytes();
            const destination = getHubDestinationAddressBytes(swapParams.destination);

            let fromToken = oneInchResponse.fromToken.address.toLowerCase();
            let fromTokenAmount = oneInchResponse.fromTokenAmount;

            if (fromToken === NATIVE_COIN_ADDRESS) {
                fromToken = '0x0000000000000000000000000000000000000000';
                fromTokenAmount = 0;
            }

            const data = AbiEncoder(hubProxyAbi)('callAndTransferToChain',
                oneInchResponse.tx.to,
                oneInchResponse.tx.data,
                fromToken,
                fromTokenAmount,
                oneInchResponse.toToken.address,
                refundTo,
                destinationChain,
                destination,
                0,
            );

            const hubProxyTxParams = {
                from: oneInchResponse.tx.from,
                to: hubProxyContractAddress,
                data,
                value: oneInchResponse.tx.value,
                gasPrice: oneInchResponse.tx.gasPrice,
            };

            console.log("HubDepositProxy: Swap " + oneInchResponse.fromToken.symbol + " to " + oneInchResponse.toToken.symbol + " and send result to " + swapParams.destination + " in Minter");

            // @TODO maybe approve infinite
            const txList = await addApproveTx(oneInchResponse.fromToken.address, oneInchResponse.fromTokenAmount, hubProxyTxParams, {approveInfinite: false});

            return {
                toTokenAmount: oneInchResponse.toTokenAmount,
                txList,
            };
        });
}


/**
 * build tx to proxy contract which will swap on 1inch and deposit result to Minter via Hub
 * https://github.com/MinterTeam/transaction-composer
 * @param {number|string} chainId
 * @param {OneInchExchangeControllerGetSwapParams&{destination: string, refundTo?: string}} swapParams
 * @param {object} [axiosOptions]
 * @param {string} [axiosOptions.idPreventConcurrency]
 * @return {Promise<{toTokenAmount: string, txList: Array<OneInchTx>, steps: object}>}
 */
export async function buildTxForSwapWithComposer(chainId, swapParams, {idPreventConcurrency} = {}) {
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

export function buildTxForSwapDebug(chainId, swapParams, {idPreventConcurrency} = {}) {
    return Promise.all([
            buildSwapWithApproveTxList(chainId, swapParams, {idPreventConcurrency}),
            buildTxForSwapWithComposer(chainId, swapParams),
        ])
        .then((list) => {
            console.log(list[0]);
            console.log(list[1]);
            if (list[0].txList.at(-1).data !== list[1].txList.at(-1).data) {
                console.error('datas not equal');
                console.log(list[0].txList.at(-1).data);
                console.log(list[1].txList.at(-1).data);
            }
            return list[0];
        });
}
