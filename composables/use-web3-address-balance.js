import { ref, reactive, computed, watch, set} from 'vue';
import Big from '~/assets/big.js';
import {BSC_CHAIN_ID, ETHEREUM_CHAIN_ID} from '~/assets/variables.js';
import {wait} from '~/assets/utils/wait.js';
import CancelError from '~/assets/utils/error-cancel.js';
import {getWalletTokenBalances} from '~/api/web3-moralis.js';

/**
 * @type {UnwrapNestedRefs<Record<ChainId, Record<string, TokenBalance>>>}
 */
const web3Balance = reactive({});

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
     *
     * @type {ComputedRef<Record<string, TokenBalance>>}
     */
    const balance = computed(() => {
        return web3Balance[props.chainId];
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
     * @typedef {object} TokenBalance
     * @property {string} tokenContractAddress
     * @property {string|number} amount
     * @property {number} decimals
     */

    /**
     * #@return {Promise<import('@moralisweb3/common-evm-utils/lib/operations/token/getWalletTokenBalancesOperation').GetWalletTokenBalancesResponse>}
     * @return {Promise<Array<TokenBalance>>} - list of updated balances
     */
    async function updateAddressBalance() {
        const chainId = props.chainId;

        return getWalletTokenBalances(chainId, props.accountAddress)
            .then((result) => {
                console.log(result);
                const oldTokenMap = web3Balance[chainId];
                const tokenMap = Object.fromEntries(result.map((item) => {
                    return [
                        item.token.contractAddress.lowercase,
                        {
                            tokenContractAddress: item.token.contractAddress.lowercase,
                            amount: item.value,
                            decimals: item.token.decimals,
                        },
                    ];
                }));
                set(web3Balance, chainId, Object.freeze(tokenMap));

                if (oldTokenMap) {
                    return Object.entries(tokenMap)
                        .filter(([tokenContractAddress, tokenBalance]) => {
                            return new Big(tokenBalance.amount).gt(oldTokenMap[tokenContractAddress]?.amount || 0);
                        })
                        .map(([tokenContractAddress, tokenBalance]) => {
                            return tokenBalance;
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
     * @return {Promise<Array<TokenBalance>>&{canceler: function}}
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
     * @return {Promise<Array<TokenBalance>>}
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
        balance,
        // nativeBalance,
        // wrappedBalance,
        // balance,

        setWeb3AddressBalanceProps: setProps,
        updateAddressBalance,
        waitBalanceUpdate,
    };
}

