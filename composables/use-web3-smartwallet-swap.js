import {reactive, computed, watch, watchEffect, toRefs} from '@vue/composition-api';
import {watchDebounced} from '@vueuse/core';
import {fromErcDecimals, toErcDecimals} from '~/api/web3.js';
// import {buildTxForSwap as buildTxForOneInchSwap, getQuoteForSwap} from '~/api/1inch.js';
import {buildTxForSwap as _buildTxForSwapToHub} from '~/api/swap-hub-deposit-proxy.js';
import Big from '~/assets/big.js';
import {getErrorText} from '~/assets/server-error.js';
import {HUB_WITHDRAW_SPEED, HUB_CHAIN_BY_ID} from '~/assets/variables.js';
import useWeb3SmartWallet from '~/composables/use-web3-smartwallet.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3Withdraw from '~/composables/use-web3-withdraw.js';

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
    const { tokenDecimals: tokenToSellDecimals, tokenContractAddressFixNative: tokenToSellAddress, setHubTokenProps: setHubTokenToSellProps } = useHubToken();
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
        chainId: 0,
        coinToSell: '',
        coinToBuy: '',
        // amount to withdraw
        valueToSell: 0,
        // disable relay reward
        skipRelayReward: false,
        idPreventConcurrency: '',
    });

    function setProps(newProps) {
        Object.assign(props, newProps);
        // moved to watchEffect
        // setSmartWalletProps(newProps);
        setHubTokenToSellProps({
            tokenSymbol: props.coinToSell,
            chainId: props.chainId,
        });
        setHubTokenToBuyProps({
            tokenSymbol: props.coinToBuy,
            chainId: props.chainId,
        });
    }

    watchEffect(() => setSmartWalletProps({
        privateKey: props.privateKey,
        evmAccountAddress: props.evmAccountAddress,
        extraNonce: props.extraNonce,
        chainId: props.chainId,
        gasTokenAddress: tokenToSellAddress.value,
        gasTokenDecimals: tokenToSellDecimals.value,
        complexity: undefined,
        estimationSkip: props.skipRelayReward,
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


    const isSmartWalletSwapParamsLoading = computed(() => {
        return isEstimationLimitForRelayRewardsLoading.value || state.isEstimationAfterSwapToHubLoading;
    });

    const smartWalletSwapParamsError = computed(() => {
        return estimationLimitForRelayRewardsError.value || state.estimationAfterSwapToHubError;
    });

    const amountToSellForSwapToHub = computed(() => {
        if (props.skipRelayReward) {
            return withdrawAmountToReceive.value || 0;
        }
        if (!amountEstimationLimitForRelayReward.value || amountEstimationLimitForRelayReward.value <= 0) {
            return 0;
        }
        return new Big(withdrawAmountToReceive.value || 0).minus(amountEstimationLimitForRelayReward.value).toString();
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
            destination: (props.depositDestinationAddress || props.evmAccountAddress || '').replace('Mx', '0x'),
            // refundTo: props.evmAccountAddress,
            slippage: 1,
            disableEstimate: true,
            allowPartialFill: false,
        };
    });

    // @TODO Watch triggered even if value is not changed
    // https://github.com/vuejs/core/issues/2231 it should be fixed here but looks like not backported to vue/composition-api
    watchDebounced(swapToHubParams, () => {
        const sameTokens = swapToHubParams.value.fromTokenAddress === swapToHubParams.value.toTokenAddress;
        const hasProps = swapToHubParams.value.fromTokenAddress && swapToHubParams.value.toTokenAddress && swapToHubParams.value.amount > 0;
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
     * @return {Promise<Array<OneInchTx>>}
     */
    function buildTxForSwapToHub({overrideAmount} = {}) {
        const txParams = overrideAmount > 0 ? {
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
    async function buildTxListAndCallSmartWallet({overrideExtraNonce} = {}) {
        if (props.skipRelayReward) {
            throw new Error('Can\'t call smart-wallet with disabled relay reward. Use build and call manually');
        }
        const {txList: txListForRelayReward} = await buildTxForRelayReward();
        const swapTxList = await buildTxForSwapToHub();
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
        smartWalletAddress,
        swapToHubParams,
        // feeTxParams,

        setSmartWalletSwapProps: setProps,
        buildTxForRelayReward,
        buildTxForSwapToHub,
        buildTxListAndCallSmartWallet,
    };
}
