import { ref, computed, onUnmounted } from '@vue/composition-api';
import {getOracleCoinList, getOraclePriceList} from '~/api/hub.js';
import {HUB_CHAIN_ID} from '~/assets/variables.js';

/**
 * @type {Ref<Array<HubCoinItem>>}
 */
const tokenList = ref([]);
/**
 * @type {Ref<Array<HubPriceItem>>}
 */
const priceList = ref([]);


/**
 *
 * @type {ComputedRef<Object.<HUB_CHAIN_ID, (number|string)>>}
 */
const gasPrice = computed(() => {
    const entries = Object.values(HUB_CHAIN_ID)
        .map((network) => {
            const priceItem = priceList.value.find((item) => item.name === `${network}/gas`);
            return [network, priceItem];
        });
    return Object.fromEntries(entries);
});


function fetchTokenList() {
    return getOracleCoinList()
        .then((result) => {
            tokenList.value = Object.freeze(result);
            return tokenList.value;
        });
}

function fetchPriceList() {
    return getOraclePriceList()
        .then((result) => {
            priceList.value = Object.freeze(result);
            return priceList.value;
        });
}

let timerToken;
let timerPrice;
let subscribeCount = {
    token: 0,
    price: 0,
};
function subscribeTokenList() {
    subscribeCount.token++;
    if (subscribeCount.token === 1) {
        timerToken = setInterval(fetchTokenList, 60 * 1000);
    }
}
function subscribePriceList() {
    subscribeCount.price++;
    if (subscribeCount.price === 1) {
        timerPrice = setInterval(fetchPriceList, 15 * 1000);
    }
}
function unsubscribeTokenList() {
    subscribeCount.token--;
    if (subscribeCount.token === 0) {
        clearInterval(timerToken);
    }
}
function unsubscribePriceList() {
    subscribeCount.price--;
    if (subscribeCount.price === 0) {
        clearInterval(timerToken);
    }
}


export default function useHubTokenData({
    subscribeTokenList: isSubscribeTokenList = false,
    subscribePriceList: isSubscribePriceList = false,
} = {}) {
    fetchTokenList();
    fetchPriceList();

    if (isSubscribeTokenList) {
        subscribeTokenList();
        onUnmounted(unsubscribeTokenList);
    }
    if (isSubscribePriceList) {
        subscribePriceList();
        onUnmounted(unsubscribePriceList);
    }

    return {
        hubTokenList: tokenList,
        hubPriceList: priceList,
        gasPrice,

        fetchHubTokenList: fetchTokenList,
        fetchHubPriceList: fetchPriceList,
    };
}
