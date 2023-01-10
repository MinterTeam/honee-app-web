import {reactive, computed, watch, watchEffect, toRefs} from '@vue/composition-api';
import {fromErcDecimals, toErcDecimals} from '~/api/web3.js';
// import {buildTxForSwap as buildTxForOneInchSwap, getQuoteForSwap} from '~/api/1inch.js';
import {buildTxForSwap as buildTxForSwapToHub} from '~/api/swap-hub-deposit-proxy.js';
import Big from '~/assets/big.js';
import {getErrorText} from '~/assets/server-error.js';
import {HUB_WITHDRAW_SPEED, HUB_CHAIN_BY_ID} from '~/assets/variables.js';
import {wait} from '~/assets/utils/wait.js';
import useWeb3SmartWallet from '~/composables/use-web3-smartwallet.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3Withdraw from '~/composables/use-web3-withdraw.js';

export default function useWeb3SmartWalletSwap() {
    const {setSmartWalletProps, smartWalletAddress, swapToRelayRewardParams, estimateSpendLimitForRelayReward, buildTxForRelayReward, callSmartWallet} = useWeb3SmartWallet();
    const { tokenDecimals: tokenToSellDecimals, tokenContractAddressFixNative: tokenToSellAddress, setHubTokenProps: setHubTokenToSellProps } = useHubToken();
    const { tokenDecimals: tokenToBuyDecimals, tokenContractAddressFixNative: tokenToBuyAddress, setHubTokenProps: setHubTokenToBuyProps } = useHubToken();
    const {discountUpsidePercent, destinationFeeInCoin, hubFeeRate, hubFeeRatePercent, hubFee, amountToReceive: withdrawAmountToReceive, minAmountToSend: minAmountToWithdraw, txParams: withdrawTxParams, feeTxParams: withdrawFeeTxParams, setWithdrawProps} = useWeb3Withdraw();

    const props = reactive({
        privateKey: '',
        evmAccountAddress: '',
        chainId: 0,
        coinToSell: '',
        coinToBuy: '',
        // amount to withdraw
        valueToSell: 0,
    });

    function setProps(newProps) {
        Object.assign(props, newProps);
        // moved to watchEffect
        // setSmartWalletProps(newProps);
        setHubTokenToSellProps({
            tokenSymbol: newProps.coinToSell,
            chainId: newProps.chainId,
        });
        setHubTokenToBuyProps({
            tokenSymbol: newProps.coinToBuy,
            chainId: newProps.chainId,
        });
    }

    watchEffect(() => setSmartWalletProps({
        privateKey: props.privateKey,
        evmAccountAddress: props.evmAccountAddress,
        chainId: props.chainId,
        gasTokenAddress: tokenToSellAddress.value,
        gasTokenDecimals: tokenToSellDecimals.value,
    }));

    const dummySmartWalletTxHash = Array.from({length: 64}).fill('0').join('');
    watchEffect(() => setWithdrawProps({
        hubNetworkSlug: HUB_CHAIN_BY_ID[props.chainId]?.hubNetworkSlug,
        amountToSend: props.valueToSell,
        tokenSymbol: props.coinToSell,
        accountAddress: props.evmAccountAddress?.replace('0x', 'Mx'),
        destinationAddress: smartWalletAddress.value,
        speed: HUB_WITHDRAW_SPEED.FAST,
        // placeholder for minter tx paylaod
        smartWalletTx: dummySmartWalletTxHash,
    }));

    const state = reactive({
        isEstimationLimitForRelayRewardsLoading: false,
        estimationLimitForRelayRewardsError: '',
        amountEstimationLimitForRelayRewards: '',
        isEstimationAfterSwapToHubLoading: false,
        estimationAfterSwapToHubError: '',
        amountEstimationAfterSwapToHub: '',
    });


    const isSmartWalletSwapParamsLoading = computed(() => {
        return state.isEstimationLimitForRelayRewardsLoading || state.isEstimationAfterSwapToHubLoading;
    });

    const smartWalletSwapParamsError = computed(() => {
        return state.estimationLimitForRelayRewardsError || state.estimationAfterSwapToHubError;
    });

    const amountToSellForSwapToHub = computed(() => {
        if (!state.amountEstimationLimitForRelayRewards || state.amountEstimationLimitForRelayRewards <= 0) {
            return 0;
        }
        return new Big(withdrawAmountToReceive.value || 0).minus(state.amountEstimationLimitForRelayRewards).toString();
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
            destination: props.evmAccountAddress,
            // refundTo: props.evmAccountAddress,
            slippage: 1,
            disableEstimate: true,
            allowPartialFill: false,
        };
    });

    watch(swapToRelayRewardParams, () => {
        //@TODO maybe wait until whole form will be filled by user
        if (tokenToSellAddress.value && tokenToSellDecimals.value) {
            state.isEstimationLimitForRelayRewardsLoading = true;
            state.estimationLimitForRelayRewardsError = '';
            estimateSpendLimitForRelayReward()
                .then((spendLimit) => {
                    state.isEstimationLimitForRelayRewardsLoading = false;
                    state.amountEstimationLimitForRelayRewards = spendLimit;
                })
                .catch((error) => {
                    state.amountEstimationLimitForRelayRewards = '';
                    state.isEstimationLimitForRelayRewardsLoading = false;
                    state.estimationLimitForRelayRewardsError = getErrorText(error);
                });
        } else {
            state.amountEstimationLimitForRelayRewards = '';
        }
    });

    // @TODO throttle
    // @TODO Watch triggered even if value is not changed
    // https://github.com/vuejs/core/issues/2231 it should be fixed here but looks like not backported to vue/composition-api
    watch(swapToHubParams, () => {
        if (swapToHubParams.value.fromTokenAddress && swapToHubParams.value.toTokenAddress && swapToHubParams.value.amount > 0) {
            // console.log('swapToHubParams', swapToHubParams.value);
            // prepareTxParams();
            state.isEstimationAfterSwapToHubLoading = true;
            state.estimationAfterSwapToHubError = '';
            buildTxForSwapToHub(props.chainId, swapToHubParams.value)
                .then((result) => {
                    state.isEstimationAfterSwapToHubLoading = false;
                    state.amountEstimationAfterSwapToHub = fromErcDecimals(result.toTokenAmount, tokenToBuyDecimals.value);
                    console.log(result);
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
    });

    /**
     * @return {Promise<SmartWalletRelaySubmitTxResult>}
     */
    async function buildTxListAndCallSmartWallet() {
        const {txList: txListForRelayReward, swapLimit: relayRewardSwapLimit} = await buildTxForRelayReward();
        state.amountEstimationLimitForRelayRewards = relayRewardSwapLimit;
        // wait for computed to recalculate amountToSellForSwapToHub
        await wait(50);
        const resultForSwapToHub = await buildTxForSwapToHub(props.chainId, swapToHubParams.value);
        console.log(txListForRelayReward);
        console.log(resultForSwapToHub);
        return callSmartWallet([].concat(txListForRelayReward, resultForSwapToHub.txList))
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

        ...toRefs(state),
        isSmartWalletSwapParamsLoading,
        smartWalletSwapParamsError,
        amountToSellForSwapToHub,
        smartWalletAddress,
        swapToHubParams,
        // feeTxParams,

        setSmartWalletSwapProps: setProps,
        buildTxListAndCallSmartWallet,
    };
}
