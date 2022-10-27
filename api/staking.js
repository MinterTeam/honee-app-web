import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import Big from '~/assets/big.js';
import {STAKING_API_URL, PREMIUM_STAKE_PROGRAM_ID} from "~/assets/variables.js";
import NotFoundError from '~/assets/utils/error-404.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';

const instance = axios.create({
    baseURL: STAKING_API_URL,
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});
addToCamelInterceptor(instance);

// 5 sec cache for same block
const blockCache = new Cache({ttl: 5 * 1000, max: 100});
/**
 * @return {Promise<Array<StakingProgram>>}
 */
export function getStakingList() {
    return instance.get('locks')
        .then((response) => {
            return response.data.data;
        });
}

/**
 * @param {number|string} id - staking program ID
 * @return {Promise<StakingProgram>}
 */
export function getStakingProgram(id) {
    // check numberish
    if (Number(id).toString() !== id.toString()) {
        return Promise.reject(new NotFoundError('Invalid staking program ID'));
    }
    id = Number(id);

    return instance.get(`locks/${id}`)
        .then((response) => {
            return response.data.data;
        });
}

/**
 * @param {string} address
 * @return {Promise<Array<StakingProgramAddressLock>>}
 */
export function getAddressLockList(address) {
    return instance.get(`address/${address}/locks`, {
        cache: blockCache,
    })
        .then((response) => {
            let result = [];
            response.data.data.forEach(({addressLocks, ...program}) => {
                addressLocks.forEach((lock) => {
                    result.push({
                        ...lock,
                        key: `${lock.dueBlock}-${lock.option}-${program.id}`,
                        program,
                    });
                });
            });
            return result;
        })
        .catch((error) => {
            if (error.response?.status === 404) {
                return [];
            } else {
                throw error;
            }
        });
}

/**
 * @param {string} address
 * @return {Promise<number|string>}
 */
export function getAddressPremiumAmount(address) {
    return getAddressLockList(address)
        .then((lockList) => {
            return lockList
                .filter((item) => item.program.id === PREMIUM_STAKE_PROGRAM_ID)
                .reduce((accumulator, item) => {
                    return new Big(accumulator).plus(item.amount).toString();
                }, 0);
        });
}

/**
 *
 * @param {string} address
 * @return {Promise<number>}
 */
export function getAddressPremiumLevel(address) {
    return getAddressPremiumAmount(address)
        .then((amount) => getPremiumLevel(amount));
}

/**
 * @param {number|string} amount
 * @return {number}
 */
export function getPremiumLevel(amount) {
    if (amount >= 1000000) {
        return 4;
    }
    if (amount >= 100000) {
        return 3;
    }
    if (amount >= 10000) {
        return 2;
    }
    if (amount >= 1000) {
        return 1;
    }
    return 0;
}

/**
 * @typedef {object} StakingProgram
 * @property {number} id
 * @property {number} joinStartAtBlock
 * @property {number} joinEndAtBlock
 * @property {number} paymentStartAtBlock
 * @property {number} paymentEndAtBlock
 * @property {number} limit - max amount to lock
 * @property {string} totalLocked
 * @property {string} ownerAddress
 * @property {string} address
 * @property {Coin} rewardCoin
 * @property {Coin} lockCoin
 * @property {Object.<number|string, number>} options
 * @property {boolean} isEnabled
 */

/**
 * @typedef {object} StakingProgramAddressLock
 * @property {number|string} amount
 * @property {number} option
 * @property {number} dueBlock
 * @property {string} key - string key generated from lock properties to be used for vue list keys
 * @property {StakingProgram} program
 */
