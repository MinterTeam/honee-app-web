/**
 * WITHDRAW mode: start from minter: withdraw + swap + deposit
 */

import {reactive, watchEffect} from 'vue';
import {HUB_WITHDRAW_SPEED, HUB_CHAIN_BY_ID} from '~/assets/variables.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3Withdraw from '~/composables/use-web3-withdraw.js';
import useWeb3SmartWalletSwap from '~/composables/use-web3-smartwallet-swap.js';


export default function useWeb3SmartWalletSwapWithdraw() {
    const {
        // smart-wallet
        smartWalletAddress,
        gasPrice,
        relayRewardAmount,
        isEstimationLimitForRelayRewardsLoading,
        estimationLimitForRelayRewardsError,
        amountEstimationLimitForRelayReward,
        // swapToRelayRewardParams,
        setSmartWalletSwapProps,
        // estimateSpendLimitForRelayReward,
        buildTxForRelayReward,
        // callSmartWallet,

        // swap
        isSmartWalletSwapParamsLoading,
        smartWalletSwapParamsError,
        amountToSellForSwapToHub,
        amountToSpendForDeposit,
        amountToDeposit,
        amountAfterDeposit,
        amountEstimationAfterSwapToHub,
        swapToHubParams,
        buildTxForSwapToHub,
        buildTxListAndCallSmartWallet,
    } = useWeb3SmartWalletSwap();
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
        // setSmartWalletSwapProps(newProps);
        setHubTokenToSellProps({
            chainId: props.chainId,
            tokenSymbol: props.coinToSell,
        });
        setHubTokenToBuyProps({
            chainId: props.chainId,
            tokenSymbol: props.coinToBuy,
        });
    }

    watchEffect(() => setSmartWalletSwapProps({
        privateKey: props.privateKey,
        evmAccountAddress: props.evmAccountAddress,
        extraNonce: props.extraNonce,
        depositDestinationAddress: props.depositDestinationAddress,
        chainId: props.chainId,
        isLegacy: props.isLegacy,
        skipRelayReward: props.skipRelayReward,
        skipEstimation: props.skipEstimation,
        idPreventConcurrency: props.idPreventConcurrency,

        tokenToSellContractAddress: tokenToSellAddress.value,
        tokenToSellDecimals: tokenToSellDecimals.value,
        tokenToBuyContractAddress: tokenToBuyAddress.value,
        tokenToBuyDecimals: tokenToBuyDecimals.value,
        valueToSell: withdrawAmountToReceive.value,
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
    });


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
        smartWalletAddress,
        gasPrice,
        relayRewardAmount,
        isEstimationLimitForRelayRewardsLoading,
        estimationLimitForRelayRewardsError,
        amountEstimationLimitForRelayReward,

        // from swap
        isSmartWalletSwapParamsLoading,
        smartWalletSwapParamsError,
        amountToSellForSwapToHub,
        amountToSpendForDeposit,
        amountToDeposit,
        amountAfterDeposit,
        amountEstimationAfterSwapToHub,
        swapToHubParams,
        // feeTxParams,

        setSmartWalletSwapWithdrawProps: setProps,
        buildTxForRelayReward,
        buildTxForSwapToHub,
        buildTxListAndCallSmartWallet,
    };
}
