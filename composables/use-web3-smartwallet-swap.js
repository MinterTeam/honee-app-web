import {reactive, computed, watch, watchEffect, toRefs} from 'vue';
import {watchDebounced} from '@vueuse/core';
import {fromErcDecimals, toErcDecimals, buildDepositTx as _buildDepositTx, getAllowance, buildApproveTx} from '~/api/web3.js';
// import {buildTxForSwap as buildTxForOneInchSwap, getQuoteForSwap} from '~/api/1inch.js';
import {buildTxForSwap as _buildTxForSwapToHub} from '~/api/swap-hub-deposit-proxy.js';
import Big from '~/assets/big.js';
import {getErrorText} from '~/assets/server-error.js';
import {HUB_WITHDRAW_SPEED, HUB_CHAIN_BY_ID} from '~/assets/variables.js';
import useWeb3SmartWallet from '~/composables/use-web3-smartwallet.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3Withdraw from '~/composables/use-web3-withdraw.js';

export const ERROR_NOT_ENOUGH_PAY_REWARD = 'Not enough to pay relay reward';

export default function useWeb3SmartWalletSwap() {
    const {
        smartWalletAddress,
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
    const {
        discountUpsidePercent,
        destinationFeeInCoin,
        hubFeeRate,
        hubFeeRatePercent,
        hubFee,
        amountToReceive: withdrawAmountToReceive,
        minAmountToSend: minAmountToWithdraw,
        txParams: withdrawTxParams,
        feeTxParams: withdrawFeeTxParams,
        setWithdrawProps,
    } = useWeb3Withdraw();

    const props = reactive({
        // privateKey of control address
        privateKey: '',
        // control address of smart-wallet
        evmAccountAddress: '',
        extraNonce: undefined,
        // origin address to withdraw from (via Hub before swap)
        withdrawOriginAddress: '',
        // destination address to deposit via Hub after swap (should be specified with 0x prefix, however it is address of Minter account)
        depositDestinationAddress: '',
        /** @type {ChainId} */
        chainId: 0,
        isLegacy: false,
        // minter coins for WITHDRAW mode
        coinToSell: '',
        coinToBuy: '',
        // evm tokens for DEPOSIT mode
        tokenToSellContractAddress: '',
        tokenToBuyContractAddress: '',
        tokenToSellDecimals: 0,
        tokenToBuyDecimals: 0,
        // used as amount to withdraw in WITHDRAW mode and as value to sell/deposit in DEPOSIT mode
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
            tokenSymbol: props.coinToSell,
            tokenAddress: props.tokenToSellContractAddress,
            tokenDecimals: props.tokenToSellDecimals,
        });
        setHubTokenToBuyProps({
            chainId: props.chainId,
            tokenSymbol: props.coinToBuy,
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
        complexity: undefined,
        estimationSkip: props.skipRelayReward || props.skipEstimation,
    }));

    const dummySmartWalletTxHash = Array.from({length: 64}).fill('0').join('');
    watchEffect(() => setWithdrawProps({
        hubNetworkSlug: HUB_CHAIN_BY_ID[props.chainId]?.hubNetworkSlug,
        amountToSend: props.valueToSell,
        tokenSymbol: props.coinToSell,
        accountAddress: (props.withdrawOriginAddress || props.evmAccountAddress || '').replace('0x', 'Mx'),
        destinationAddress: smartWalletAddress.value,
        speed: HUB_WITHDRAW_SPEED.FAST,
        // placeholder for minter tx payload
        smartWalletTx: dummySmartWalletTxHash,
    }));

    const state = reactive({
        isEstimationAfterSwapToHubLoading: false,
        estimationAfterSwapToHubError: '',
        // estimated amount after swap and after deposit to Minter
        amountEstimationAfterSwapToHub: '',
    });


    // select mode
    // WITHDRAW mode: start from minter: withdraw + swap + deposit
    // DEPOSIT mode : start from evm: swap + deposit
    const isWithdrawMode = computed(() => {
        return props.coinToSell && props.coinToBuy;
    });

    const isSmartWalletSwapParamsLoading = computed(() => {
        return isEstimationLimitForRelayRewardsLoading.value || state.isEstimationAfterSwapToHubLoading;
    });

    const smartWalletSwapParamsError = computed(() => {
        return estimationLimitForRelayRewardsError.value || state.estimationAfterSwapToHubError;
    });

    const amountToSellForSwapToHub = computed(() => getAmountToSellForSwapToHub(amountEstimationLimitForRelayReward.value));

    function getAmountToSellForSwapToHub(amountEstimationLimitForRelayRewardValue) {
        const valueToUseInEvm = isWithdrawMode.value ? (withdrawAmountToReceive.value || 0) : (props.valueToSell || 0);
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
        if (tokenToSellAddress.value === tokenToBuyAddress.value) {
            return amountToSellForSwapToHub.value;
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
            amount: toErcDecimals(amountToSellForSwapToHub.value, tokenToSellDecimals.value),
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

    // @TODO Watch triggered even if value is not changed
    // https://github.com/vuejs/core/issues/2231 it should be fixed here but looks like not backported to vue/composition-api
    watchDebounced(swapToHubParams, () => {
        if (props.skipEstimation) {
            return;
        }
        const sameTokens = swapToHubParams.value.fromTokenAddress === swapToHubParams.value.toTokenAddress;
        const hasProps = swapToHubParams.value.fromTokenAddress && swapToHubParams.value.toTokenAddress && Number(swapToHubParams.value.amount) > 0;
        if (hasProps && !sameTokens) {
            // console.log('swapToHubParams', swapToHubParams.value);
            // prepareTxParams();
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
     * @return {Promise<Array<{data: string, to: string, value: (string|number)}>>}
     */
    // @ts-expect-error @TODO https://github.com/microsoft/TypeScript/issues/50286
    async function buildDepositTx({overrideAmount} = {}) {
        const amount = Number(overrideAmount) > 0 ? overrideAmount : amountToSellForSwapToHub.value;
        console.log('overrideAmount', overrideAmount);
        console.log('amountToSellForSwapToHub', props.valueToSell, withdrawAmountToReceive.value, '-', amountEstimationLimitForRelayReward.value, '=', amountToSellForSwapToHub.value);
        console.log('_buildDepositTx', props.chainId, isNativeToken.value ? undefined : tokenToSellAddress.value, tokenToSellDecimals.value, depositDestinationAddress.value, amount);

        let txList = [];
        if (!isNativeToken.value) {
            const hubBridgeContractAddress = HUB_CHAIN_BY_ID[props.chainId]?.hubContractAddress;
            const allowance = await getAllowance(props.chainId, tokenToSellAddress.value, smartWalletAddress.value, hubBridgeContractAddress);
            if (new Big(allowance).lt(toErcDecimals(amount, tokenToSellDecimals.value))) {
                const approveTx = buildApproveTx(tokenToSellAddress.value, hubBridgeContractAddress);
                txList.push(approveTx);
            }
        }
        const depositTx = _buildDepositTx(props.chainId, isNativeToken.value ? undefined : tokenToSellAddress.value, tokenToSellDecimals.value, depositDestinationAddress.value, amount);
        txList.push(depositTx);

        return txList;
    }

    /**
     * @param {object} [options]
     * @param {number|string} [options.overrideAmount]
     * @return {Promise<Array<OneInchTx>>}
     */
    // @ts-expect-error @TODO https://github.com/microsoft/TypeScript/issues/50286
    function buildTxForSwapToHub({overrideAmount} = {}) {
        const txParams = Number(overrideAmount) > 0 ? {
            ...swapToHubParams.value,
            amount: toErcDecimals(overrideAmount, tokenToSellDecimals.value),
        } : swapToHubParams.value;
        console.log('overrideAmount', overrideAmount);
        console.log('amountToSellForSwapToHub', props.valueToSell, withdrawAmountToReceive.value, '-', amountEstimationLimitForRelayReward.value, '=', amountToSellForSwapToHub.value);
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
    // @ts-expect-error @TODO https://github.com/microsoft/TypeScript/issues/50286
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

        const swapTxList = tokenToSellAddress.value === tokenToBuyAddress.value
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
        // from withdraw
        discountUpsidePercent,
        destinationFeeInCoin,
        hubFeeRate,
        hubFeeRatePercent,
        hubFee,
        withdrawAmountToReceive,
        minAmountToWithdraw,
        withdrawTxParams,
        withdrawFeeTxParams,

        // from smart-wallet
        isEstimationLimitForRelayRewardsLoading,
        estimationLimitForRelayRewardsError,
        amountEstimationLimitForRelayReward,

        ...toRefs(state),
        isSmartWalletSwapParamsLoading,
        smartWalletSwapParamsError,
        amountToSellForSwapToHub,
        amountToDeposit,
        amountAfterDeposit,
        smartWalletAddress,
        swapToHubParams,
        // feeTxParams,

        setSmartWalletSwapProps: setProps,
        buildTxForRelayReward,
        buildTxForSwapToHub,
        buildTxListAndCallSmartWallet,
    };
}
