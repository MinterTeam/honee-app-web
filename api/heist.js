import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {HEIST_BSC_API_URL, HEIST_BNB_MEGA_SWAP_API_URL} from "~/assets/variables.js";
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';

const instance = axios.create({
    baseURL: HEIST_BSC_API_URL,
    // adapter: cacheAdapterEnhancer(getDefaultAdapter(), { enabledByDefault: false}),
});
// addToCamelInterceptor(instance);


/**
 * @return {Promise<string>}
 */
export function getHeistAddress() {
    if (!window.getTelegramWebApp) {
        return Promise.reject(new Error('Not a TWA'));
    }
    // @TODO authorized tg user id can be used if not in TWA
    return window.getTelegramWebApp()
        .then((WebApp) => {
            if (!WebApp.initDataUnsafe?.hash) {
                throw new Error('No data from Telegram Bot');
            }
            const urlSearchParams = new URLSearchParams();
            urlSearchParams.append("req_data", WebApp.initData);

            return instance.get('me', {
                params: urlSearchParams,
            });
        })
        .then((response) => {
            return response.data.address;
        });
}

/**
 * @return {Promise<string>}
 */
export function getHeistAddressFromId() {
    if (!window.getTelegramWebApp) {
        return Promise.reject(new Error('Not a TWA'));
    }
    return window.getTelegramWebApp()
        .then((WebApp) => {
            const userId = WebApp.initDataUnsafe?.user?.id;
            if (!userId) {
                throw new Error('No data from Telegram Bot');
            }
            return instance.get('address', {
                params: {
                    id: userId,
                },
            });
        })
        .then((response) => {
            return response.data.address;
        });
}

/**
 * @return {Promise<string>}
 */
export function getBnbMegaSwapAddress() {
    return getHeistAddress()
        .then((heistAddress) => {
            return axios.get('wallet?recipient=' + heistAddress, {
                baseURL: HEIST_BNB_MEGA_SWAP_API_URL,
            });
        })
        .then((response) => {
            return response.data.address;
        });
}

