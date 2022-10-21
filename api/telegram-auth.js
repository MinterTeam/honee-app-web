import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {TELEGRAM_AUTH_API_URL} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';

const instance = axios.create({
    baseURL: TELEGRAM_AUTH_API_URL,
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});
addToCamelInterceptor(instance);

// 24 hr cache
const tgUserCache = new Cache({maxAge: 24 * 60 * 60 * 1000});
/**
 * @return {Promise<TelegramAuthResponse>}
 */
export function getAuth(secretDeviceUuid) {
    return instance.get(`users/auth/${secretDeviceUuid}`, {
            cache: tgUserCache,
        })
        .then((response) => {
            return response.data;
        });
}

/**
 * @typedef {object} TelegramAuthResponse
 * @property {string} signed
 * @property {TelegramUser} user
 */

/**
 * @typedef {object} TelegramUser
 * @property {number} telegramId
 * @property {string} username
 */
