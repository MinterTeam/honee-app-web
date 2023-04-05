import axios from 'axios';
// import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {HUB_CHAIN_BY_ID, SMART_WALLET_RELAY_API_URL} from "~/assets/variables.js";
import {getDefaultAdapter} from '~/assets/axios-default-adapter.js';
import addToCamelInterceptor from '~/assets/axios-to-camel.js';
import {createCancelableSignal} from '~/assets/utils/cancelable-signal.js';
import CancelError from '~/assets/utils/error-cancel.js';
import {wait} from '~/assets/utils/wait.js';

const instance = axios.create({
    baseURL: SMART_WALLET_RELAY_API_URL,
    // adapter: cacheAdapterEnhancer(getDefaultAdapter(), { enabledByDefault: false}),
});
addToCamelInterceptor(instance);

// const fastCache = new Cache({maxAge: 5 * 1000});

/**
 * @param {ChainId} chainId
 * @param {SmartWalletRelaySubmitTxPayload} payload
 * @return {Promise<{hash: string}>}
 */
export function submitRelayTx(chainId, payload) {
    const hubNetworkSlug = HUB_CHAIN_BY_ID[chainId].hubNetworkSlug;
    return instance.post(`${hubNetworkSlug}/submit_tx`, payload, {
            // cache: fastCache,
        })
        .then((response) => {
            return response.data;
        });
}


/**
 * @param {ChainId} chainId
 * @param {string} inputTxHash
 * @return {Promise<SmartWalletRelayTxStatus>}
 */
export function getRelayTxStatus(chainId, inputTxHash) {
    const hubNetworkSlug = HUB_CHAIN_BY_ID[chainId].hubNetworkSlug;
    return instance.get(`${hubNetworkSlug}/tx_status/${inputTxHash}`, {
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
 * @param {ChainId} chainId
 * @param {string} inputTxHash
 * @return {[promise: Promise<SmartWalletRelayTxStatus>, cancel: CancelableSignal['cancel']]}
 */
export function waitRelayTxSuccess(chainId, inputTxHash) {
    const signal = createCancelableSignal();

    return [
        _waitRelayTxSuccess(chainId, inputTxHash, signal),
        signal.cancel,
    ];
}

/**
 * @param {ChainId} chainId
 * @param {string} inputTxHash
 * @param {CancelableSignal} signal
 * @return {Promise<SmartWalletRelayTxStatus>}
 * @private
 */
function _waitRelayTxSuccess(chainId, inputTxHash, signal) {
    return getRelayTxStatus(chainId, inputTxHash)
        .then((data) => {
            // Sending was canceled
            if (signal.isCanceled) {
                return Promise.reject(new CancelError());
            }

            if (data.status === SMART_WALLET_RELAY_TX_STATUS.EXECUTED) {
                // success
                return data;
            } else if (data.status === SMART_WALLET_RELAY_TX_STATUS.FAILED && data.reason === 'execution reverted: Transaction timed out') {
                // fail
                return Promise.reject(new Error(data.reason));
            } else {
                return wait(10000).then(() => _waitRelayTxSuccess(chainId, inputTxHash, signal));
            }
        });
}


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
 * @property {string} [tx] - if found, stringified json of relay tx params
 * @property {string} [reason] - if failed
 * @property {string} [txHash] - out tx hash if executed
 */

/**
 * Hash of some fields of smart-wallet tx
 * @typedef {object} SmartWalletRelaySubmitTxResult
 * @property {string} hash - 64 symbol hex string (32 bytes)
 * @property {number} callCount - number of calls in combined tx
 */

