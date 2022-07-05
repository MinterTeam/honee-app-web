import { ref, reactive, computed, watch } from '@vue/composition-api';
import {findTokenInfo} from '~/api/hub.js';
import Big from '~/assets/big.js';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_BY_ID} from '~/assets/variables.js';
import wait from '~/assets/utils/wait.js';
import CancelError from '~/assets/utils/error-cancel.js';
import useWeb3Balance from '~/composables/use-web3-balance.js';

const { web3Balance, web3Allowance, getBalance, getAllowance} = useWeb3Balance();

export default function useHubDiscount() {
    const props = reactive({
        accountAddress: '',
        chainId: 0,
        tokenSymbol: '',
        /** @type Array<HubCoinItem> */
        hubCoinList: [],
    });

    /**
     * @param {{tokenSymbol?: string, accountAddress?: string, chainId?: number, hubCoinList?: Array<HubCoinItem>}} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
    }


    function getWrappedNativeContractAddress() {
        return HUB_CHAIN_BY_ID[props.chainId]?.wrappedNativeContractAddress;
    }

    /**
     * @type {import('@vue/composition-api').ComputedRef<TokenInfo.AsObject>}
     */
    const tokenData = computed(() => {
        return findTokenInfo(props.hubCoinList, props.tokenSymbol, props.chainId);
    });
    const tokenContractAddress = computed(() => tokenData.value?.externalTokenId.toLowerCase() || '');
    const tokenDecimals = computed(() => tokenData.value ? Number(tokenData.value.externalDecimals) : undefined);
    const isNativeToken = computed(() => tokenContractAddress.value === getWrappedNativeContractAddress());
    const nativeBalance = computed(() => {
        if (isNativeToken.value) {
            return web3Balance[props.chainId]?.[0] || 0;
        }

        return 0;
    });
    const wrappedBalance = computed(() => {
        if (isNativeToken.value) {
            return web3Balance[props.chainId]?.[tokenContractAddress.value] || 0;
        }

        return 0;
    });
    const balance = computed(() => {
        if (isNativeToken.value) {
            return new Big(wrappedBalance.value).plus(nativeBalance.value).toString();
        } else {
            return web3Balance[props.chainId]?.[tokenContractAddress.value] || 0;
        }
    });

    const tokenAllowance = computed(() => {
        return web3Allowance[props.chainId]?.[tokenContractAddress.value] || 0;
    });


    function updateTokenBalance() {
        const chainId = props.chainId;
        const tokenAddress = tokenContractAddress.value;

        if (!tokenAddress) {
            return;
        }

        return getBalance(props.accountAddress, chainId, tokenAddress, tokenDecimals.value)
            .catch((error) => {
                if (props.chainId === chainId && tokenContractAddress.value === tokenAddress) {
                    throw error;
                }
            });
    }

    function updateTokenAllowance() {
        const chainId = props.chainId;
        const tokenAddress = tokenContractAddress.value;

        if (!tokenAddress) {
            return;
        }
        //@TODO allowance not used yet (will be used only for erc20 tokens)
        // allowance not needed for native coins
        if (isNativeToken.value) {
            return;
        }

        return getAllowance(props.accountAddress, chainId, tokenAddress, tokenDecimals.value)
            .catch((error) => {
                if (props.chainId === chainId && tokenContractAddress.value === tokenAddress) {
                    throw error;
                }
            });
    }

    /**
     * @param targetAmount
     * @return {Promise&{canceler: function}}
     */
    function waitEnoughTokenBalance(targetAmount) {
        // save request if balance already enough
        if (new Big(balance.value).gte(targetAmount)) {
            return Promise.resolve();
        } else {
            let promiseReject;
            let isCanceled = {value: false};
            let promise = new Promise((resolve, reject) => {
                promiseReject = reject;
                _waitEnoughTokenBalance(targetAmount, isCanceled).then(resolve).catch(reject);
            });
            promise.canceler = () => {
                promiseReject(new CancelError());
                isCanceled.value = true;
            };
        }
    }

    /**
     * @param {number|string} targetAmount
     * @param {{value: boolean}} isCanceled
     * @return {Promise}
     * @private
     */
    function _waitEnoughTokenBalance(targetAmount, isCanceled) {
        return updateTokenBalance()
            .then(() => {
                // Sending was canceled
                if (isCanceled.value) {
                    return Promise.reject(new CancelError());
                }
                if (balance.value >= targetAmount) {
                    return true;
                } else {
                    return wait(10000).then(() => _waitEnoughTokenBalance(targetAmount, isCanceled));
                }
            });
    }


    return {
        // computed
        tokenData,
        tokenContractAddress,
        tokenDecimals,
        isNativeToken,
        nativeBalance,
        wrappedBalance,
        balance,
        tokenAllowance,

        setTokenProps: setProps,
        updateTokenBalance,
        updateTokenAllowance,
        waitEnoughTokenBalance,
    };
}

