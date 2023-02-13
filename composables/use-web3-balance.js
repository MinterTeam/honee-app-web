import {reactive, set} from 'vue';
import {getProviderByChain, getAllowance as _getAllowance, web3Utils, fromErcDecimals} from '~/api/web3.js';
import erc20ABI from '~/assets/abi-erc20.js';
import {HUB_CHAIN_BY_ID, HUB_CHAIN_DATA} from '~/assets/variables.js';

/**
 * @enum {string}
 */
export const PROMISE_STATUS = {
    FINISHED: 'finished',
    REJECTED: 'rejected',
    PENDING: 'pending',
};

// workaround for `set` not trigger computed properly
// @see https://github.com/vuejs/composition-api/issues/580
/**
 * @overload
 * @return {Record<ChainId, object>}
 */
/**
 * @overload
 * @param {boolean} isBalance
 * @return {Record<ChainId, Record<string, number>>}
 */
/**
 * @param {boolean} [isBalance]
 * @return {Record<ChainId, (Record<string, number> | object)>}
 */
function getInitialChainData(isBalance) {
    return Object.fromEntries(Object.values(HUB_CHAIN_DATA).map((item) => [item.chainId, getEmptyItem()]));

    function getEmptyItem() {
        // init with native balance
        return isBalance ? {'0': 0} : {};
    }
}

/**
 * @type {Record<ChainId, Record<string, {promise: Promise, promiseStatus: PROMISE_STATUS}>>}
 */
let balanceRequestData = getInitialChainData();
/**
 * @type {Record<ChainId, Record<string, {promise: Promise, promiseStatus: PROMISE_STATUS}>>}
 */
let allowanceRequestData = getInitialChainData();
/**
 * @type {UnwrapNestedRefs<Record<ChainId, Record<string, number|string>>>}
 */
const web3Balance = reactive(getInitialChainData(true));
/**
 * @type {UnwrapNestedRefs<Record<ChainId, Record<string, number|string>>>}
 */
const web3Allowance = reactive(getInitialChainData());

/**
 * @param {string} accountAddress
 * @param {number} chainId
 * @param {string} tokenAddress
 * @param {number} tokenDecimals
 * @return {Promise<string>}
 */
function getBalance(accountAddress, chainId, tokenAddress, tokenDecimals) {
    if (!accountAddress || !chainId || !tokenAddress || !tokenDecimals) {
        return Promise.reject();
    }
    tokenAddress = tokenAddress.toLowerCase();
    const web3Eth = getProviderByChain(chainId);

    if (balanceRequestData[chainId]?.[tokenAddress]?.promiseStatus === PROMISE_STATUS.PENDING) {
        return balanceRequestData[chainId][tokenAddress].promise;
    }

    if (!web3Balance[chainId]) {
        set(web3Balance, chainId, {});
        balanceRequestData[chainId] = {};
    }

    const isNativeSelected = HUB_CHAIN_BY_ID[chainId]?.wrappedNativeContractAddress === tokenAddress;
    const balancePromise = Promise.all([
            new web3Eth.Contract(erc20ABI, tokenAddress).methods.balanceOf(accountAddress).call(),
            isNativeSelected ? web3Eth.getBalance(accountAddress) : Promise.resolve(),
        ])
        .then(([balance, nativeBalance]) => {
            set(web3Balance[chainId], tokenAddress, fromErcDecimals(balance, tokenDecimals));
            if (isNativeSelected) {
                set(web3Balance[chainId], 0, web3Utils.fromWei(nativeBalance));
            }
            balanceRequestData[chainId][tokenAddress] = {
                promiseStatus: PROMISE_STATUS.FINISHED,
                promise: balancePromise,
            };
            return fromErcDecimals(balance, tokenDecimals);
        })
        .catch((error) => {
            console.log(error);
            set(web3Balance[chainId], tokenAddress, undefined);
            if (isNativeSelected) {
                set(web3Balance[chainId], 0, undefined);
            }
            balanceRequestData[chainId][tokenAddress] = {
                promiseStatus: PROMISE_STATUS.REJECTED,
                promise: balancePromise,
            };
            return Promise.reject(error);
        });

    balanceRequestData[chainId][tokenAddress] = {
        promiseStatus: PROMISE_STATUS.PENDING,
        promise: balancePromise,
    };

    return balancePromise;
}

/**
 * Get allowance for Hub bridge contract
 * @param {string} accountAddress
 * @param {number} chainId
 * @param {string} tokenAddress
 * @param {number} tokenDecimals
 * @return {Promise<string>|undefined}
 */
function getAllowance(accountAddress, chainId, tokenAddress, tokenDecimals) {
    if (!accountAddress || !chainId || !tokenAddress || !tokenDecimals) {
        return Promise.reject();
    }
    tokenAddress = tokenAddress.toLowerCase();
    const web3Eth = getProviderByChain(chainId);

    const isNativeSelected = HUB_CHAIN_BY_ID[chainId]?.wrappedNativeContractAddress === tokenAddress;
    // allowance not needed for native coins
    if (isNativeSelected) {
        return;
    }
    if (allowanceRequestData[chainId]?.[tokenAddress]?.promiseStatus === PROMISE_STATUS.PENDING) {
        return allowanceRequestData[chainId][tokenAddress].promise;
    }

    if (!web3Allowance[chainId]) {
        set(web3Allowance, chainId, {});
        allowanceRequestData[chainId] = {};
    }

    const hubAddress = HUB_CHAIN_BY_ID[chainId]?.hubContractAddress;
    const allowancePromise = _getAllowance(chainId, tokenAddress, accountAddress, hubAddress)
        .then((allowanceValue) => {
            set(web3Allowance[chainId], tokenAddress, fromErcDecimals(allowanceValue, tokenDecimals));
            allowanceRequestData[chainId][tokenAddress] = {
                promiseStatus: PROMISE_STATUS.FINISHED,
                promise: allowancePromise,
            };
            return fromErcDecimals(allowanceValue, tokenDecimals);
        })
        .catch((error) => {
            console.log(error);
            set(web3Allowance[chainId], tokenAddress, undefined);
            allowanceRequestData[chainId][tokenAddress] = {
                promiseStatus: PROMISE_STATUS.REJECTED,
                promise: allowancePromise,
            };
        });

    allowanceRequestData[chainId][tokenAddress] = {
        promiseStatus: PROMISE_STATUS.PENDING,
        promise: allowancePromise,
    };

    return allowancePromise;
}


export default function useWeb3Balance() {
    return {
        web3Balance,
        web3Allowance,
        getBalance,
        getAllowance,
    };
}
