import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';
import addEcdsaAuthInterceptor, {signRequest, authHeaderKeyGenerator} from '~/assets/axios-ecdsa-auth.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import {TELEGRAM_AUTH_API_URL, TELEGRAM_LEGACY_AUTH_API_URL} from "~/assets/variables.js";
import {toSnake} from '~/assets/utils/snake-case.js';

const instance = axios.create({
    baseURL: TELEGRAM_AUTH_API_URL,
    adapter: cacheAdapterEnhancer(getDefaultAdapter(), {
        enabledByDefault: false,
        cacheKeyGenerator: authHeaderKeyGenerator,
    }),
});
addToCamelInterceptor(instance);
addEcdsaAuthInterceptor(instance);


const userCacheTime = 60 * 60 * 1000;
const tgUserCache = new Cache({ttl: userCacheTime, max: 100});
/**
 * @param {string} secretDeviceUuid
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
 * @param {string} secretDeviceUuid
 * @param {string} privateKey
 * @return {Promise<undefined>}
 */
export function switchLegacyAuth(secretDeviceUuid, privateKey) {
    return instance.post(`users/auth-switch/${secretDeviceUuid}`, {}, {
            ecdsaAuth: {
                privateKey,
            },
        })
        .then((response) => {
            return response.data;
        });
}

/**
 * @param {string} privateKey
 * @return {Promise<TelegramAuthResponse>}
 */
export function getAuth(privateKey) {
    return instance.get(`users/auth`, {
            cache: tgUserCache,
            ecdsaAuth: {
                privateKey,
                timestampThrottle: userCacheTime,
            },
        })
        .then((response) => {
            return response.data;
        });
}

/**
 * @param {number|string} id
 * @param {string} privateKey
 * @return {Promise<import('axios').AxiosResponse<any>>}
 */
export function portfolioNotificationSubscribe(id, privateKey) {
    return instance.post(`users/portfolios/${id}`, {}, {
        ecdsaAuth: {
            privateKey,
        },
    });
}
/**
 * @param {number|string} id
 * @param {string} privateKey
 * @return {Promise<import('axios').AxiosResponse<any>>}
 */
export function portfolioNotificationUnsubscribe(id, privateKey) {
    return instance.delete(`users/portfolios/${id}`, {
        ecdsaAuth: {
            privateKey,
        },
    });
}

/**
 * @param {string} privateKey
 * @return {Promise<Array<number>>}
 */
export function getUserPortfolioNotificationList(privateKey) {
    return instance.get('users/portfolios', {
        ecdsaAuth: {
            privateKey,
            timestampThrottle: 1000,
        },
    })
        .then((response) => response.data.data);
}

/**
 * @param {string} address
 * @param {string} token
 * @return {Promise<number>}
 */
export function createBuyOrder(address, token) {
    return instance.post('/order', {
        address,
        token,
    })
        .then((response) => response.data.orderId);
}

export function sendAddress(telegramId, address, initData) {
    return instance.post('/users/address', toSnake({
        telegramId,
        address,
        initData,
        // metagarden-bot.minter.network api requires token, so hardcode some everywhere https://t.me/c/1747718110/1533
        token: 'LAUNCHPAD',
    }));
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
