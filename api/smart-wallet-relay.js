import axios from 'axios';
// import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {SMART_WALLET_RELAY_API_URL} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';

const instance = axios.create({
    baseURL: SMART_WALLET_RELAY_API_URL,
    // adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});
addToCamelInterceptor(instance);

// const fastCache = new Cache({maxAge: 5 * 1000});

/**
 * @param {SmartWalletRelaySubmitTxPayload} payload
 * @return {Promise<SmartWalletRelaySubmitTxResult>}
 */
export function submitRelayTx(payload) {
    return instance.post('submit_tx', payload, {
            // cache: fastCache,
        })
        .then((response) => {
            return response.data;
        });
}


/**
 * @param {string} inputTxHash
 * @return {Promise<SmartWalletRelayTxStatus>}
 */
export function getRelayTxStatus(inputTxHash) {
    return instance.get(`tx_status/${inputTxHash}`, {
            // cache: fastCache,
        })
        .then((response) => {
            return response.data;
        });
}

/**
 * @enum {string}
 */
export const SMART_WALLET_RELAY_TX_STATUS = {
    NOT_FOUND: 'not_found',
    EXECUTED: 'executed',
    FAILED: 'failed',
};


/**
 * @typedef {object} SmartWalletRelaySubmitTxPayload
 * @property {string} a - smart wallet address (or factory address if createAndCall for new wallet)
 * @property {string} d - data (base64 encoded)
 * @property {string} gp - gas price in wei
 * @property {number} gl -gas limit
 */

/**
 * @typedef {object} SmartWalletRelayTxStatus
 * @property {SMART_WALLET_RELAY_TX_STATUS} status
 * @property {string} [reason] - if failed
 * @property {string} [txHash] - out tx hash if executed
 */

/**
 * @typedef {object} SmartWalletRelaySubmitTxResult
 * @property {string} hash - 64 symbol hex string (32 bytes)
 */

