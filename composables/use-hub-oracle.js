import {ref, computed, reactive, set, watch} from '@vue/composition-api';
import {getOracleCoinList, getOracleFee, getOraclePriceList} from '~/api/hub.js';
import {HUB_NETWORK, HUB_WITHDRAW_SPEED} from '~/assets/variables.js';
import usePolling from '~/composables/use-polling.js';

/**
 * @type {Ref<Array<HubCoinItem>>}
 */
const tokenList = ref([]);
/**
 * @type {Ref<Array<HubPriceItem>>}
 */
const priceList = ref([]);

/**
 * Withdraw tx fee for destination network in dollars (e.g. fee to send bsc tx from hub to recipient)
 * @type {UnwrapRef<Object.<HUB_NETWORK, DestinationFee>>}
 */
const destinationFeeMap = reactive({});


/**
 * Gas price in external network in gwei
 * @type {ComputedRef<Object.<HUB_NETWORK, (number|string)>>}
 */
const gasPrice = computed(() => {
    const entries = Object.values(HUB_NETWORK)
        .map((network) => {
            const priceItem = priceList.value.find((item) => item.name === `${network}/gas`);
            return [network, priceItem?.value];
        });
    return Object.fromEntries(entries);
});


//@TODO don't fire new fetch if one is already processing
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

/**
 * @param {HUB_NETWORK} hubNetwork
 * @return {Promise<undefined>}
 */
function fetchDestinationFee(hubNetwork) {
    if (!hubNetwork) {
        return Promise.resolve();
    }
    return getOracleFee(hubNetwork)
        .then((result) => {
            const oldFee = destinationFeeMap[hubNetwork]?.[HUB_WITHDRAW_SPEED.FAST];
            const isIncreased = oldFee && Number(result[HUB_WITHDRAW_SPEED.FAST]) > Number(oldFee);
            set(destinationFeeMap, hubNetwork, Object.freeze({...result, isIncreased}));
        });
}

const TOKEN_LIST_INTERVAL = 60 * 1000;
const PRICE_LIST_INTERVAL = 15 * 1000;
const DESTINATION_FEE_INTERVAL = 30 * 1000;


export default function useHubOracle({
    subscribeTokenList: isSubscribeTokenList = false,
    subscribePriceList: isSubscribePriceList = false,
    subscribeDestinationFee: isSubscribeDestinationFee = false,
} = {}) {

    const props = reactive({
        hubNetworkSlug: '',
    });

    /**
     * @param {{hubNetworkSlug?: HUB_NETWORK}} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
    }

    const promiseList = [];

    if (isSubscribeTokenList) {
        promiseList.push(fetchTokenList());
        usePolling('hub-token-list', fetchTokenList, TOKEN_LIST_INTERVAL);
    }
    if (isSubscribePriceList) {
        promiseList.push(fetchPriceList());
        usePolling('hub-price-list', fetchPriceList, PRICE_LIST_INTERVAL);
    }

    if (isSubscribeDestinationFee) {
        const {updatePolling} = usePolling();
        watch(() => props.hubNetworkSlug, (newVal, oldVal) => {
            fetchDestinationFee(newVal);
            updatePolling(oldVal, newVal, () => fetchDestinationFee(newVal), DESTINATION_FEE_INTERVAL);
        });
    }

    const destinationFee = computed(() => {
        if (destinationFeeMap[props.hubNetworkSlug]) {
            return destinationFeeMap[props.hubNetworkSlug];
        } else {
            return {
                [HUB_WITHDRAW_SPEED.MIN]: 0,
                [HUB_WITHDRAW_SPEED.FAST]: 0,
            };
        }
    });

    return {
        initPromise: Promise.all(promiseList),

        hubTokenList: tokenList,
        hubPriceList: priceList,
        gasPrice,
        // requires hubNetworkSlug
        hubDestinationFee: destinationFee,

        setHubOracleProps: setProps,
        fetchHubTokenList: fetchTokenList,
        fetchHubPriceList: fetchPriceList,
        fetchHubDestinationFee: () => {
            return fetchDestinationFee(props.hubNetworkSlug)
                .then(() => destinationFee.value);
        },
    };
}
