import { reactive, computed, watch } from 'vue';
import Big from 'minterjs-util/src/big.js';
import {BSC_CHAIN_ID, ETHEREUM_CHAIN_ID} from '~/assets/variables.js';
import {wait} from '~/assets/utils/wait.js';
import CancelError from '~/assets/utils/error-cancel.js';
import useWeb3Balance from '~/composables/use-web3-balance.js';
import useHubToken from '~/composables/use-hub-token.js';
import {createCancelableSignal} from '~/assets/utils/cancelable-signal.js';

const { web3Balance, web3Allowance, getBalance, getAllowance} = useWeb3Balance();

export default function useWeb3TokenBalance() {
    const {tokenData, tokenContractAddress, tokenDecimals, isNativeToken, setHubTokenProps} = useHubToken();

    const props = reactive({
        accountAddress: '',
        /** @type {ChainId} */
        chainId: 0,
        tokenSymbol: '',
    });

    /**
     * @param {{tokenSymbol?: string, accountAddress?: string, chainId?: number}} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
        setHubTokenProps(newProps);
    }



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


    watch(tokenData, (newVal, oldVal) => {
        // check if not changed
        if (newVal?.externalTokenId === oldVal?.externalTokenId && newVal?.chainId === oldVal?.chainId) {
            return;
        }
        // state.tokenError = '';

        if (props.chainId === ETHEREUM_CHAIN_ID || props.chainId === BSC_CHAIN_ID) {
            updateTokenBalance();
            updateTokenAllowance();
        }
    }, {immediate: true});


    async function updateTokenBalance() {
        // ensure computed props are recalculated
        await wait(1);
        const chainId = props.chainId;
        const tokenAddress = tokenContractAddress.value;

        if (!tokenAddress) {
            return Promise.reject(new Error('Token is not specified'));
        }

        return getBalance(props.accountAddress, chainId, tokenAddress, tokenDecimals.value)
            .catch((error) => {
                if (props.chainId === chainId && tokenContractAddress.value === tokenAddress) {
                    //@TODO expose tokenError string
                    // state.tokenError = 'Can\'t get balance';
                    throw error;
                }
            });
    }

    async function updateTokenAllowance() {
        // ensure computed props are recalculated
        await wait(1);
        const chainId = props.chainId;
        const tokenAddress = tokenContractAddress.value;

        if (!tokenAddress) {
            return Promise.reject(new Error('Token is not specified'));
        }
        //@TODO allowance not used yet (will be used only for erc20 tokens)
        // allowance not needed for native coins
        if (isNativeToken.value) {
            return Promise.resolve();
        }

        return getAllowance(props.accountAddress, chainId, tokenAddress, tokenDecimals.value)
            .catch((error) => {
                if (props.chainId === chainId && tokenContractAddress.value === tokenAddress) {
                    // state.tokenError = 'Can\'t get allowance';
                    throw error;
                }
            });
    }

    /**
     * @param {number|string} [targetAmount] - current balance will be used by default
     * @return {[promise: Promise<void>, cancel: CancelableSignal['cancel']]}
     */
    function waitEnoughTokenBalance(targetAmount) {
        // save request if balance already enough
        if (targetAmount && new Big(balance.value).gte(targetAmount)) {
            return [Promise.resolve(), () => {}];
        } else {
            const signal = createCancelableSignal();

            return [
                _waitEnoughTokenBalance(targetAmount, signal),
                signal.cancel,
            ];
        }
    }

    /**
     * @param {number|string|undefined} targetAmount
     * @param {CancelableSignal} signal
     * @return {Promise<void>}
     * @private
     */
    function _waitEnoughTokenBalance(targetAmount, signal) {
        return updateTokenBalance()
            .then(() => {
                // Sending was canceled
                if (signal.isCanceled) {
                    return Promise.reject(new CancelError());
                }
                // use current balance as default value
                if (!targetAmount) {
                    targetAmount = new Big(balance.value).plus(1e-18).toString();
                }
                if (new Big(balance.value).gte(targetAmount)) {
                    return;
                } else {
                    return wait(10000).then(() => _waitEnoughTokenBalance(targetAmount, signal));
                }
            });
    }


    return {
        // computed
        nativeBalance,
        wrappedBalance,
        balance,
        tokenAllowance,

        setWeb3TokenProps: setProps,
        updateTokenBalance,
        updateTokenAllowance,
        waitEnoughTokenBalance,
    };
}

