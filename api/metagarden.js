import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {METAGARDEN_API_URL, NETWORK, MAINNET} from "~/assets/variables.js";
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
 * @return {Promise<Array<MetagardenLootbox>>}
 */
export function getLootboxList(privateKey) {
    return instance.get('loot-box/list', {
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => response.data.data);
}

/**
 *
 * @param {string} privateKey
 * @returns {Promise<MetagardenLootbox|undefined>}
 */
export function getLootbox(privateKey) {
    return getLootboxList(privateKey)
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
