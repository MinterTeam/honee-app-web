import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import axios from 'axios';
import {getPromiseWithResolvers} from '@shrpne/utils/src/promise-resolve.js';
import {wait} from '@shrpne/utils/src/wait.js';
import {NETWORK, MAINNET, HUB_NETWORK} from '~/assets/variables.js';

const isMainnet = NETWORK === MAINNET;

export const fiatPurchaseNetwork = isMainnet ? HUB_NETWORK.BSC : HUB_NETWORK.ETHEREUM;
const baseUrl = isMainnet ? 'https://api-instant.ramp.network/api/' : 'https://api-instant-staging-ropsten.supozu.com/api/';
const assetName = isMainnet ? 'BSC_BNB' : 'ETH';

export default function initPurchase({address, amount} = {}) {
    let purchaseStarted = false;

    const [purchasePromise, purchaseResolve, purchaseReject] = getPromiseWithResolvers();
    const [widgetPromise, widgetResolve, widgetReject] = getPromiseWithResolvers();

    window.location.href = `http://localhost:3000/?amount=${amount}&address=${address}`;



    return Promise.all([purchasePromise, widgetPromise]);
}

function subscribePurchase(id, secret) {
    return pollPurchaseStatus(id, secret);
}

/**
 * @param id
 * @param secret
 * @return {Promise<import('@ramp-network/ramp-instant-sdk').RampInstantPurchase>}
 */
function pollPurchaseStatus(id, secret) {
    return getPurchaseStatus(id, secret)
        .catch((error) => {
            console.log(error);
        })
        .then((purchase) => {
            const successStatusList = [
                // Crypto release started – transfer transaction or escrow release() tx was sent.
                'RELEASING',
                // Crypto asset was confirmed to be transferred to the buyer. A terminal state.
                'RELEASED',
            ];
            const failStatusList = [
                // The time to pay for the purchase was exceeded. A terminal state.
                'EXPIRED',
                // The purchase was cancelled and won't be continued. A terminal state.
                'CANCELLED',
            ];

            // no purchase when error
            if (purchase) {
                console.log('getPurchaseStatus', purchase.status);
                if (successStatusList.includes(purchase.status)) {
                    return purchase;
                } else if (failStatusList.includes(purchase.status)) {
                    const failMessageList = {
                        EXPIRED: 'Time to pay for the purchase was exceeded',
                        CANCELLED: 'Purchase was cancelled',
                    };
                    throw new Error(failMessageList[purchase.status]);
                }
            }

            return wait(10000).then(() => pollPurchaseStatus(id, secret));
        });
}


const api = axios.create({
    baseURL: baseUrl,
});

/**
 * @param id
 * @param secret
 * @return {Promise<import('@ramp-network/ramp-instant-sdk').RampInstantPurchase>}
 */
function getPurchaseStatus(id, secret) {
    return api.get(`host-api/purchase/${id}`, {
            params: {secret},
        })
        .then((response) => response.data);
}

function getAsset() {
    return api.get('host-api/assets', {
            params: {
                onlyEnabled: true,
                omitHidden: true,
            },
        })
        .then((response) => {
            const asset = response.data.assets.find((item) => item.symbol === assetName);
            if (asset) {
                return asset;
            } else {
                throw new Error(`Asset ${assetName} not found`);
            }
        });
}
