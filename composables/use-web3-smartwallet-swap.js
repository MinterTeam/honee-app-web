import {reactive, computed, watch, watchEffect, toRefs} from 'vue';
import {watchDebounced} from '@vueuse/core';
import {fromErcDecimals, toErcDecimals, buildDepositWithApproveTxList} from '~/api/web3.js';
import {buildSwapWithApproveTxList as buildSwapWithApproveTxListOneInch, getQuoteForSwap} from '~/api/swap-1inch.js';
import {buildSwapWithApproveTxList as buildSwapWithApproveTxListHub} from '~/api/swap-hub-deposit-proxy.js';
import Big from '~/assets/big.js';
import {getErrorText} from '~/assets/server-error.js';
import useWeb3SmartWalletWithRelayReward from '~/composables/use-web3-smartwallet-relay-reward.js';
import useHubToken, {fixNativeContractAddress} from '~/composables/use-hub-token.js';
import {NATIVE_COIN_ADDRESS} from '~/assets/variables.js';

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
    } = useWeb3SmartWalletWithRelayReward();

    const props = reactive({
        // privateKey of control address
        privateKey: '',
        // control address of smart-wallet
        evmAccountAddress: '',
        extraNonce: undefined,
        // destination address to deposit via Hub after swap
        // if no depositDestination is specified, than only evm swap will be executed without deposit
        depositDestinationAddress: '',
        /** @type {ChainId} */
        chainId: 0,
        isLegacy: false,
        gasPriceGwei: 0,
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
    }

    const tokenToSellAddress = computed(() => {
        return fixNativeContractAddress(props.chainId, props.tokenToSellContractAddress);
    });
    const tokenToBuyAddress = computed(() => {
        return fixNativeContractAddress(props.chainId, props.tokenToBuyContractAddress);
    });
    const tokenToSellDecimals = computed(() => {
        return props.tokenToSellDecimals;
    });
    const tokenToBuyDecimals = computed(() => {
        return props.tokenToBuyDecimals;
    });
    const isNativeToken = computed(() => {
        return tokenToSellAddress.value === NATIVE_COIN_ADDRESS;
    });
    // deposit without swap
    const isDepositOnlyMode = computed(() => {
        return tokenToSellAddress.value === tokenToBuyAddress.value;
    });

    watchEffect(() => setSmartWalletProps({
        privateKey: props.privateKey,
        evmAccountAddress: props.evmAccountAddress,
        extraNonce: props.extraNonce,
        chainId: props.chainId,
        isLegacy: props.isLegacy,
        gasPriceGwei: props.gasPriceGwei,
        gasTokenAddress: tokenToSellAddress.value,
        gasTokenDecimals: tokenToSellDecimals.value,
        complexity: isDepositOnlyMode.value ? 0 : 1,
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
        return props.depositDestinationAddress || '';
    });

    const swapToHubParams = computed(() => {
        // 1inch + hubDepositProxy params
        return {
            fromTokenAddress: tokenToSellAddress.value,
            toTokenAddress: tokenToBuyAddress.value,
            amount: toErcDecimals(amountToSpendForDeposit.value, tokenToSellDecimals.value),
            fromAddress: smartWalletAddress.value,
            // destAddress: undefined, // is set by hubDepositProxy api
            // hub proxy destination (should be specified with 0x prefix, however it is address of Minter account)
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

    function getBuildSwapWithApproveTxListFinal() {
        if (depositDestinationAddress.value) {
            return buildSwapWithApproveTxListHub;
        } else {
            return buildSwapWithApproveTxListOneInch;
        }
    }

    /**
     * @return {Promise<string>}
     */
    function estimateSwapToHub() {
        return getBuildSwapWithApproveTxListFinal()(props.chainId, swapToHubParams.value, {
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
    function buildSwapTxList({overrideAmount} = {}) {
        const txParams = Number(overrideAmount) > 0 ? {
            ...swapToHubParams.value,
            amount: toErcDecimals(overrideAmount, tokenToSellDecimals.value),
        } : swapToHubParams.value;

        console.log('buildSwapWithApproveTxListFinal', props.chainId, txParams);

        // don't pass idPreventConcurrency (to ensure it will not cancelled by estimate)
        return getBuildSwapWithApproveTxListFinal()(props.chainId, txParams, {idPreventConcurrency: null})
            .then((result) => result.txList);
    }

    /**
     * @param {SmartWalletOverrideProps} [smartWalletOverrideProps]
     * @return {Promise<SmartWalletRelaySubmitTxResult>}
     */
    async function buildTxListAndCallSmartWallet(smartWalletOverrideProps) {
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
        if (isDepositOnlyMode.value && !depositDestinationAddress.value) {
            throw new Error('Swap mode can\'t be used because sellToken equal to buyToken and deposit mode can\'t be used because no depositDestinationAddress');
        }

        const swapTxList = isDepositOnlyMode.value
            ? await buildDepositTx(options)
            : await buildSwapTxList(options);
        console.log(txListForRelayReward);
        console.log(swapTxList);
        return callSmartWallet([].concat(txListForRelayReward, swapTxList), smartWalletOverrideProps)
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
        buildSwapTxList,
        buildTxListAndCallSmartWallet,
    };
}
