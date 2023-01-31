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
 * @param {string} address
 * @return {Promise<object>}
 */
export function getSpotInfo(address) {
    if (!address) {
        throw new Error('Address needed to get spots info');
    }
    return instance.get(`info/${address}`)
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
 * @typedef {object} MetagardenLootbox
 * @property {number} id
 * @property {boolean} isActivated
 */

