import { ref, reactive, computed, watch, set} from 'vue';
import Big from '~/assets/big.js';
import {BSC_CHAIN_ID, ETHEREUM_CHAIN_ID, HUB_CHAIN_BY_ID, HUB_CHAIN_DATA} from '~/assets/variables.js';
import {arrayToMap} from '~/assets/utils/collection.js';
import {wait} from '~/assets/utils/wait.js';
import CancelError from '~/assets/utils/error-cancel.js';
import {getWalletBalances} from '~/api/web3-moralis.js';

// workaround for `set` not trigger computed properly
// @see https://github.com/vuejs/composition-api/issues/580
function getInitialChainData() {
    return Object.fromEntries(Object.values(HUB_CHAIN_DATA).map((item) => [item.chainId, getEmptyItem()]));

    function getEmptyItem() {
        return undefined;
    }
}

/**
 * @type {UnwrapNestedRefs<Record<ChainId, Array<TokenBalanceItem>>>}
 */
const web3Balance = reactive(getInitialChainData());

export default function useWeb3AddressBalance() {
    // const {tokenData, tokenContractAddress, tokenDecimals, isNativeToken, setHubTokenProps} = useHubToken();

    const props = reactive({
        accountAddress: '',
        /** @type {ChainId} */
        chainId: 0,
    });

    /**
     *
     * @param {Partial<props>} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
        // setHubTokenProps(newProps);
    }


    /**
     * @type {ComputedRef<Array<TokenBalanceItem>>}
     */
    const balanceList = computed(() => {
        return web3Balance[props.chainId] || [];
    });

    // const nativeBalance = computed(() => {
    //     if (isNativeToken.value) {
    //         return web3Balance[props.chainId]?.[0] || 0;
    //     }
    //
    //     return 0;
    // });
    // const wrappedBalance = computed(() => {
    //     if (isNativeToken.value) {
    //         return web3Balance[props.chainId]?.[tokenContractAddress.value] || 0;
    //     }
    //
    //     return 0;
    // });
    // const balance = computed(() => {
    //     if (isNativeToken.value) {
    //         return new Big(wrappedBalance.value).plus(nativeBalance.value).toString();
    //     } else {
    //         return web3Balance[props.chainId]?.[tokenContractAddress.value] || 0;
    //     }
    // });

    // clean balances on account change
    watch(() => props.accountAddress, () => {
        Object.keys(web3Balance).forEach((chainId) => {
            web3Balance[chainId] = undefined;
        });
    });

    watch(props, (newVal, oldVal) => {
        if (!props.accountAddress) {
            return;
        }
        if (props.chainId === ETHEREUM_CHAIN_ID || props.chainId === BSC_CHAIN_ID) {
            updateAddressBalance();
        }
    }, {immediate: true});

    /**
     * @typedef {object} TokenBalanceItem
     * @property {HUB_NETWORK_SLUG} hubNetworkSlug
     * @property {string} tokenContractAddress
     * @property {string} tokenSymbol
     * @property {string} tokenName
     * @property {string|number} amount
     * @property {number} decimals
     * @property {import('@moralisweb3/common-evm-utils').Erc20Value} moralisItem
     * @property {string} id
     * @property {string} search
     */

    /**
     * @return {Promise<Array<TokenBalanceItem>>} - list of updated balances
     */
    async function updateAddressBalance() {
        const chainId = props.chainId;

        return getWalletBalances(chainId, props.accountAddress)
            .then((result) => {
                console.log(result);
                const oldBalanceList = web3Balance[chainId];
                /** @type {HUB_NETWORK_SLUG} */
                const hubNetworkSlug = HUB_CHAIN_BY_ID[chainId].hubNetworkSlug;
                const tokenList = result.map((item) => {
                    return {
                        hubNetworkSlug,
                        tokenContractAddress: item.token.contractAddress.lowercase,
                        tokenSymbol: item.token.symbol,
                        tokenName: item.token.name,
                        amount: item.value,
                        decimals: item.token.decimals,
                        moralisItem: item,
                        id: `${item.token.contractAddress.lowercase}-${hubNetworkSlug}`,
                        search: item.token.symbol + hubNetworkSlug,
                    };
                });

                set(web3Balance, chainId, Object.freeze(tokenList));

                if (oldBalanceList?.length > 0) {
                    const oldTokenMap = arrayToMap(oldBalanceList, 'tokenContractAddress');
                    return tokenList
                        .filter((tokenBalanceItem) => {
                            return new Big(tokenBalanceItem.amount).gt(oldTokenMap[tokenBalanceItem.tokenContractAddress]?.amount || 0);
                        });
                } else {
                    return [];
                }
            })
            .catch((error) => {
                if (props.chainId === chainId) {
                    //@TODO expose tokenError string
                    // state.tokenError = 'Can\'t get balance';
                    throw error;
                }
                return [];
            });
    }

    /**
     * @return {Promise<Array<TokenBalanceItem>>&{canceler: function}}
     */
    function waitBalanceUpdate() {
        let promiseReject;
        let isCanceled = {value: false};
        let promise = new Promise((resolve, reject) => {
            promiseReject = reject;
            _waitBalanceUpdate(isCanceled).then(resolve).catch(reject);
        });
        promise.canceler = () => {
            promiseReject(new CancelError());
            isCanceled.value = true;
        };
        // keep custom `canceler` property during chaining
        // consider https://stackoverflow.com/a/41797215/4936667 or https://stackoverflow.com/a/48500142/4936667
        const originalThen = promise.then;
        const originalCatch = promise.catch;
        promise.then = function(...args) {
            const newPromise = originalThen.call(promise, ...args);
            newPromise.canceler = promise.canceler;
            return newPromise;
        };
        promise.catch = function(...args) {
            const newPromise = originalCatch.call(promise, ...args);
            newPromise.canceler = promise.canceler;
            return newPromise;
        };
        return promise;
    }

    /**
     * @param {{value: boolean}} isCanceled
     * @return {Promise<Array<TokenBalanceItem>>}
     * @private
     */
    function _waitBalanceUpdate(isCanceled) {
        return updateAddressBalance()
            .then((updatedList) => {
                // Sending was canceled
                if (isCanceled.value) {
                    return Promise.reject(new CancelError());
                }
                if (updatedList.length > 0) {
                    return updatedList;
                } else {
                    return wait(30000).then(() => _waitBalanceUpdate(isCanceled));
                }
            });
    }


    return {
        web3Balance,
        // computed
        balanceList,
        // nativeBalance,
        // wrappedBalance,
        // balance,

        setWeb3AddressBalanceProps: setProps,
        updateAddressBalance,
        waitBalanceUpdate,
    };
}

