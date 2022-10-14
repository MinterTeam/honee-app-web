import {reactive, computed} from '@vue/composition-api';
import Big from '~/assets/big.js';
import {findHubCoinItem, findNativeCoin, findTokenInfo} from '~/api/hub.js';
import {HUB_CHAIN_BY_ID, MAINNET, NETWORK} from '~/assets/variables.js';
import useHubOracle from '~/composables/use-hub-oracle.js';

const {initPromise, hubTokenList, hubPriceList, gasPrice} = useHubOracle({
    subscribeTokenList: true,
    subscribePriceList: true,
});

/**
 * return WETH/WBNB address
 * @param {number} chainId
 * @return {string|void}
 */
function getWrappedNativeContractAddress(chainId) {
    return HUB_CHAIN_BY_ID[chainId]?.wrappedNativeContractAddress;
}

export default function useHubToken() {
    const props = reactive({
        chainId: 0,
        tokenSymbol: '',
    });

    /**
     * @param {{tokenSymbol?: string, chainId?: number}} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
    }

    const hubNetworkSlug = computed(() => HUB_CHAIN_BY_ID[props.chainId]?.hubNetworkSlug);
    /**
     * @type {import('@vue/composition-api').ComputedRef<HubCoinItem>}
     */
    const hubCoin = computed(() => {
        return findHubCoinItem(hubTokenList.value, props.tokenSymbol);
    });
    /**
     * @type {import('@vue/composition-api').ComputedRef<TokenInfo.AsObject>}
     */
    const tokenData = computed(() => {
        return findTokenInfo(hubTokenList.value, props.tokenSymbol, props.chainId);
    });
    const tokenContractAddress = computed(() => tokenData.value?.externalTokenId.toLowerCase() || '');
    const tokenDecimals = computed(() => tokenData.value ? Number(tokenData.value.externalDecimals) : undefined);
    const isNativeToken = computed(() => tokenContractAddress.value === getWrappedNativeContractAddress(props.chainId));
    // price in dollar
    const tokenPrice = computed(() => {
        const priceItem = hubPriceList.value.find((item) => item.name === hubCoin.value?.denom);
        return priceItem ? priceItem.value : '0';
    });
    /**
     * gas price in gwei for selected network
     * @type {ComputedRef<number|string>}
     */
    const networkGasPrice = computed(() => {
        let gasPriceGwei = gasPrice.value[hubNetworkSlug.value];
        if (!(gasPriceGwei > 0)) {
            gasPriceGwei = 100;
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
        return hubTokenList.value.filter((item) => !!item[hubNetworkSlug.value]);
    });
    /**
     *
     * @type {ComputedRef<HubCoinItem>}
     */
    const networkNativeCoin = computed(() => {
        return findNativeCoin(hubTokenList.value, hubNetworkSlug.value);
    });


    return {
        // reexport
        initPromise,

        // computed
        // requires only tokenSymbol
        hubCoin,
        tokenPrice,
        // requires tokenSymbol and chainId
        tokenData,
        tokenContractAddress,
        tokenDecimals,
        isNativeToken,
        // requires only chainId
        networkGasPrice,
        networkHubCoinList,
        networkNativeCoin,

        setHubTokenProps: setProps,
    };
}

