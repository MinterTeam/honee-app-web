import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import stripZeros from 'pretty-num/src/strip-zeros.js';
import {convertToPip} from 'minterjs-util';
import coinBlockList from 'minter-coin-block-list';
import {wait} from '@shrpne/utils/src/wait.js';
import {getVerifiedMinterCoinList} from '~/api/hub.js';
import {getCoinIconList as getChainikIconList} from '~/api/chainik.js';
import {BASE_COIN, EXPLORER_API_URL, TX_STATUS} from '~/assets/variables.js';
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import {addTimeInterceptor} from '~/assets/axios-time-offset.js';
import preventConcurrencyAdapter from 'axios-prevent-concurrency';
import debounceAdapter from '~/assets/axios-debounce.js';


const coinBlockMap = Object.fromEntries(coinBlockList.map((symbol) => [symbol, true]));
function isBlocked(symbol) {
    return !!coinBlockMap[symbol.replace(/-\d+$/, '')];
}


function save404Adapter(adapter) {
    return async function(config) {
        try {
            return await adapter(config);
        } catch (error) {
            if (error.response?.status === 404) {
                return {savedError: error};
            }

            throw error;
        }
    };
}

function restoreErrorAdapter(adapter) {
    return async function(config) {
        const result = await adapter(config);
        if (result.savedError) {
            throw result.savedError;
        }
        return result;
    };
}

const adapter = (($ = getDefaultAdapter()) => {
    $ = save404Adapter($);
    $ = cacheAdapterEnhancer($, { enabledByDefault: false});
    $ = restoreErrorAdapter($);
    // $ = debounceAdapter($, {time: 700, leading: false});
    $ = preventConcurrencyAdapter($);
    return $;
})();

const instance = axios.create({
    baseURL: EXPLORER_API_URL,
    adapter,
});
addToCamelInterceptor(instance);
addTimeInterceptor(instance);

const explorer = instance;


/**
 * @typedef {object} Status
 * @property {number} marketCap - in $
 * @property {number} bipPriceUsd
 * @property {number} bipPriceChange - in %
 * @property {number} latestBlockHeight - block count
 * @property {string} latestBlockTime
 * @property {number} avgBlockTime - in seconds
 * @property {number} totalTransactions - tx count
 * @property {number} transactionsPerSecond - tps
 */

const statusCache = new Cache({ttl: 5 * 1000, max: 100});

/**
 * @return {Promise<Status>}
 */
export function getStatus() {
    return explorer.get('status', {cache: statusCache})
        .then((response) => response.data.data);
}

/**
 * @typedef {object} BlockListInfo
 * @property {Array<Block>} data
 * @property {PaginationMeta} meta
 */

/**
 * @param {object} [params]
 * @param {number|string} [params.page]
 * @param {number|string} [params.limit]
 * @return {Promise<BlockListInfo>}
 */
export function getBlockList(params) {
    return explorer.get('blocks', {
            params,
        })
        .then((response) => response.data);
}

/**
 * @param {number|'latest'} height
 * @param {number|boolean} [validateExpiry] - validate if 'latest' block is expired
 * @return {Promise<Block>}
 */
export function getBlock(height, validateExpiry = 120000) {
    if (height === 'latest') {
        return getBlockList({limit: 1}).then((blockList) => {
            const block = blockList.data[0];
            const isValidate = typeof validateExpiry === 'number' && validateExpiry > 0;
            if (isValidate && Date.now() - new Date(block.timestamp).getTime() > validateExpiry) {
                throw new Error('Can\'t get latest block. Explorer state expired');
            }
            return block;
        });
    }
    return explorer.get(`blocks/${height}`)
        .then((response) => response.data.data);
}

/**
 * @param {string} hash
 * @return {Promise<Transaction>}
 */
export function getTransaction(hash) {
    return explorer.get('transactions/' + hash)
        .then((response) => {
            const tx = response.data.data;
            if (!tx.data) {
                tx.data = {};
            }
            if (response.status === 200) {
                tx.status = TX_STATUS.SUCCESS;
            }
            if (response.status === 206) {
                tx.status = TX_STATUS.FAILURE;
            }

            return tx;
        });
}

/**
 * @param {string} address
 * @return {Promise<{data: BalanceData, latestBlockTime: string}>}
 */
export async function getBalance(address) {
    const response = await explorer.get('addresses/' + address + '?with_sum=true');

    const bipBalance = response.data.data.balances.find((item) => item.coin.symbol === BASE_COIN);
    const beeBalance = response.data.data.balances.find((item) => item.coin.symbol === 'BEE');
    if (bipBalance && Number(bipBalance.amount) === 0) {
        if (!beeBalance) {
            // replace empty BIP with BEE
            bipBalance.coin = {
                symbol: 'BEE',
                id: 2361,
                type: 'token',
            };
        } else {
            // remove empty BIP
            response.data.data.balances = response.data.data.balances.filter((item) => item.coin.symbol !== BASE_COIN);
        }
    }

    response.data.data.balances = await prepareBalance(response.data.data.balances);
    return response.data;
}

/**
 * @typedef {object} BalanceData
 * @property {string} totalBalanceSum
 * @property {string} totalBalanceSumUsd
 * @property {Array<BalanceItem>} balances
 */

/**
 * @typedef {object} BalanceItem
 * @property {number|string} amount
 * @property {number|string} bipAmount
 * @property {Coin} coin
 */


/**
 * @param {Array<BalanceItem>} balanceList
 * @return {Promise<Array<BalanceItem>>}
 */
export async function prepareBalance(balanceList) {
    balanceList = await markVerified(Promise.resolve(balanceList));

    return balanceList.sort((a, b) => {
            // BEE goes first
            if (a.coin.symbol === 'BEE') {
                return -1;
            } else if (b.coin.symbol === 'BEE') {
                return 1;
            }
            // base coin goes first
            if (a.coin.symbol === BASE_COIN) {
                return -1;
            } else if (b.coin.symbol === BASE_COIN) {
                return 1;
            }

            // verified coins go second
            if (a.coin.verified && !b.coin.verified) {
                return -1;
            } else if (b.coin.verified && !a.coin.verified) {
                return 1;
            }

            return +b.bipAmount - +a.bipAmount;

            // sort coins by name, instead of reserve
            // return a.coin.symbol.localeCompare(b.coin.symbol);
        })
        .map((coinItem) => {
            return {
                ...coinItem,
                amount: stripZeros(coinItem.amount),
            };
        });
}

/**
 * @template {Coin|BalanceItem} T
 * @param {Promise<Array<T>>} coinListPromise
 * @return {Promise<Array<T>>}
 */
function markVerified(coinListPromise) {
    const verifiedMinterCoinListPromise = getVerifiedMinterCoinList()
        .catch((error) => {
            console.log(error);
            return [];
        });

    return Promise.all([coinListPromise, verifiedMinterCoinListPromise])
        .then(([coinList, verifiedMinterCoinList]) => {
            let verifiedMap = {};
            verifiedMinterCoinList.forEach((item) => {
                verifiedMap[Number(item.externalTokenId)] = true;
            });

            return coinList.map((coinItem) => {
                /** @type {Coin}*/
                const coinItemData = 'coin' in coinItem ? coinItem.coin : coinItem;
                let verified = false;
                if (verifiedMap[coinItemData.id]) {
                    verified = true;
                }
                if (coinItemData.symbol === BASE_COIN || coinItemData.symbol === 'MUSD') {
                    verified = true;
                }
                coinItemData.verified = verified;
                return coinItem;
            });
        });
}

/**
 * @param {string} address
 * @param {object} [params]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @return {Promise<TransactionListInfo>}
 */
export function getAddressTransactionList(address, params) {
    return explorer.get(`addresses/${address}/transactions`, {params})
        .then((response) => response.data);
}

/**
 * @param {string} address
 * @return {Promise<Array<StakeItem>>}
 */
export function getAddressStakeList(address) {
    return explorer.get(`addresses/${address}/delegations`, {params: {limit: 999}})
        .then((response) => response.data.data);
}



/**
 * @return {Promise<Array<Validator>>}
 */
export function getValidatorList() {
    return explorer.get(`validators`)
        .then((response) => {
            return response.data.data.sort((a, b) => {
                // Sort by stake descending
                return b.stake - a.stake;
            });
        });
}

/**
 * @return {Promise<Array<ValidatorMeta>>}
 */
export function getValidatorMetaList() {
    return explorer.get(`validators/meta`)
        .then((response) => response.data.data);
}


// 1 min cache
const coinsCache = new Cache({ttl: 1 * 60 * 1000, max: 100});

/**
 * @param {object} [options]
 * @param {boolean} [options.skipMeta]
 * @return {Promise<Array<CoinInfo>>}
 */
export function getCoinList({skipMeta} = {}) {
    let coinListPromise = explorer.get('coins', {
            cache: coinsCache,
        })
        .then((response) => {
            const coinList = response.data.data;
            return coinList.filter((coin) => !isBlocked(coin.symbol));
        });

    if (!skipMeta) {
        const chainikIconMapPromise = getChainikIconList()
            .catch((error) => {
                console.log(error);
                return {};
            });

        // fill icons
        coinListPromise = Promise.all([coinListPromise, chainikIconMapPromise])
            .then(([coinList, chainikIconMap]) => {
                return coinList.map((coin) => {
                    const icon = chainikIconMap[coin.id];
                    coin.icon = icon;
                    return coin;
                });
            });

        // fill verified
        coinListPromise = markVerified(coinListPromise);
    }

    return coinListPromise
        // by default coins sorted by reserve
        .then((coinList) => {
            return coinList.sort((a, b) => {
                // base coin goes first
                if (a.symbol === BASE_COIN) {
                    return -1;
                } else if (b.symbol === BASE_COIN) {
                    return 1;
                }

                // verified coins go second
                if (a.verified && !b.verified) {
                    return -1;
                } else if (b.verified && !a.verified) {
                    return 1;
                }

                // archived coins go last
                const aIsArchived = isArchived(a);
                const bIsArchived = isArchived(b);
                if (aIsArchived && !bIsArchived) {
                    return 1;
                } else if (bIsArchived && !aIsArchived) {
                    return -1;
                }

                // other coins sorted as from API (by reserve)
                return 0;

                function isArchived(coin) {
                    if (coin.type === 'pool_token') {
                        return false;
                    }
                    return /-\d+$/.test(coin.symbol);
                }
            });
        });
}

/**
 * @param {string|number} [coin]
 * @param {number} [depth]
 * @return {Promise<Array<CoinInfo>>}
 */
export function getSwapCoinList(coin, depth) {
    const coinUrlSuffix = coin ? '/' + coin : '';
    return explorer.get('pools/list/coins' + coinUrlSuffix, {
            params: {depth},
            cache: coinsCache,
        })
        .then((response) => response.data.sort((a, b) => {
            return a.id - b.id;
        }));
}

/**
 * @typedef {object} PoolListInfo
 * @property {Array<Pool>} data
 * @property {PaginationMeta} meta
 */

/**
 * @param {object} [params]
 * @param {string|number} [params.coin] - search by coin
 * @param {string} [params.provider] - search by Mx address
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @return {Promise<PoolListInfo>}
 */
export function getPoolList(params) {
    return explorer.get('pools', {
            params,
            cache: statusCache,
        })
        .then((response) => response.data);
}


// 10s cache
const poolCache = new Cache({ttl: 10 * 1000, max: 100});

/**
 * @param {string|number} coin0
 * @param {string|number} coin1
 * @param {boolean} [skipCache]
 * @return {Promise<Pool>}
 */
export function getPool(coin0, coin1, skipCache) {
    return explorer.get(`pools/coins/${coin0}/${coin1}`, {
            cache: skipCache ? undefined : poolCache,
        })
        .then((response) => response.data.data);
}

/**
 * @param {string} symbol
 * @return {Promise<Pool>}
 */
export function getPoolByToken(symbol) {
    return explorer.get(`pools/token/${symbol}`, {
            cache: poolCache,
        })
        .then((response) => response.data.data);
}

/**
 * @TODO waitPool not protect from changed pool data in next block because of arbitrage bots
 * @param {string|number} coin0
 * @param {string|number} coin1
 * @param {object} [options]
 * @param {number} [options.updatedAtBlock]
 * @param {number} [options.tryLimit]
 * @return {Promise<Pool>}
 */
export function waitPool(coin0, coin1, {updatedAtBlock, tryLimit = 15} = {}) {
    return getPool(coin0, coin1, !!updatedAtBlock)
        .then((poolData) => {
            if (!updatedAtBlock || poolData.updatedAtBlock >= updatedAtBlock) {
                return poolData;
            }
            if (tryLimit <= 0) {
                return poolData;
            }
            return wait(3000).then(() => {
                return waitPool(coin0, coin1, {updatedAtBlock, tryLimit: tryLimit - 1});
            });
        });
}

/**
 * @param {string|number} coin0
 * @param {string|number} coin1
 * @param {string} address
 * @return {Promise<PoolProvider>}
 */
export function getPoolProvider(coin0, coin1, address) {
    return explorer.get(`pools/coins/${coin0}/${coin1}/providers/${address}`, {
            cache: statusCache,
        })
        .then((response) => response.data.data);
}

/**
 * @param {string} address
 * @param {object} [params]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @return {Promise<ProviderPoolListInfo>}
 */
export function getProviderPoolList(address, params) {
    return explorer.get(`pools/providers/${address}`, {
            params,
            cache: poolCache,
        })
        .then((response) => response.data);
}

/**
 * @typedef {object} ProviderPoolListInfo
 * @property {Array<PoolProvider>} data
 * @property {PaginationMeta} meta
 */


/**
 * @param {string} symbol
 * @return {Promise<CoinInfo>}
 */
export function getCoinBySymbol(symbol) {
    symbol = symbol.toUpperCase();
    return explorer.get(`coins/symbol/${symbol}`)
        .then((response) => {
            return response.data.data;
        });
}


/**
 * @param {string} coin0
 * @param {string} coin1
 * @param {object} amountOptions
 * @param {number|string} [amountOptions.buyAmount]
 * @param {number|string} [amountOptions.sellAmount]
 * @param {AxiosRequestConfig} [axiosOptions]
 * @return {Promise<{coins: Array<Coin>, amountIn: number|string, amountOut:number|string, swapType:ESTIMATE_SWAP_TYPE}>}
 */
export function getSwapRoute(coin0, coin1, {buyAmount, sellAmount}, axiosOptions) {
    const amount = convertToPip(buyAmount || sellAmount);
    let type;
    if (sellAmount) {
        type = 'input';
    }
    if (buyAmount) {
        type = 'output';
    }
    return explorer.get(`pools/coins/${coin0}/${coin1}/route?type=${type}&amount=${amount}`, axiosOptions)
        .then((response) => response.data);
}

/**
 * @param {string} coin0
 * @param {string} coin1
 * @param {object} amountOptions
 * @param {number|string} [amountOptions.buyAmount]
 * @param {number|string} [amountOptions.sellAmount]
 * @param {AxiosRequestConfig} [axiosOptions]
 * @return {Promise<{coins: Array<Coin>, amountIn: number|string, amountOut:number|string, swapType:ESTIMATE_SWAP_TYPE}>}
 */
export function getSwapEstimate(coin0, coin1, {buyAmount, sellAmount}, axiosOptions) {
    const amount = convertToPip(buyAmount || sellAmount);
    let type;
    if (sellAmount) {
        type = 'input';
    }
    if (buyAmount) {
        type = 'output';
    }
    return explorer.get(`pools/coins/${coin0}/${coin1}/estimate?type=${type}&amount=${amount}`, axiosOptions)
        .then((response) => response.data);
}


/**
 * @typedef {object} Block
 * @property {number} height
 * @property {string} timestamp
 * @property {number} transactionCount - tx count in the block
 * @property {number} size
 * @property {string} hash
 * @property {number} reward
 * @property {number} blockTime
 * @property {string} timestamp
 * @property {number} validatorsCount
 * @property {Array<ValidatorListItem>} [validators]
 */

/**
 * @typedef {object} StakeListInfo
 * @property {Array<StakeItem>} data
 * @property {PaginationMeta} meta
 */

/**
 * @typedef {object} StakeItem
 * @property {Coin} coin
 * @property {string|number} value
 * @property {string|number} bipValue
 * @property {Validator} [validator] - in address stakes
 * @property {string} [address] - in validator stakes
 * @property {boolean} isWaitlisted
 */

/**
 * @typedef {object} ValidatorListItem
 * @property {Validator} validator
 * @property {boolean} signed
 */

/**
 * @typedef {object} ValidatorMeta
 * @property {string} publicKey
 * @property {number} status
 * @property {string} name - meta name
 * @property {string} description - meta desc
 * @property {string} iconUrl - meta icon
 * @property {string} siteUrl - meta url
 */

/**
 * @typedef {ValidatorMeta} Validator
 * @property {string|number} stake
 * @property {string|number} minStake
 * @property {string|number} part
 * @property {number} commission
 * @property {number} delegatorCount
 * @property {Array<{coin: Coin, value: string, address: string}>} delegatorList
 */

/**
 * @typedef {object} Pool
 * @property {Coin} coin0
 * @property {Coin} coin1
 * @property {number|string} amount0
 * @property {number|string} amount1
 * @property {number|string} liquidity
 * @property {number|string} liquidityBip
 * @property {Coin} token
 * @property {number|string} tradeVolumeBip1D
 * @property {number} updatedAtBlock
 */

/**
 * @typedef {object} PoolProvider
 * @property {string} address
 * @property {Coin} coin0
 * @property {Coin} coin1
 * @property {number|string} amount0
 * @property {number|string} amount1
 * @property {number|string} liquidity
 * @property {number|string} liquidityBip
 * @property {number|string} liquidityShare
 * @property {string} token
 */

/**
 * @typedef {object} TransactionListInfo
 * @property {Array<Transaction>} data
 * @property {PaginationMeta} meta
 */

/**
 * @typedef {object} Transaction
 * @property {number} txn
 * @property {string} hash
 * @property {string} status
 * @property {number} nonce
 * @property {number} height
 * @property {string} from
 * @property {string} timestamp
 * @property {Coin} gasCoin
 * @property {number} commissionInBaseCoin
 * @property {number} commissionInGasCoin
 * @property {number} commissionPrice
 * @property {Coin} commissionPriceCoin
 * @property {number} type
 * @property {object} data
 * -- type: TX_TYPE.SEND
 * @property {string} [data.to]
 * @property {Coin} [data.coin]
 * @property {number} [data.amount]
 * -- type: TX_TYPE.CONVERT
 * @property {Coin} [data.coinToSell]
 * @property {Coin} [data.coinToBuy]
 * @property {Array<Coin>} [data.coins]
 * @property {number} [data.valueToSell]
 * @property {number} [data.minimumValueToBuy]
 * @property {number} [data.valueToBuy]
 * @property {number} [data.maximumValueToSell]
 * -- type: TX_TYPE.CREATE_COIN
 * @property {number} [data.createdCoinId]
 * @property {string} [data.name]
 * @property {string} [data.symbol]
 * @property {number} [data.initialAmount]
 * @property {number} [data.initialReserve]
 * @property {number} [data.constantReserveRatio]
 * @property {number} [data.maxSupply]
 * -- type: TX_TYPE.DECLARE_CANDIDACY
 * @property {string} [data.address]
 * @property {string} [data.pubKey]
 * @property {number} [data.commission]
 * @property {Coin} [data.coin]
 * @property {number} [data.stake]
 * -- type: TX_TYPE.EDIT_CANDIDATE
 * @property {string} [data.pubKey]
 * @property {string} [data.rewardAddress]
 * @property {string} [data.ownerAddress]
 * @property {string} [data.controlAddress]
 * -- type: TX_TYPE.EDIT_CANDIDATE_PUBLIC_KEY
 * @property {string} [data.pubKey]
 * @property {string} [data.newPubKey]
 * -- type: TX_TYPE.DELEGATE, TX_TYPE.UNBOND
 * @property {string} [data.pubKey]
 * @property {Coin} [data.coin]
 * @property {number} [data.value]
 * -- type: TX_TYPE.REDEEM_CHECK
 * @property {string} [data.rawCheck]
 * @property {string} [data.proof]
 * @property {object} [data.check]
 * @property {string} [data.check.sender]
 * @property {number} [data.check.nonce]
 * @property {number|string} [data.check.value]
 * @property {Coin} [data.check.coin]
 * @property {number} [data.check.dueBlock]
 * - type: TX_TYPE.SET_CANDIDATE_ON, TX_TYPE.SET_CANDIDATE_OFF
 * @property {string} [data.pubKey]
 * -- type: TX_TYPE.MULTISEND
 * @property {Array<{to: string, value: string|number, coin: Coin}>} [data.list]
 * -- type: TX_TYPE.CREATE_MULTISIG
 * @property {string|number} [data.multisigAddress]
 * @property {Array<string>} [data.addresses]
 * @property {Array<string|number>} [data.weights]
 * @property {string|number} [data.threshold]
 */

/**
 * @typedef {object} Coin
 * @property {number} id
 * @property {string} symbol
 * @property {CoinType} type
 * @property {boolean} [verified]
 */

/**
 * @typedef {object} CoinInfo
 * @property {number} id
 * @property {string} symbol
 * @property {CoinType} type
 * @property {number} crr
 * @property {number|string} volume
 * @property {number|string} reserveBalance
 * @property {number|string} maxSupply
 * @property {boolean} mintable
 * @property {boolean} burnable
 * @property {string} name
 * @property {string|null} ownerAddress
 * @property {boolean} [verified] - filled from hub api
 * @property {boolean} [icon] - filled from chainik app
 * @property {number|string} priceUsd
 * @property {number|string} tradingVolume24H
 * @property {number|string} tradingVolume1Mo
 */

/**
 * @typedef {('coin'|'token'|'pool_token')} CoinType
 */

/**
 * @typedef {object} PaginationMeta
 * @property {number} currentPage
 * @property {number} lastPage
 * @property {number} perPage
 * @property {number} total
 * @property {string} path
 */

