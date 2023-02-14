import {reactive, computed, watch, set} from 'vue';
import {findHubCoinItem, findHubCoinItemByTokenAddress, findTokenInfo} from '~/api/hub.js';
import {getTokenDecimals} from '~/api/web3.js';
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
        tokenAddress: '',
        tokenDecimals: 0,
    });

    const state = reactive({
        decimals: {},
    });

    /**
     * @param {props} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
    }

    /**
     * @type {ComputedRef<HubCoinItem>}
     */
    const hubCoin = computed(() => {
        if (props.tokenAddress) {
            return findHubCoinItemByTokenAddress(hubTokenList.value, props.tokenAddress, props.chainId);
        } else {
            return findHubCoinItem(hubTokenList.value, props.tokenSymbol);
        }
    });
    /**
     * @type {ComputedRef<TokenInfo.AsObject>}
     */
    const tokenData = computed(() => {
        return hubCoin.value?.[HUB_CHAIN_BY_ID[props.chainId]?.hubNetworkSlug];
    });
    const tokenContractAddress = computed(() => {
        if (props.tokenAddress) {
            if (props.tokenAddress.length === 42 && props.tokenAddress.indexOf('0x') === 0) {
                return props.tokenAddress.toLowerCase();
            } else {
                return '';
            }
        }
        return tokenData.value?.externalTokenId.toLowerCase() || '';
    });
    // fixed for 1inch and swapAndDepositToHubProxy
    const tokenContractAddressFixNative = computed(() => {
        // const isNative = HUB_CHAIN_BY_ID[props.chainId] && props.tokenSymbol === HUB_CHAIN_BY_ID[props.chainId].coinSymbol;
        if (isNativeToken.value) {
            return NATIVE_COIN_ADDRESS;
        } else {
            return tokenContractAddress.value;
        }
    });
    const tokenDecimals = computed(() => {
        if (props.tokenDecimals) {
            return props.tokenDecimals;
        }
        return tokenData.value
            ? Number(tokenData.value.externalDecimals)
            : state.decimals[props.chainId]?.[tokenContractAddress.value];
    });
    const isNativeToken = computed(() => {
        return tokenContractAddress.value === '0x0000000000000000000000000000000000000000'
            || tokenContractAddress.value === NATIVE_COIN_ADDRESS
            || tokenContractAddress.value === getWrappedNativeContractAddress(props.chainId);
    });
    // price in dollar
    const tokenPrice = computed(() => {
        const priceItem = hubPriceList.value.find((item) => item.name === hubCoin.value?.denom);
        return priceItem ? priceItem.value : '0';
    });

    watch([
        () => props.chainId,
        hubTokenList,
        tokenData,
        tokenContractAddress,
        isNativeToken,
    ], (newVal) => {
        // already known
        if (props.tokenDecimals) {
            return;
        }
        // invalid props
        if (!props.chainId || !tokenContractAddress.value) {
            return;
        }
        // tokenList not loaded yet or tokenData found - get decimals from it
        if (!hubTokenList.value.length || tokenData.value) {
            return;
        }
        if (isNativeToken.value) {
            saveDecimals(props.chainId, tokenContractAddress.value, 18);
        } else {
            const chainId = props.chainId;
            const tokenContractAddressValue = tokenContractAddress.value;
            getTokenDecimals(tokenContractAddressValue, chainId)
                .then((decimals) => {
                    saveDecimals(chainId, tokenContractAddressValue, decimals);
                });
        }
    });

    function saveDecimals(chainId, tokenContractAddressValue, value) {
        if (!state.decimals[chainId]) {
            set(state.decimals, chainId, {});
        }
        set(state.decimals[chainId], tokenContractAddressValue, value);
    }


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

