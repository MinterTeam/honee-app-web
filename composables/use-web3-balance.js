import {reactive, set} from '@vue/composition-api';
import * as web3 from '~/api/web3.js';
import {fromErcDecimals} from '~/api/web3.js';
import erc20ABI from '~/assets/abi-erc20.js';
import {HUB_CHAIN_BY_ID, HUB_CHAIN_DATA} from '~/assets/variables.js';

export const PROMISE_STATUS = {
    FINISHED: 'finished',
    REJECTED: 'rejected',
    PENDING: 'pending',
};

//workaround for `set` not trigger computed properly
function getInitialChainData() {
    return Object.fromEntries(Object.values(HUB_CHAIN_DATA).map((item) => [item.chainId, {}]));
}

/**
 * @type {Object.<number, {promise: Promise, promiseStatus: PROMISE_STATUS}>}
 */
let balanceRequestData = getInitialChainData();
/**
 * @type {Object.<number, {promise: Promise, promiseStatus: PROMISE_STATUS}>}
 */
let allowanceRequestData = getInitialChainData();
/**
 * @type {UnwrapRef<Object.<number, Object.<string, number|string>>>}
 */
const web3Balance = reactive(getInitialChainData());
/**
 * @type {UnwrapRef<Object.<number, Object.<string, number|string>>>}
 */
const web3Allowance = reactive(getInitialChainData());

/**
 * @param {string} accountAddress
 * @param {number} chainId
 * @param {string} tokenAddress
 * @param {string} tokenSymbol
 * @param {number} tokenDecimals
 * @return {Promise}
 */
function getBalance(accountAddress, chainId, tokenAddress, tokenSymbol, tokenDecimals) {
    if (!accountAddress || !chainId || !tokenAddress || !tokenSymbol || !tokenDecimals) {
        return Promise.reject();
    }

    if (balanceRequestData[chainId]?.[tokenSymbol]?.promiseStatus === PROMISE_STATUS.PENDING) {
        return balanceRequestData[chainId][tokenSymbol].promise;
    }

    if (!web3Balance[chainId]) {
        set(web3Balance, chainId, {});
        balanceRequestData[chainId] = {};
    }

    const isNativeSelected = HUB_CHAIN_BY_ID[chainId]?.wrappedNativeContractAddress === tokenAddress.toLowerCase();
    const balancePromise = Promise.all([
            new web3.eth.Contract(erc20ABI, tokenAddress).methods.balanceOf(accountAddress).call(),
            isNativeSelected ? web3.eth.getBalance(accountAddress) : Promise.resolve(),
        ])
        .then(([balance, ethBalance]) => {
            set(web3Balance[chainId], tokenSymbol, fromErcDecimals(balance, tokenDecimals));
            if (isNativeSelected) {
                set(web3Balance[chainId], 0, web3.utils.fromWei(ethBalance));
            }
            balanceRequestData[chainId][tokenSymbol] = {
                promiseStatus: PROMISE_STATUS.FINISHED,
                promise: balancePromise,
            };
        })
        .catch((error) => {
            console.log(error);
            set(web3Balance[chainId], tokenSymbol, undefined);
            if (isNativeSelected) {
                set(web3Balance[chainId], 0, undefined);
            }
            balanceRequestData[chainId][tokenSymbol] = {
                promiseStatus: PROMISE_STATUS.REJECTED,
                promise: balancePromise,
            };
            return Promise.reject(error);
        });

    balanceRequestData[chainId][tokenSymbol] = {
        promiseStatus: PROMISE_STATUS.PENDING,
        promise: balancePromise,
    };

    return balancePromise;
}

function getAllowance(accountAddress, chainId, tokenAddress, tokenSymbol, tokenDecimals) {
    if (!accountAddress || !chainId || !tokenAddress || !tokenSymbol || !tokenDecimals) {
        return Promise.reject();
    }

    const isNativeSelected = HUB_CHAIN_BY_ID[chainId]?.wrappedNativeContractAddress === tokenAddress.toLowerCase();
    // allowance not needed for native coins
    if (isNativeSelected) {
        return;
    }
    if (allowanceRequestData[chainId]?.[tokenSymbol]?.promiseStatus === PROMISE_STATUS.PENDING) {
        return allowanceRequestData[chainId][tokenSymbol].promise;
    }

    if (!web3Allowance[chainId]) {
        set(web3Allowance, chainId, {});
        allowanceRequestData[chainId] = {};
    }

    const hubAddress = HUB_CHAIN_BY_ID[chainId]?.hubContractAddress;
    const allowancePromise = new web3.eth.Contract(erc20ABI, tokenAddress).methods.allowance(accountAddress, hubAddress).call()
        .then((allowanceValue) => {
            set(web3Allowance[chainId], tokenSymbol, fromErcDecimals(allowanceValue, tokenDecimals));
            allowanceRequestData[chainId][tokenSymbol] = {
                promiseStatus: PROMISE_STATUS.FINISHED,
                promise: allowancePromise,
            };
        })
        .catch((error) => {
            console.log(error);
            set(web3Allowance[chainId], tokenSymbol, undefined);
            allowanceRequestData[chainId][tokenSymbol] = {
                promiseStatus: PROMISE_STATUS.REJECTED,
                promise: allowancePromise,
            };
        });

    allowanceRequestData[chainId][tokenSymbol] = {
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
