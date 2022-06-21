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

    return getStakingList()
        .then((stakingList) => {
            const program = stakingList.find((item) => item.id === id);
            if (program) {
                return program;
            } else {
                return Promise.reject(new NotFoundError('Staking program not found'));
            }
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
 * @property {string} ownerAddress
 * @property {string} address
 * @property {Coin} rewardCoin
 * @property {Coin} lockCoin
 * @property {Object.<number|string, number>} options
 * @property {boolean} isEnabled
 */
