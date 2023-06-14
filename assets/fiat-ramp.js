/**
 * https://docs.ramp.network/useful-links/
 * https://ramp.notion.site/ramp/Integration-FAQ-3208ceccaa5648ac9b9dc9cbf8d61289#cbdd99ead74f4c88a5be56469121ee66
 */
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import axios from 'axios';
import {getPromiseWithResolvers} from '@shrpne/utils/src/promise-resolve.js';
import {wait} from '@shrpne/utils/src/wait.js';
import {NETWORK, MAINNET, HUB_NETWORK} from '~/assets/variables.js';

const isMainnet = NETWORK === MAINNET;

export const fiatRampPurchaseNetwork = isMainnet ? HUB_NETWORK.BSC : HUB_NETWORK.ETHEREUM;
const baseUrl = isMainnet ? 'https://api-instant.ramp.network/api/' : 'https://api-instant-staging-ropsten.supozu.com/api/';
const hostApiKey = isMainnet ? '74s63rodmpfn97jat9ndhsn2d5q5qwv6c2g5xgco' : '484a2d4z8r2tgh5wsvn736e3zp2jzct5kqnh7fkd';
const assetName = isMainnet ? 'BSC_BNB' : 'ETH';

export default function initPurchase({userAddress, swapAmount} = {}) {
    let purchaseStarted = false;

    const [purchasePromise, purchaseResolve, purchaseReject] = getPromiseWithResolvers();
    const [widgetPromise, widgetResolve, widgetReject] = getPromiseWithResolvers();

    new RampInstantSDK({
        hostApiKey,
        hostAppName: 'Honee',
        hostLogoUrl: 'https://my.honee.app/img/logo-honee.svg',
        swapAsset: assetName,
        swapAmount/*: isMainnet ? swapAmount : undefined*/,
        // fiatValue: isMainnet ? undefined : 10,
        // fiatCurrency: isMainnet ? undefined : 'EUR',
        userAddress,
        // only specify the url if you want to use testnet widget versions,
        url: isMainnet ? undefined : 'https://ri-widget-staging-ropsten.firebaseapp.com/',
        selectedCountryCode: isMainnet ? undefined : 'TEST',
        // use variant: 'auto' for automatic mobile / desktop handling,
        // 'hosted-auto' for automatic mobile / desktop handling in new window,
        // 'mobile' to force mobile version
        // 'desktop' to force desktop version (default)
        variant: 'auto',
    })
        .on('*', console.log)
        .on('PURCHASE_CREATED', (event) => {
            //@TODO validate `asset`, `cryptoAmount`, and `receiverAddress` (user may change predefined values)
            purchaseStarted = true;
            console.log('PURCHASE_CREATED', event.payload.purchase);
            //@TODO expose id, secret and status, so user can see status and link to purchase details
            // https://ri-dashboard-staging-ropsten.firebaseapp.com/#/details/skuvwdrrryashf7?secret=ofmnvjz66dxaamab
            subscribePurchase(event.payload.purchase.id, event.payload.purchase.purchaseViewToken)
                .then(purchaseResolve)
                .catch(purchaseReject);
        })
        .on('WIDGET_CLOSE', (event) => {
            if (purchaseStarted) {
                widgetResolve();
            } else {
                widgetReject(new Error('Purchase canceled by user'));
            }
        })
        .show();

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
