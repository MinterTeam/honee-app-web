import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {REFERRAL_API_URL, NETWORK, MAINNET} from "~/assets/variables.js";
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import addEcdsaAuthInterceptor, {authHeaderKeyGenerator} from '~/assets/axios-ecdsa-auth.js';

const instance = axios.create({
    baseURL: REFERRAL_API_URL,
    // adapter: cacheAdapterEnhancer(getDefaultAdapter(), {
    //     enabledByDefault: false,
    //     cacheKeyGenerator: authHeaderKeyGenerator,
    // }),
    // timeout: 5,
});
addToCamelInterceptor(instance);
addEcdsaAuthInterceptor(instance);


/**
 *
 * @param {string} privateKey
 * @param {boolean} [enable=true]
 * @return {Promise<string|false>}
 */
export function setupReferralProgram(privateKey, enable = true) {
    return instance.post('join/1', {
        enable,
    }, {
        ecdsaAuth: {
            privateKey,
            includePublicKey: false,
        },
    })
        .then((response) => enable ? response.data.data.refId : false);
}

/**
 * @param {string} address
 * @return {Promise<string>}
 */
export function getRefId(address) {
    if (!address) {
        throw new Error('Address needed to get ref id');
    }
    return instance.get(`referral/${address}`)
        .then((response) => response.data.data.refId);
}

/**
 * @param {string} address
 * @return {Promise<Array<string>>}
 */
export function getReferralList(address) {
    if (!address) {
        throw new Error('Address needed to get referral list');
    }
    return instance.get(`list/${address}/referrals`)
        .then((response) => response.data.data);
}

/**
 * @param {string} refId
 * @param {string} privateKey
 * @return {Promise}
 */
export function followReferrer(refId, privateKey) {
    return instance.post('follow', {
        key: refId,
    }, {
        ecdsaAuth: {
            privateKey,
            includePublicKey: false,
        },
    });
}
