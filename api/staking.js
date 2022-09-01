import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {STAKING_API_URL, NETWORK, MAINNET} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';

const instance = axios.create({
    baseURL: STAKING_API_URL,
    // adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});
addToCamelInterceptor(instance);

// 10 min cache
// const coinsCache = new Cache({maxAge: 10 * 60 * 1000});
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
 * @return {Promise<Array<StakingProgramAddressLock>>}
 */
export function getAddressLockList(address) {
    return instance.get(`address/${address}/locks`)
        .then((response) => {
            let result = [];
            response.data.data.forEach(({addressLocks, ...program}) => {
                addressLocks.forEach((lock) => {
                    result.push({
                        ...lock,
                        program,
                    });
                });
            });
            return result;
        });
}

class NotFoundError extends Error {
    constructor(message = 'Not found') {
        super(message);
        this.name = 'NotFoundError';
        this.status = 404;
        this.useMessage = true;
    }
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
 * @property {StakingProgram} program
 */
