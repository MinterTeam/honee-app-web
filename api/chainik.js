import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {CHAINIK_API_URL, NETWORK, MAINNET} from "~/assets/variables.js";
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';

const instance = axios.create({
    baseURL: CHAINIK_API_URL,
    adapter: cacheAdapterEnhancer(getDefaultAdapter(), { enabledByDefault: false}),
});
addToCamelInterceptor(instance);

// 10 min cache
const coinsCache = new Cache({ttl: 10 * 60 * 1000, max: 100});
/**
 * @return {Promise<Object.<number, string>>}
 */
export function getCoinIconList() {
    if (NETWORK !== MAINNET) {
        return Promise.resolve({});
    }
    return instance.get('coins.json', {
            cache: coinsCache,
        })
        .then((response) => {
            const coins = response.data;
            /** @type {Record<number, string>} */
            let iconMap = {};
            coins.forEach((coin) => {
                iconMap[coin.id] = coin.icon;
            });
            return iconMap;
        });
}
