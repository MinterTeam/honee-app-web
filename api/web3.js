import Eth from 'web3-eth';
import {TinyEmitter as Emitter} from 'tiny-emitter';
import {web3Eth, web3EthEth, web3EthBsc, getTokenDecimals as _getTokenDecimals, getBlockNumber, getWrappedNativeContractAddress, fixNativeContractAddress} from 'minter-js-web3-sdk/src/web3.js';
import {wait} from '@shrpne/utils/src/wait.js';
import {NATIVE_COIN_ADDRESS, HUB_NETWORK_SLUG, HUB_CHAIN_DATA, HUB_CHAIN_BY_ID} from '~/assets/variables.js';


export const CONFIRMATION_COUNT = 5;


const transactionPollingInterval = 5000;
[web3Eth, web3EthEth, web3EthBsc]
    .forEach((eth) => eth.transactionPollingInterval = transactionPollingInterval);


/**
 * @typedef {import('web3-core/types/index').Transaction & import('web3-core/types/index').TransactionReceipt & {confirmations: number, timestamp: number}} Web3Tx
 */

/**
 * @template {any} T
 * @typedef {Promise<T>} PromiseWithEmitter
 * @implements {Promise}
 * @property {Function} on
 * @property {Function} once
 * @property {Function} unsubscribe
 */

/**
 * @param {string} hash
 * @param {object} options
 * @param {number} [options.confirmationCount = CONFIRMATION_COUNT]
 * @param {number} [options.chainId]
 * @param {boolean} [options.needReceipt=true]
 * @param {boolean} [options.needExactConfirmationCount]
 * @param {boolean} [options.needExactTimestamp=true]
 * @return {PromiseWithEmitter<Web3Tx>}
 */
export function subscribeTransaction(hash, {
    confirmationCount = CONFIRMATION_COUNT,
    chainId,
    needReceipt = true,
    needExactConfirmationCount = CONFIRMATION_COUNT > 1,
    needExactTimestamp = true,
} = {}) {
    let isUnsubscribed = false;
    const emitter = new Emitter();
    let txPromise;
    try {
        const providerHost = getProviderHostByChain(chainId);
        if (providerHost) {
            // keep provider for this tx, because later it can be changed
            const ethSaved = new Eth(providerHost);
            txPromise = _subscribeTransaction(hash, {
                confirmationCount,
                ethProvider: ethSaved,
                emitter,
                needReceipt,
                needExactConfirmationCount,
                needExactTimestamp,
            });
        } else {
            txPromise = Promise.reject(new Error(`Can't subscribe to tx, chainId ${chainId} is not supported`));
        }
    } catch (error) {
        txPromise = Promise.reject(error);
    }

    // proxy `.on` and `.once`
    proxyEmitter(txPromise, emitter);

    // unsubscribe from all events and disable polling
    txPromise.unsubscribe = function() {
        isUnsubscribed = true;
        emitter.off('tx');
        emitter.off('confirmation');
        emitter.off('confirmed');
    };

    return txPromise;

    /**
     * @template T
     * @param {Promise<T>} target
     * @param {import('tiny-emitter').TinyEmitter} emitter
     * @return {PromiseWithEmitter<T>}
     */
    function proxyEmitter(target, emitter) {
        target.on = function() {
            emitter.on(...arguments);
            return target;
        };
        target.once = function() {
            emitter.once(...arguments);
            return target;
        };
        // target.off = function () {
        //     emitter.off(...arguments);
        //     return target;
        // }
        return target;
    }
}

/**
 *
 * @param {string} hash
 * @param {object} options
 * @param {number} options.confirmationCount
 * @param {Eth} options.ethProvider
 * @param {Emitter} options.emitter
 * @param {boolean} [options.needReceipt]
 * @param {boolean} [options.needExactConfirmationCount]
 * @param {boolean} [options.needExactTimestamp]
 * @return {Promise<Web3Tx>}
 * @private
 */
function _subscribeTransaction(hash, {confirmationCount, ethProvider, emitter, needReceipt, needExactConfirmationCount, needExactTimestamp}) {
    let isUnsubscribed = false;

    return waitTxInBlock(hash)
        .then((tx) => {
            return Promise.all([
                needReceipt ? ethProvider.getTransactionReceipt(hash) : Promise.resolve(),
                needExactTimestamp ? ethProvider.getBlock(tx.blockNumber) : Promise.resolve(),
                needExactConfirmationCount ? getConfirmations(tx) : Promise.resolve(1),
                Promise.resolve(tx),
            ]);
        })
        .then(([receipt, block, confirmations, txData]) => {
            // console.debug({receipt, block, confirmations, txData});
            const tx = {
                // input, hash from tx
                ...txData,
                // logs, status, gasUsed from receipt
                ...receipt,
                confirmations,
                timestamp: needExactTimestamp ? block.timestamp * 1000 : Date.now(),
            };
            emitter.emit('confirmation', tx);

            // status only available of receipt was requested
            if (needReceipt && !tx.status) {
                throw new Error('Transaction failed');
            }

            if (confirmations >= confirmationCount || !needExactConfirmationCount) {
                return tx;
            } else {
                return waitConfirmations(tx);
            }
        })
        .then((tx) => {
            emitter.emit('confirmed', tx);
            return tx;
        });

    function waitTxInBlock(hash) {
        return ethProvider.getTransaction(hash)
            .then((tx) => {
                // reject
                if (isUnsubscribed) {
                    throw new Error('unsubscribed');
                }

                if (tx) {
                    emitter.emit('tx', tx);
                }

                if (tx && tx.blockHash) {
                    return tx;
                } else {
                    return wait(10000).then(() => waitTxInBlock(hash));
                }
            });
    }

    function waitConfirmations(tx) {
        return wait(10000)
            .then(() => getConfirmations(tx))
            .then((confirmations) => {
                // reject
                if (isUnsubscribed) {
                    throw new Error('unsubscribed');
                }

                tx = {
                    ...tx,
                    confirmations,
                };
                emitter.emit('confirmation', tx);

                if (confirmations >= confirmationCount) {
                    return tx;
                } else {
                    return waitConfirmations(tx);
                }
            });
    }

    function getConfirmations(tx) {
        return getBlockNumber(ethProvider)
            .then((currentBlock) => {
                return currentBlock - tx.blockNumber + 1;
            });
    }
}


/**
 * @param {string} tokenContractAddress
 * @param {number} chainId
 * @param {Array<HubCoinItem>} [hubCoinList]
 * @return {Promise<number>}
 */
export function getTokenDecimals(tokenContractAddress, chainId, hubCoinList = []) {
    function findFromHubCoinList(tokenContractAddress, chainId) {
        const coinItem = getExternalCoinList(hubCoinList, chainId)
            .find((item) => item.externalTokenId === tokenContractAddress);
        if (coinItem) {
            return Number(coinItem.externalDecimals);
        }
    }

    return _getTokenDecimals(tokenContractAddress, chainId, findFromHubCoinList);
}

/**
 * @typedef {object} EvmTxParams
 * @property {string} to
 * @property {string|number} value
 * @property {string} data
 */


/**
 *
 * @param {Array<HubCoinItem>} hubCoinList
 * @param {ChainId} chainId
 * @return {Array<TokenInfo.AsObject>}
 */
export function getExternalCoinList(hubCoinList, chainId) {
    let externalNetworks = Object.values(HUB_NETWORK_SLUG);
    if (chainId) {
        externalNetworks = externalNetworks.filter((network) => network === getHubNetworkByChain(chainId));
    }
    return hubCoinList
        .map((item) => {
            // extract external token infos by network key
            /** @type {Array<TokenInfo.AsObject>}*/
            const externalTokens = externalNetworks.map((network) => item[network]);
            return externalTokens;
        })
        .flat()
        .filter((item) => !!item);
}

/**
 * @param {ChainId} chainId
 * @return {string}
 */
function getProviderHostByChain(chainId) {
    validateChainId(chainId);
    if (!chainId) {
        console.warn('Usage without chainId is deprecated');
        return web3Eth.currentProvider.host;
    }

    return HUB_CHAIN_DATA[getHubNetworkByChain(chainId)]?.apiUrl;
}

/**
 * @param {ChainId} chainId
 * @return {HUB_NETWORK_SLUG}
 */
export function getHubNetworkByChain(chainId) {
    validateChainId(chainId);
    return HUB_CHAIN_BY_ID[chainId]?.hubNetworkSlug;
}

/**
 * @param {HUB_NETWORK_SLUG} network
 * @return {ChainId}
 */
export function getChainIdByHubNetwork(network) {
    return HUB_CHAIN_DATA[network].chainId;
}


function validateChainId(chainId) {
    if (chainId && typeof chainId !== 'number') {
        throw new Error(`chainId should be a number`);
    }
}


/**
 * @param {ChainId} chainId
 * @param {string} tokenContractAddress
 */
export function fixWrappedNativeContractAddress(chainId, tokenContractAddress) {
    tokenContractAddress = tokenContractAddress?.toLowerCase();
    const isWrappedNativeToken = tokenContractAddress === getWrappedNativeContractAddress(chainId);

    if (isWrappedNativeToken) {
        return NATIVE_COIN_ADDRESS;
    } else {
        return fixNativeContractAddress(chainId, tokenContractAddress);
    }
}

