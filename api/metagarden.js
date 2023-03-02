import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {METAGARDEN_API_URL, METAGARDEN_ADMIN_API_KEY, NETWORK, MAINNET} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import addEcdsaAuthInterceptor, {authHeaderKeyGenerator} from '~/assets/axios-ecdsa-auth.js';

const instance = axios.create({
    baseURL: METAGARDEN_API_URL,
    // adapter: cacheAdapterEnhancer(axios.defaults.adapter, {
    //     enabledByDefault: false,
    //     cacheKeyGenerator: authHeaderKeyGenerator,
    // }),
    // timeout: 5,
});
addToCamelInterceptor(instance);
addEcdsaAuthInterceptor(instance);


/**
 * @param {string} privateKey
 * @return {Promise<MetagardenSpotInfo>}
 */
export function getSpotInfo(privateKey) {
    if (!privateKey) {
        throw new Error('PK needed to get spots info');
    }
    return instance.get('info', {
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => response.data.data);
}

// export const getSpotInfo = () => getSpotInfoDebug('Mx531bdb3a6ab6faa0b6adba80cedeb86a6dbbea67');

/**
 * @param {string} address
 * @param {string} [date] - e.g. '2006-01-25'
 * @return {Promise<MetagardenSpotInfo>}
 */
export function getSpotInfoDebug(address, date) {
    return instance.get('address-info', {
            params: {
                address,
                date,
                key: METAGARDEN_ADMIN_API_KEY,
            },
        })
        .then((response) => response.data.data);
}

/**
 * @param {string} privateKey
 * @return {Promise<object>}
 */
export function claimSpotReward(privateKey) {
    return instance.get('claim', {
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => response.data.data);
}

/**
 * @param {string} privateKey
 * @param {object} [options]
 * @param {boolean} [options.keepActivated]
 * @return {Promise<Array<MetagardenLootbox>>}
 */
export function getLootboxList(privateKey, {keepActivated} = {}) {
    return instance.get('loot-box/list', {
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => {
            return keepActivated ? response.data.data : response.data.data.filter((item) => !item.isActivated);
        });
}

/**
 *
 * @param {string} privateKey
 * @returns {Promise<MetagardenLootbox|undefined>}
 */
export function getLootbox(privateKey) {
    return getLootboxList(privateKey, {keepActivated: true})
        .then((list) => {
            return list.find((item) => !item.isActivated);
        });
}


/**
 * @param {string} privateKey
 * @param {number|string} id
 * @return {Promise<MetagardenLootbox>}
 */
export function openLootbox(privateKey, id) {
    return instance.get(`loot-box/activate/${id}`, {
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => response.data.data);
}

/**
 * @typedef {object} MetagardenLootbox
 * @property {number} id
 * @property {boolean} isActivated
 * @property {Array<MetagardenLootboxReward>} items
 */

/**
 * @typedef {MetagardenLootboxRewardCheck} MetagardenLootboxReward
 */

/**
 * @typedef {object} MetagardenLootboxRewardCheck
 * @property {'check'} type
 * @property {{check: string, password: string}} data
 */

/**
 * @typedef {object} MetagardenSpotInfo
 * @property {number} position - in rating
 * @property {string} address
 * @property {number} spots
 * @property {number} claimValue
 * @property {number} claimDays
 * @property {number} dailyYield - mg + votes
 * @property {boolean} isMiningStarted
 * @property {Record<string, string|number>} locks
 */
