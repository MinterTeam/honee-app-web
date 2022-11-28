import {reactive, computed, watch, toRefs} from '@vue/composition-api';
import {fromErcDecimals, toErcDecimals} from '~/api/web3.js';
// import {buildTxForSwap as buildTxForOneInchSwap, getQuoteForSwap} from '~/api/1inch.js';
import {buildTxForSwap as buildTxForParaSwap, getEstimationLimit as getParaSwapEstimationLimit} from '~/api/paraswap.js';
import {ParaSwapSwapSide} from '~/api/paraswap-models.d.ts';
import {buildTxForSwap as buildTxForSwapToHub} from '~/api/hub-deposit-proxy.js';
import Big from '~/assets/big.js';
import {getErrorText} from '~/assets/server-error.js';
import {wait} from '~/assets/utils/wait.js';
import {NATIVE_COIN_ADDRESS, SMART_WALLET_RELAY_BROADCASTER_ADDRESS} from '~/assets/variables.js';
import useWeb3SmartWallet, {RELAY_REWARD_AMOUNT} from '~/composables/use-web3-smartwallet.js';
import useHubToken from '~/composables/use-hub-token.js';

export default function useWeb3SmartWalletSwap() {
    const {setSmartWalletProps, smartWalletAddress, callSmartWallet} = useWeb3SmartWallet();
    const { tokenDecimals: tokenToSellDecimals, tokenContractAddressFixNative: tokenToSellAddress, setHubTokenProps: setHubTokenToSellProps } = useHubToken();
    const { tokenDecimals: tokenToBuyDecimals, tokenContractAddressFixNative: tokenToBuyAddress, setHubTokenProps: setHubTokenToBuyProps } = useHubToken();

    const props = reactive({
        privateKey: '',
        evmAccountAddress: '',
        chainId: 0,
        coinToSell: '',
        coinToBuy: '',
        valueToSell: 0,
    });

    function setProps(newProps) {
        Object.assign(props, newProps);
        setSmartWalletProps(newProps);
        setHubTokenToSellProps({
            tokenSymbol: newProps.coinToSell,
            chainId: newProps.chainId,
        });
        setHubTokenToBuyProps({
            tokenSymbol: newProps.coinToBuy,
            chainId: newProps.chainId,
        });
    }

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
        return new Big(props.valueToSell || 0).minus(state.amountEstimationLimitForRelayRewards || 0).toString();
    });

    const swapToRelayRewardsParams = computed(() => {
        // paraswap params
        return {
            network: props.chainId,
            srcToken: tokenToSellAddress.value,
            srcDecimals: tokenToSellDecimals.value,
            // address recognized by 1inch/paraswap as native coin
            destToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            // destToken: HUB_CHAIN_BY_ID[props.chainId]?.wrappedNativeContractAddress,
            destDecimals: 18,
            amount: toErcDecimals(RELAY_REWARD_AMOUNT, 18),
            side: ParaSwapSwapSide.BUY,
            slippage: 3 * 100, // 3%
            maxImpact: 30, // 30% (default 15% can be exceeded on "bipx to 0.01bnb swap" despite it has 10k liquidity)
            userAddress: smartWalletAddress.value,
            txOrigin: SMART_WALLET_RELAY_BROADCASTER_ADDRESS,
            receiver: SMART_WALLET_RELAY_BROADCASTER_ADDRESS,
        };
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

    watch(swapToRelayRewardsParams, () => {
        //@TODO maybe wait until whole form will be filled by user
        if (swapToRelayRewardsParams.value.srcToken && swapToRelayRewardsParams.value.destToken) {
            state.isEstimationLimitForRelayRewardsLoading = true;
            state.estimationLimitForRelayRewardsError = '';
            estimateSpendLimitForRelayRewards()
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
     * @return {Promise<string|number>}
     */
    function estimateSpendLimitForRelayRewards() {
        if (tokenToSellAddress.value === NATIVE_COIN_ADDRESS) {
            return Promise.resolve(RELAY_REWARD_AMOUNT);
        } else {
            return getParaSwapEstimationLimit(swapToRelayRewardsParams.value);
        }
    }

    /**
     * @return {Promise<ParaSwapTransactionsBuildResponse>}
     */
    function buildTxForRelayRewards() {
        if (tokenToSellAddress.value === NATIVE_COIN_ADDRESS) {
            return Promise.resolve({
                to: SMART_WALLET_RELAY_BROADCASTER_ADDRESS,
                value: toErcDecimals(RELAY_REWARD_AMOUNT, 18),
                data: '0x',
            });
        } else {
            return buildTxForParaSwap(swapToRelayRewardsParams.value)
                .then((result) => {
                    state.amountEstimationLimitForRelayRewards = result.swapLimit;
                    // wait for computed to recalculate amountToSellForSwapToHub
                    return wait(50, result.txList);
                });
        }
    }

    /**
     * @return {Promise<SmartWalletRelaySubmitTxResult>}
     */
    async function buildTxListAndCallSmartWallet() {
        const txListForRelayRewards = await buildTxForRelayRewards();
        const resultForSwapToHub = await buildTxForSwapToHub(props.chainId, swapToHubParams.value);
        console.log(txListForRelayRewards);
        console.log(resultForSwapToHub);
        return callSmartWallet([].concat(txListForRelayRewards, resultForSwapToHub.txList))
            .then((result) => {
                console.log(result);
                return result;
            });
    }

    return {
        ...toRefs(state),
        isSmartWalletSwapParamsLoading,
        smartWalletSwapParamsError,
        amountToSellForSwapToHub,
        smartWalletAddress,
        swapToRelayRewardsParams,
        swapToHubParams,
        // feeTxParams,

        setSmartWalletSwapProps: setProps,
        buildTxListAndCallSmartWallet,
    };
}
