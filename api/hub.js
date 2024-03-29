import axios, {AxiosError} from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {TinyEmitter as Emitter} from 'tiny-emitter';
import stripZeros from 'pretty-num/src/strip-zeros.js';
import {isValidAddress as isValidMinterAddress} from 'minterjs-util';
import {isValidAddress as isValidEthAddress} from 'ethereumjs-util';
import {getCoinList, getTransaction as getMinterTransaction} from '~/api/explorer.js';
import Big from 'minterjs-util/src/big.js';
import {HUB_API_URL, HUB_TRANSFER_STATUS, HUB_CHAIN_ID, HUB_NETWORK, NETWORK, MAINNET, BASE_COIN, HUB_CHAIN_BY_ID, HUB_CHAIN_DATA, HUB_COIN_DATA, NATIVE_COIN_ADDRESS, HUB_BUY_STAGE as LOADING_STAGE} from "~/assets/variables.js";
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import {isHubTransferFinished} from '~/assets/utils.js';
import {createCancelableSignal} from '@shrpne/utils/src/cancelable-signal.js';

const instance = axios.create({
    baseURL: HUB_API_URL,
    adapter: cacheAdapterEnhancer(getDefaultAdapter(), { enabledByDefault: false}),
});
addToCamelInterceptor(instance);

const fastCache = new Cache({ttl: 5 * 1000, max: 100});

/**
 * Withdraw tx fee for destination network in dollars (e.g. fee to send bsc tx from hub to recipient)
 * @param {HUB_NETWORK} network
 * @return {Promise<QueryEthFeeResponse.AsObject>}
 */
export function getOracleFee(network) {
    return instance.get(`oracle/v1/${network}_fee`, {
            cache: fastCache,
        })
        .then((response) => {
            return response.data;
        });
}


/**
 * @return {Promise<Array<HubCoinItem>>}
 */
export function getOracleCoinList() {
    return Promise.all([_getOracleCoinListGroupedByMinter(), getCoinList({skipMeta: true})])
        .then(([oracleCoinList, minterCoinList]) => {
            oracleCoinList.forEach((oracleCoin) => {
                const minterCoin = minterCoinList.find((item) => item.id === Number(oracleCoin.minterId));

                if (minterCoin) {
                    oracleCoin.symbol = minterCoin.symbol;
                    oracleCoin.universalSymbol = getUniversalSymbol(oracleCoin);
                }
            });

            return oracleCoinList
                // filter out not existent coins
                .filter((item) => item.symbol)
                .sort((a, b) => {
                    // base coin goes first
                    if (a.symbol === BASE_COIN) {
                        return -1;
                    } else if (b.symbol === BASE_COIN) {
                        return 1;
                    }

                    // HUB goes second
                    if (a.symbol === 'HUB') {
                        return -1;
                    } else if (b.symbol === 'HUB') {
                        return 1;
                    }

                    return 0;
                });
        });
}

/**
 * @param {HubCoinItem} hubCoin
 * @return {string|*}
 */
function getUniversalSymbol(hubCoin) {
    if (hubCoin[HUB_CHAIN_ID.ETHEREUM]) {
        if (hubCoin[HUB_CHAIN_ID.ETHEREUM].denom === 'oneinch') {
            return '1INCH';
        }

        return hubCoin[HUB_CHAIN_ID.ETHEREUM].denom.toUpperCase();
    }

    if (hubCoin[HUB_CHAIN_ID.BSC]) {
        return hubCoin.symbol.replace(/BSC$/, '');
    }
}


// 1 min cache
const coinsCache = new Cache({ttl: 1 * 60 * 1000, max: 100});

/**
 * @return {Promise<TokenInfo.AsObject[]>}
 */
function _getOracleCoinList() {
    return instance.get('mhub2/v1/token_infos', {
            cache: coinsCache,
        })
        .then((response) => {
            return response.data.list.tokenInfos;
        });
}

/**
 * @return {Promise<Array<HubCoinItem>>}
 */
function _getOracleCoinListGroupedByMinter() {
    return _getOracleCoinList()
        .then((tokenList) => {
            tokenList = tokenList.map((item) => {
                if (typeof item.externalTokenId === 'string') {
                    item.externalTokenId = item.externalTokenId.toLowerCase();
                }
                return item;
            });
            const minterTokenList = tokenList.filter((token) => token.chainId === HUB_CHAIN_ID.MINTER);

            return minterTokenList
                .map((minterToken) => {
                    function findToken(denom, chainId) {
                        return tokenList.find((item) => item.denom === denom && item.chainId === chainId);
                    }

                    return {
                        minterId: Number(minterToken.externalTokenId),
                        ...minterToken,
                        ethereum: findToken(minterToken.denom, HUB_CHAIN_ID.ETHEREUM),
                        bsc: findToken(minterToken.denom, HUB_CHAIN_ID.BSC),
                    };
                });
        });
}

/**
 * @return {Promise<TokenInfo.AsObject[]>}
 */
export function getVerifiedMinterCoinList() {
    return _getOracleCoinList()
        .then((tokenList) => {
            return tokenList.filter((token) => token.chainId === HUB_CHAIN_ID.MINTER);
        });
}

/**
 * Prices of tokens in $
 * Or gasPrice in gwei
 * @return {Promise<Array<HubPriceItem>>}
 */
export function getOraclePriceList() {
    return instance.get('oracle/v1/prices', {
            cache: fastCache,
        })
        .then((response) => {
            return response.data.prices.list
                .map((item) => {
                    item.value = stripZeros(item.value);
                    return item;
                });
        });
}

/**
 * @param {string} address
 * @return {Promise<number|string>}
 */
export function getDiscountForHolder(address) {
    if (!isValidMinterAddress(address) && !isValidEthAddress(address)) {
        return Promise.resolve(0);
    }
    address = address.replace(/^Mx/, '').replace(/^0x/, '');
    return instance.get(`mhub2/v1/discount_for_holder/${address}`, {
            cache: fastCache,
        })
        .then((response) => {
            return response.data.discount;
        });
}

/**
 * @param {string} inputTxHash
 * @return {Promise<HubTransferStatus>}
 */
export function getTransferStatus(inputTxHash) {
    return instance.get(`mhub2/v1/transaction_status/${inputTxHash}`, {
            cache: fastCache,
        })
        .then((response) => {
            return response.data.status;
        });
}


// 1 day
const persistentCache = new Cache({ttl: 24 * 60 * 60 * 1000, max: 100});

/**
 * @param {string} inputTxHash
 * @return {Promise<HubTransferFee>}
 */
export function getTransferFee(inputTxHash) {
    return instance.get(`mhub2/v1/transaction_fee_record/${inputTxHash}`, {
            cache: persistentCache,
        })
        .then((response) => {
            if (!response.data.record) {
                response.status = 404;
                response.statusText = 'Not found';
                response.request = {
                    ...response.request,
                    status: 404,
                    statusText: 'Not found',
                };
                throw new AxiosError(
                    'Request failed with status code ' + response.status,
                    AxiosError.ERR_BAD_REQUEST,
                    response.config,
                    response.request,
                    response,
                );
            }

            return {
                valCommission: new Big(response.data.record.valCommission).div(1e18).toString(),
                externalFee: new Big(response.data.record.externalFee).div(1e18).toString(),
            };
        });
}

/**
 *
 * @param {string} hash
 * @param {number|string} [timestamp]
 * @return {[promiseWithEmitter: Promise<HubTransferStatus> & {on: TinyEmitter.on, once: TinyEmitter.once}, unsubscribe: function(): void, ]}
 */
export function subscribeTransfer(hash, timestamp) {
    if (!hash) {
        throw new Error('Tx hash not specified');
    }
    const signal = createCancelableSignal();
    let lastStatus;
    const emitter = new Emitter();

    const statusPromise = pollMinterTxStatus(hash)
        .then((transfer) => {
            emitter.emit('finished', transfer);
            return transfer;
        });

    // proxy `.on` and `.once`
    proxyEmitter(statusPromise, emitter);

    return [
        statusPromise,
        function() {
            // unsubscribe from all events and disable polling
            emitter.off('update');
            emitter.off('finished');
            signal.cancel();
        },
    ];


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
    }

    function pollMinterTxStatus(hash) {
        // reject
        if (signal.isCanceled) {
            throw new Error('unsubscribed');
        }
        return getTransferStatus(hash)
            .catch((error) => {
                console.log(error);
            })
            .then((transfer) => {
                // reject
                if (signal.isCanceled) {
                    throw new Error('unsubscribed');
                }

                // no transfer when error
                if (transfer) {
                    const txDate = timestamp ? new Date(timestamp) : new Date();
                    const isLong = Date.now() - txDate.getTime() > 10 * 60 * 1000;
                    if (isLong && transfer.status === HUB_TRANSFER_STATUS.not_found) {
                        transfer = {
                            ...transfer,
                            status: HUB_TRANSFER_STATUS.not_found_long,
                        };
                    }

                    if (lastStatus !== transfer.status) {
                        lastStatus = transfer.status;
                        emitter.emit('update', transfer);
                    }

                    if (isHubTransferFinished(transfer.status)) {
                        return transfer;
                    }
                }

                return wait(10000).then(() => pollMinterTxStatus(hash));
            });
    }
}

/**
 * @param {string} txHash
 * @param {string} destinationMinterAddress
 * @param {string} destinationTokenSymbol
 * @return {[promise: Promise<{tx: Transaction, outputAmount: number|string}>, canceler: function(): void]}
 */
export function waitHubTransferToMinter(txHash, destinationMinterAddress, destinationTokenSymbol) {
    const [promiseWithEmitter, canceler] = subscribeTransfer(txHash);
    const promise = promiseWithEmitter
        .then((transfer) => {
            if (transfer.status !== HUB_TRANSFER_STATUS.batch_executed) {
                throw new Error(`Unsuccessful bridge transfer: ${transfer.status}`);
            }
            console.log('transfer', transfer);
            return getMinterTransaction(transfer.outTxHash);
        })
        .then((minterTx) => {
            console.log('minterTx', minterTx);

            if (!minterTx.data.list) {
                throw new Error('Minter tx transfer has invalid data');
            }
            const multisendItem = minterTx.data.list.find((item) => item.to === destinationMinterAddress && item.coin.symbol === destinationTokenSymbol);
            if (!multisendItem) {
                throw new Error(`Minter tx transfer does not include ${destinationTokenSymbol} deposit to the current user`);
            }

            return {
                outputAmount: multisendItem.value,
                tx: minterTx,
            };
        });

    return [promise, canceler];
}

/**
 * @param {Array<HubCoinItem>} hubCoinList
 * @param {string} tokenSymbol
 * @return {HubCoinItem|undefined}
 */
export function findHubCoinItem(hubCoinList, tokenSymbol) {
    tokenSymbol = tokenSymbol?.toUpperCase();
    return hubCoinList.find((item) => item.symbol === tokenSymbol);
}

/**
 * @param {Array<HubCoinItem>} hubCoinList
 * @param {string} tokenContractAddress
 * @param {ChainId} chainId
 * @param {boolean} [isAcceptNative]
 * @return {HubCoinItem|undefined}
 */
export function findHubCoinItemByTokenAddress(hubCoinList, tokenContractAddress, chainId, isAcceptNative) {
    if (!tokenContractAddress || !HUB_CHAIN_BY_ID[chainId]) {
        return undefined;
    }

    tokenContractAddress = tokenContractAddress?.toLowerCase();
    if (isAcceptNative && tokenContractAddress === NATIVE_COIN_ADDRESS) {
        // cast native address 'eeee..' to wrapped address
        tokenContractAddress = HUB_CHAIN_BY_ID[chainId].wrappedNativeContractAddress;
    }

    const hubNetworkSlug = HUB_CHAIN_BY_ID[chainId].hubNetworkSlug;
    return hubCoinList.find((item) => item[hubNetworkSlug]?.externalTokenId === tokenContractAddress);
}

/**
 * @param {Array<HubCoinItem>} hubCoinList
 * @param {string} tokenSymbol
 * @param {number} chainId
 * @return {TokenInfo.AsObject}
 */
export function findTokenInfo(hubCoinList, tokenSymbol, chainId) {
    const coinItem = findHubCoinItem(hubCoinList, tokenSymbol);
    return coinItem?.[HUB_CHAIN_BY_ID[chainId]?.hubNetworkSlug];
}

export function findNativeCoin(hubCoinList, network) {
    const contractAddress = HUB_CHAIN_DATA[network]?.wrappedNativeContractAddress.toLowerCase();
    return hubCoinList.find((item) => item[network]?.externalTokenId.toLowerCase() === contractAddress);
}

export function getTokenSymbolForNetwork(mainnetTokenSymbol) {
    return NETWORK === MAINNET ? mainnetTokenSymbol : HUB_COIN_DATA[mainnetTokenSymbol].testnetSymbol;
}

function wait(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

/**
 * @typedef {object} HubCoinItemMinterExtra
 * @property {string} symbol - minter symbol
 * @property {string} minterId
 */
/**
 * @typedef {TokenInfo.AsObject & HubCoinItemMinterExtra & {ethereum: TokenInfo.AsObject, bsc: TokenInfo.AsObject}} HubCoinItem
 */

/**
 * @typedef {object} HubPriceItem
 * @property {string} name
 * @property {number|string} value
 */

/**
 * @typedef {object} HubTransferStatus
 * @property {HUB_TRANSFER_STATUS} status
 * @property {string} inTxHash
 * @property {string} outTxHash
 */

/**
 * @typedef {object} HubTransferFee
 * @property {number|string} externalFee
 * @property {number|string} valCommission
 */
