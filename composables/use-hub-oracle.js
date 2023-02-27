import {ref, computed, reactive, set, watch} from 'vue';
import isEqual from 'lodash-es/isEqual.js';
import Big from '~/assets/big.js';
import {findNativeCoin, getOracleCoinList, getOracleFee, getOraclePriceList} from '~/api/hub.js';
import {HUB_NETWORK, HUB_WITHDRAW_SPEED, MAINNET, NETWORK} from '~/assets/variables.js';
import usePolling from '~/composables/use-polling.js';

// workaround for `set` not trigger computed properly
// @see https://github.com/vuejs/composition-api/issues/580
/**
 * @return {Record<HUB_NETWORK, DestinationFee>}
 */
function getInitialChainData() {
    return Object.fromEntries(Object.values(HUB_NETWORK).map((hubNetworkSlug) => [hubNetworkSlug, getEmptyItem()]));

    function getEmptyItem() {
        return {};
    }
}

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
 * @type {UnwrapNestedRefs<Record<HUB_NETWORK, DestinationFee>>}
 */
const destinationFeeMap = reactive(getInitialChainData());


/**
 * Gas price in external network in gwei
 * @type {ComputedRef<Record<HUB_NETWORK, (number|string)>>}
 */
const gasPriceMap = computed(() => {
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
            // check isEqual to not trigger computed recalculation
            if (!isEqual(tokenList.value, result)) {
                tokenList.value = Object.freeze(result);
            }
            return tokenList.value;
        });
}

function fetchPriceList() {
    return getOraclePriceList()
        .then((result) => {
            // check isEqual to not trigger computed recalculation
            if (!isEqual(priceList.value, result)) {
                priceList.value = Object.freeze(result);
            }
            return priceList.value;
        });
}

/**
 * @param {HUB_NETWORK} hubNetwork
 * @return {Promise<void>}
 */
function fetchDestinationFee(hubNetwork) {
    if (!hubNetwork) {
        return Promise.resolve();
    }
    return getOracleFee(hubNetwork)
        .then((result) => {
            const oldFee = destinationFeeMap[hubNetwork]?.[HUB_WITHDRAW_SPEED.FAST];
            const isIncreased = oldFee && Number(result[HUB_WITHDRAW_SPEED.FAST]) > Number(oldFee);
            result = {...result, isIncreased};
            // check isEqual to not trigger computed recalculation
            if (!isEqual(destinationFeeMap[hubNetwork], result)) {
                set(destinationFeeMap, hubNetwork, Object.freeze(result));
            }
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
        /** @type {HUB_NETWORK_SLUG|''} */
        hubNetworkSlug: '',
        fixInvalidGasPriceWithDummy: true,
    });

    /**
     * @param {Partial<props>} newProps
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

    /**
     * gas price in gwei for selected network
     * @type {ComputedRef<number|string>}
     */
    const networkGasPrice = computed(() => {
        let gasPriceGwei = gasPriceMap.value[props.hubNetworkSlug];
        if (!(gasPriceGwei > 0)) {
            gasPriceGwei = props.fixInvalidGasPriceWithDummy ? 100 : 0;
        }

        // return NETWORK === MAINNET ? gasPriceGwei : 5;
        // eslint-disable-next-line no-unreachable
        return NETWORK === MAINNET ? gasPriceGwei : new Big(gasPriceGwei).times(10).toNumber();
    });
    /**
     * available coins for selected network
     * @type {ComputedRef<Array<HubCoinItem>>}
     */
    const networkHubCoinList = computed(() => {
        return tokenList.value.filter((item) => !!item[props.hubNetworkSlug]);
    });
    /**
     *
     * @type {ComputedRef<HubCoinItem>}
     */
    const networkNativeCoin = computed(() => {
        return findNativeCoin(tokenList.value, props.hubNetworkSlug);
    });
    /**
     * Withdraw tx fee for destination network in dollars (e.g. fee to send bsc tx from hub to recipient)
     * @type {ComputedRef<DestinationFee>}
     */
    const networkDestinationFee = computed(() => {
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
        gasPrice: gasPriceMap,
        // requires hubNetworkSlug
        networkGasPrice,
        networkHubCoinList,
        networkNativeCoin,
        hubDestinationFee: networkDestinationFee,

        setHubOracleProps: setProps,
        fetchHubTokenList: fetchTokenList,
        fetchHubPriceList: fetchPriceList,
        fetchHubDestinationFee: () => {
            return fetchDestinationFee(props.hubNetworkSlug)
                .then(() => networkDestinationFee.value);
        },
    };
}

/**
 * @typedef {QueryEthFeeResponse.AsObject} DestinationFee
 * @property {boolean} isIncreased
 */
