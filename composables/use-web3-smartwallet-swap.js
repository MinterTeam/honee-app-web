import {reactive, computed, watch, watchEffect, toRefs} from 'vue';
import {watchDebounced} from '@vueuse/core';
import {fromErcDecimals, toErcDecimals, buildDepositWithApproveTxList} from '~/api/web3.js';
// import {buildTxForSwap as buildTxForOneInchSwap, getQuoteForSwap} from '~/api/1inch.js';
import {buildTxForSwap as _buildTxForSwapToHub} from '~/api/swap-hub-deposit-proxy.js';
import Big from '~/assets/big.js';
import {getErrorText} from '~/assets/server-error.js';
import useWeb3SmartWallet from '~/composables/use-web3-smartwallet.js';
import useHubToken from '~/composables/use-hub-token.js';

export const ERROR_NOT_ENOUGH_PAY_REWARD = 'Not enough to pay relay reward';

export default function useWeb3SmartWalletSwap() {
    const {
        smartWalletAddress,
        gasPrice,
        relayRewardAmount,
        isEstimationLimitForRelayRewardsLoading,
        estimationLimitForRelayRewardsError,
        amountEstimationLimitForRelayReward,
        swapToRelayRewardParams,
        setSmartWalletProps,
        estimateSpendLimitForRelayReward,
        buildTxForRelayReward,
        callSmartWallet,
    } = useWeb3SmartWallet();
    const { tokenDecimals: tokenToSellDecimals, tokenContractAddressFixNative: tokenToSellAddress, setHubTokenProps: setHubTokenToSellProps, isNativeToken } = useHubToken();
    const { tokenDecimals: tokenToBuyDecimals, tokenContractAddressFixNative: tokenToBuyAddress, setHubTokenProps: setHubTokenToBuyProps } = useHubToken();

    const props = reactive({
        // privateKey of control address
        privateKey: '',
        // control address of smart-wallet
        evmAccountAddress: '',
        extraNonce: undefined,
        // destination address to deposit via Hub after swap (should be specified with 0x prefix, however it is address of Minter account)
        depositDestinationAddress: '',
        /** @type {ChainId} */
        chainId: 0,
        isLegacy: false,
        // evm tokens for DEPOSIT mode
        tokenToSellContractAddress: '',
        tokenToBuyContractAddress: '',
        tokenToSellDecimals: 0,
        tokenToBuyDecimals: 0,
        /** @type {string|number} - used as amount to withdraw in WITHDRAW mode and as value to sell/deposit in DEPOSIT mode*/
        valueToSell: 0,
        // disable relay reward
        skipRelayReward: false,
        // disable relay reward estimation, but use relay reward during smart-wallet call
        skipEstimation: false,
        idPreventConcurrency: '',
    });

    /**
     * @param {Partial<props>} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
        // moved to watchEffect
        // setSmartWalletProps(newProps);
        setHubTokenToSellProps({
            chainId: props.chainId,
            tokenAddress: props.tokenToSellContractAddress,
            tokenDecimals: props.tokenToSellDecimals,
        });
        setHubTokenToBuyProps({
            chainId: props.chainId,
            tokenAddress: props.tokenToBuyContractAddress,
            tokenDecimals: props.tokenToBuyDecimals,
        });
    }

    watchEffect(() => setSmartWalletProps({
        privateKey: props.privateKey,
        evmAccountAddress: props.evmAccountAddress,
        extraNonce: props.extraNonce,
        chainId: props.chainId,
        isLegacy: props.isLegacy,
        gasTokenAddress: tokenToSellAddress.value,
        gasTokenDecimals: tokenToSellDecimals.value,
        // isDepositOnlyMode.value
        complexity: tokenToSellAddress.value === tokenToBuyAddress.value ? 0 : 1,
        estimationSkip: props.skipRelayReward || props.skipEstimation,
    }));

    const state = reactive({
        // waiting debounced watcher
        isEstimationAfterSwapToHubWaiting: false,
        // waiting api calls
        isEstimationAfterSwapToHubLoading: false,
        estimationAfterSwapToHubError: '',
        // @TODO now Hub fee is not included and actually it is value *before* deposit
        // estimated amount after swap and after deposit to Minter
        amountEstimationAfterSwapToHub: '',
    });


    // deposit without swap
    const isDepositOnlyMode = computed(() => {
        return tokenToSellAddress.value === tokenToBuyAddress.value;
    });

    const isSmartWalletSwapParamsLoading = computed(() => {
        return isEstimationLimitForRelayRewardsLoading.value || state.isEstimationAfterSwapToHubWaiting || state.isEstimationAfterSwapToHubLoading;
    });

    const smartWalletSwapParamsError = computed(() => {
        return estimationLimitForRelayRewardsError.value || state.estimationAfterSwapToHubError;
    });

    // amount to spend for deposit
    const amountToSellForSwapToHub = computed(() => getAmountToSellForSwapToHub(amountEstimationLimitForRelayReward.value));
    const amountToSpendForDeposit = computed(() => amountToSellForSwapToHub.value);

    function getAmountToSellForSwapToHub(amountEstimationLimitForRelayRewardValue) {
        const valueToUseInEvm = props.valueToSell || 0;
        if (props.skipRelayReward) {
            return valueToUseInEvm;
        }
        // invalid reward so can't calculate part to use for swapToHub
        if (!amountEstimationLimitForRelayRewardValue || amountEstimationLimitForRelayRewardValue <= 0) {
            return 0;
        }
        return new Big(valueToUseInEvm).minus(amountEstimationLimitForRelayRewardValue).toString();
    }

    const amountToDeposit = computed(() => {
        if (isDepositOnlyMode.value) {
            return amountToSpendForDeposit.value;
        } else {
            return state.amountEstimationAfterSwapToHub;
        }
    });

    const amountAfterDeposit = computed(() => {
        // @TODO deduct Hub deposit fee
        return amountToDeposit.value;
    });

    const depositDestinationAddress = computed(() => {
        return props.depositDestinationAddress || props.evmAccountAddress || '';
    });

    const swapToHubParams = computed(() => {
        // 1inch + hubDepositProxy params
        return {
            fromTokenAddress: tokenToSellAddress.value,
            toTokenAddress: tokenToBuyAddress.value,
            amount: toErcDecimals(amountToSpendForDeposit.value, tokenToSellDecimals.value),
            fromAddress: smartWalletAddress.value,
            // destAddress: undefined, // is set by hubDepositProxy api
            // hub proxy destination
            destination: depositDestinationAddress.value.replace('Mx', '0x'),
            // refundTo: props.evmAccountAddress,
            // @TODO portfolio buy: make first swap in a sequence less slippage (e.g. 2.5)
            // @TODO portfolio buy: estimate swap of all sell value to e.g. BNB to get overalls price impact and set slippage basing on it (10 small swaps estimation will produce less price impact than 1 large swap estimation)
            slippage: 5,
            disableEstimate: true,
            allowPartialFill: false,
        };
    });

    watch(swapToHubParams, () => {
        if (props.skipEstimation) {
            return;
        }
        // early set flag, that we are waiting for watchDebounced
        if (isValidSwapToHubParams()) {
            state.isEstimationAfterSwapToHubWaiting = true;
        } else {
            state.isEstimationAfterSwapToHubWaiting = false;
        }
    });

    // @TODO Watch triggered even if value is not changed
    // https://github.com/vuejs/core/issues/2231 it should be fixed here but looks like not backported to vue/composition-api
    watchDebounced(swapToHubParams, () => {
        if (props.skipEstimation) {
            return;
        }

        if (isValidSwapToHubParams()) {
            // console.log('swapToHubParams', swapToHubParams.value);
            // prepareTxParams();
            state.isEstimationAfterSwapToHubWaiting = false;
            state.isEstimationAfterSwapToHubLoading = true;
            state.estimationAfterSwapToHubError = '';
            estimateSwapToHub()
                .then((estimationAmount) => {
                    state.isEstimationAfterSwapToHubLoading = false;
                    state.amountEstimationAfterSwapToHub = fromErcDecimals(estimationAmount, tokenToBuyDecimals.value);
                    // console.log(result);
                    // return preparePayload([result.tx.to], [result.tx.data], [result.tx.value]);
                })
                .catch((error) => {
                    state.amountEstimationAfterSwapToHub = '';
                    state.isEstimationAfterSwapToHubLoading = false;
                    state.estimationAfterSwapToHubError = getErrorText(error);
                });
        } else {
            state.amountEstimationAfterSwapToHub = '';
        }
    }, {
        debounce: 500,
        maxWait: 2000,
    });

    function isValidSwapToHubParams() {
        const sameTokens = swapToHubParams.value.fromTokenAddress === swapToHubParams.value.toTokenAddress;
        const hasProps = swapToHubParams.value.fromTokenAddress && swapToHubParams.value.toTokenAddress && Number(swapToHubParams.value.amount) > 0;

        return hasProps && !sameTokens;
    }

    /**
     * @return {Promise<string>}
     */
    function estimateSwapToHub() {
        return _buildTxForSwapToHub(props.chainId, swapToHubParams.value, {
            idPreventConcurrency: props.idPreventConcurrency,
        })
            .then((result) => result.toTokenAmount);
    }

    /**
     * @param {object} [options]
     * @param {number|string} [options.overrideAmount]
     * @return {Promise<Array<EvmTxParams>>}
     */
    async function buildDepositTx({overrideAmount} = {}) {
        const amount = Number(overrideAmount) > 0 ? overrideAmount : amountToDeposit.value;
        console.log('_buildDepositTx', props.chainId, isNativeToken.value ? undefined : tokenToSellAddress.value, tokenToSellDecimals.value, depositDestinationAddress.value, amount);

        return buildDepositWithApproveTxList(props.chainId, isNativeToken.value ? undefined : tokenToSellAddress.value, tokenToSellDecimals.value, depositDestinationAddress.value, amount, smartWalletAddress.value);
    }

    /**
     * @param {object} [options]
     * @param {number|string} [options.overrideAmount]
     * @return {Promise<Array<OneInchTx>>}
     */
    function buildTxForSwapToHub({overrideAmount} = {}) {
        const txParams = Number(overrideAmount) > 0 ? {
            ...swapToHubParams.value,
            amount: toErcDecimals(overrideAmount, tokenToSellDecimals.value),
        } : swapToHubParams.value;

        console.log('_buildTxForSwapToHub', props.chainId, txParams);

        // don't pass idPreventConcurrency (to ensure it will not cancelled by estimate)
        return _buildTxForSwapToHub(props.chainId, txParams, {idPreventConcurrency: null})
            .then((result) => result.txList);
    }

    /**
     * @param {object} [options]
     * @param {number} [options.overrideExtraNonce]
     * @return {Promise<SmartWalletRelaySubmitTxResult>}
     */
    async function buildTxListAndCallSmartWallet({overrideExtraNonce} = {}) {
        if (props.skipRelayReward) {
            throw new Error('Can\'t call smart-wallet with disabled relay reward. Use build and call manually');
        }
        const {txList: txListForRelayReward, swapLimit} = await buildTxForRelayReward();
        let options = {};
        if (props.skipEstimation) {
            options.overrideAmount = getAmountToSellForSwapToHub(swapLimit);
            if (options.overrideAmount < 0) {
                throw new Error(ERROR_NOT_ENOUGH_PAY_REWARD);
            }
        }

        console.log('overrideAmount', options.overrideAmount);
        console.log('amount to spend for deposit', props.valueToSell, '-', amountEstimationLimitForRelayReward.value, '=', amountToSpendForDeposit.value);

        if (amountToSpendForDeposit.value <= 0) {
            const valueToUseInEvm = props.valueToSell || 0;
            throw new Error(`Not enough to pay smart-wallet relay reward. ${amountEstimationLimitForRelayReward.value} required, ${valueToUseInEvm} given`);
        }

        const swapTxList = isDepositOnlyMode.value
            ? await buildDepositTx(options)
            : await buildTxForSwapToHub(options);
        console.log(txListForRelayReward);
        console.log(swapTxList);
        return callSmartWallet([].concat(txListForRelayReward, swapTxList), {overrideExtraNonce})
            .then((result) => {
                console.log(result);
                return result;
            });
    }

    return {
        // from smart-wallet
        smartWalletAddress,
        gasPrice,
        relayRewardAmount,
        isEstimationLimitForRelayRewardsLoading,
        estimationLimitForRelayRewardsError,
        amountEstimationLimitForRelayReward,

        ...toRefs(state),
        isSmartWalletSwapParamsLoading,
        smartWalletSwapParamsError,
        amountToSellForSwapToHub,
        amountToSpendForDeposit,
        amountToDeposit,
        amountAfterDeposit,
        swapToHubParams,
        // feeTxParams,

        setSmartWalletSwapProps: setProps,
        buildTxForRelayReward,
        buildTxForSwapToHub,
        buildTxListAndCallSmartWallet,
    };
}
