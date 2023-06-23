import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {REFERRAL_API_URL, NETWORK, MAINNET, IS_SUBAPP_MEGACHAIN} from "~/assets/variables.js";
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import addEcdsaAuthInterceptor, {authHeaderKeyGenerator} from '~/assets/axios-ecdsa-auth.js';

const PROGRAM_ID = IS_SUBAPP_MEGACHAIN ? 4 : 1;

const instance = axios.create({
    baseURL: REFERRAL_API_URL,
    adapter: cacheAdapterEnhancer(getDefaultAdapter(), {
        enabledByDefault: false,
        cacheKeyGenerator: authHeaderKeyGenerator,
    }),
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
    return instance.post(`join/${PROGRAM_ID}`, {
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
    return instance.get(`referral/${address}`, {
        params: {
            pid: PROGRAM_ID,
        },
    })
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
    return instance.get(`list/${address}/referrals`, {
        params: {
            pid: PROGRAM_ID,
        },
    })
        .then((response) => response.data.data);
}

const fastCache = new Cache({ttl: 2 * 1000, max: 100});

/**
 * @param {Array<string>} refIdList
 * @return {Promise<Record<string, number>>}
 */
export function getReferralBonusList(refIdList) {
    if (!refIdList?.length) {
        throw new Error('refId needed to get statistics');
    }
    return instance.get(`statistic/meganet`, {
            params: {
                users: refIdList.join(','),
            },
            cache: fastCache,
        })
        .then((response) => response.data.data);
}

/**
 * @param {string} refId
 * @return {Promise<number>}
 */
export function getReferralBonus(refId) {
    if (!refId) {
        throw new Error('refId needed to get statistics');
    }
    return getReferralBonusList([refId])
        .then((bonusMap) => Object.values(bonusMap)[0]);
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
