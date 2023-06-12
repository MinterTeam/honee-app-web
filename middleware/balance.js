import Centrifuge from 'centrifuge/src';
import {prepareBalance} from '~/api/explorer.js';
import {EXPLORER_RTM_URL} from "~/assets/variables";
import {toCamel} from '~/assets/axios-to-camel.js';
import {setLastUpdateTime} from '~/composables/use-last-update-time.js';

/** @type {Centrifuge} */
let centrifuge;
let subscribedAddress = '';

export default function({app, store, redirect}) {
    if (process.server) {
        return Promise.resolve();
    }

    if (store.getters.address && store.state.onLine) {
        // init only once per auth address
        if (centrifuge && subscribedAddress === store.getters.address) {
            return Promise.resolve();
        }
        const address = store.getters.address;
        // store.commit('SET_LAST_UPDATE_TIME', Date.now());
        // wait for balance, bc its data need for all pages
        return store.dispatch('FETCH_BALANCE')
            .then(() => {
                // fetch resolved after auth changed
                if (address !== store.getters.address) {
                    return;
                }
                if (!centrifuge) {
                    centrifuge = new Centrifuge(EXPLORER_RTM_URL, {
                        // debug: true,
                        // user: connectData.user ? connectData.user : '',
                        // timestamp: connectData.timestamp.toString(),
                        // token: connectData.token,
                        // sockjs: SockJS,
                    });
                }
                if (subscribedAddress && subscribedAddress !== store.getters.address) {
                    centrifuge.disconnect();
                }

                subscribedAddress = store.getters.address;
                centrifuge.subscribe(store.getters.address, (response) => {
                    const balance = toCamel(response.data);
                    prepareBalance(balance)
                        .then((preparedBalance) => {
                            store.commit('SET_BALANCE', preparedBalance);
                            store.commit('SET_BALANCE_TIMESTAMP', (new Date()).toISOString());
                        });
                })
                    .on('subscribe', (context) => {
                        if (context.isResubscribe && !context.recovered) {
                            store.dispatch('FETCH_BALANCE');
                        }
                    });

                centrifuge.subscribe("blocks", (response) => {
                    const newBlock = toCamel(response.data);
                    // block timestamp is block's precommit time, fixing it
                    const fixedTimestamp = new Date(newBlock.timestamp).getTime() + Math.round(newBlock.blockTime * 1000);
                    setLastUpdateTime(fixedTimestamp);
                });

                centrifuge.connect();
            });
    }

    // not authorized, cleanup
    if (centrifuge) {
        centrifuge.disconnect();
        centrifuge = null;
        subscribedAddress = '';
    }

    return Promise.resolve();
}
