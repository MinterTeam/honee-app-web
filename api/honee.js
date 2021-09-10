import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {SUBSCRIBE_API_URL, SUBSCRIBE_API_PROJECT_NAME} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/to-camel.js';

const instance = axios.create({
    baseURL: SUBSCRIBE_API_URL,
    // adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});
addToCamelInterceptor(instance);

/**
 * @param {string} email
 * @return {Promise<Object>}
 */
export function subscribe(email) {
    return instance.post('user', {
        email,
        project_code: SUBSCRIBE_API_PROJECT_NAME,
    })
        .then((response) => response.data);
}
