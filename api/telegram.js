import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import addEcdsaAuthInterceptor, {signRequest} from '~/assets/axios-ecdsa-auth.js';
import {TELEGRAM_AUTH_API_URL, TELEGRAM_LEGACY_AUTH_API_URL} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';

const instance = axios.create({
    baseURL: TELEGRAM_AUTH_API_URL,
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});
addToCamelInterceptor(instance);
addEcdsaAuthInterceptor(instance);


// 24 hr cache
const tgUserCache = new Cache({ttl: 24 * 60 * 60 * 1000, max: 100});
/**
 * @return {Promise<TelegramAuthResponse>}
 */
export function getLegacyAuth(secretDeviceUuid) {
    return instance.get(`users/auth/${secretDeviceUuid}`, {
            baseURL: TELEGRAM_LEGACY_AUTH_API_URL,
            cache: tgUserCache,
        })
        .then((response) => {
            return response.data;
        });
}

/**
 * @return {Promise<undefined>}
 */
export function switchLegacyAuth(secretDeviceUuid, privateKey) {
    return instance.post(`users/auth-switch/${secretDeviceUuid}`, {}, {
            cache: tgUserCache,
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => {
            return response.data;
        });
}

/**
 * @return {Promise<TelegramAuthResponse>}
 */
export function getAuth(privateKey) {
    return instance.get(`users/auth`, {
            cache: tgUserCache,
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => {
            return response.data;
        });
}

/**
 * @param {Date|string} timestamp
 * @param {string} privateKey
 * @return {string}
 */
export function getAuthString(timestamp, privateKey) {
    timestamp = new Date(timestamp).toISOString();
    return signRequest(timestamp, privateKey);
}

/**
 * @typedef {object} TelegramAuthResponse
 * @property {string} signed - signature of tg-id by private key shared between honee bot and honee api
 * @property {TelegramUser} user
 */

/**
 * @typedef {object} TelegramUser
 * @property {number} telegramId
 * @property {string} username
 */
