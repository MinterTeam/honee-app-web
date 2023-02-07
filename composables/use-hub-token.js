import {reactive, computed} from 'vue';
import {findHubCoinItem, findTokenInfo} from '~/api/hub.js';
import {HUB_CHAIN_BY_ID, NATIVE_COIN_ADDRESS} from '~/assets/variables.js';
import useHubOracle from '~/composables/use-hub-oracle.js';

/**
 * return WETH/WBNB address
 * @param {number} chainId
 * @return {string|void}
 */
function getWrappedNativeContractAddress(chainId) {
    return HUB_CHAIN_BY_ID[chainId]?.wrappedNativeContractAddress;
}

export default function useHubToken() {
    const {initPromise, hubTokenList, hubPriceList} = useHubOracle({
        subscribeTokenList: true,
        subscribePriceList: true,
    });

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

    /**
     * @type {ComputedRef<HubCoinItem>}
     */
    const hubCoin = computed(() => {
        return findHubCoinItem(hubTokenList.value, props.tokenSymbol);
    });
    /**
     * @type {ComputedRef<TokenInfo.AsObject>}
     */
    const tokenData = computed(() => {
        return findTokenInfo(hubTokenList.value, props.tokenSymbol, props.chainId);
    });
    const tokenContractAddress = computed(() => tokenData.value?.externalTokenId.toLowerCase() || '');
    // fixed for 1inch and swapAndDepositToHubProxy
    const tokenContractAddressFixNative = computed(() => {
        const isNative = HUB_CHAIN_BY_ID[props.chainId] && props.tokenSymbol === HUB_CHAIN_BY_ID[props.chainId].coinSymbol;
        if (isNative) {
            return NATIVE_COIN_ADDRESS;
        } else {
            return tokenContractAddress.value;
        }
    });
    const tokenDecimals = computed(() => tokenData.value ? Number(tokenData.value.externalDecimals) : undefined);
    const isNativeToken = computed(() => tokenContractAddress.value === getWrappedNativeContractAddress(props.chainId));
    // price in dollar
    const tokenPrice = computed(() => {
        const priceItem = hubPriceList.value.find((item) => item.name === hubCoin.value?.denom);
        return priceItem ? priceItem.value : '0';
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
        tokenContractAddressFixNative,
        tokenDecimals,
        isNativeToken,

        setHubTokenProps: setProps,
    };
}

