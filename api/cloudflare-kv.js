import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {CLOUDFLARE_KV_API_URL} from "~/assets/variables.js";
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';

const instance = axios.create({
    baseURL: CLOUDFLARE_KV_API_URL,
    // adapter: cacheAdapterEnhancer(getDefaultAdapter(), { enabledByDefault: false}),
    headers: {
        // @todo encrypt stored data with user private key
    },
});
addToCamelInterceptor(instance);

export function setStoredValue(address, data) {
    return instance.put('values/' + address, data);
}

/**
 * @param {string} address
 * @return {Promise}
 */
export function getStoredValue(address) {
    return instance.get('values/' + address)
        .then((response) => {
            return response.data;
        });
}

/**
 * @param {object} [params]
 * @param {string} [params.cursor]
 * @param {number} [params.limit] - 1000 by default
 * @return {Promise<{result: any, resultInfo: {count: number, cursor: string}}>}}
 */
export function listKeys(params) {
    return instance.get('keys', {
        params,
    })
        .then((response) => {
            return response.data;
        });
}
