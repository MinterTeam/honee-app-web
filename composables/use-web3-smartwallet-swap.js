import {reactive, computed, watch, toRefs} from '@vue/composition-api';
import {fromErcDecimals, toErcDecimals} from '~/api/web3.js';
// import {buildTxForSwap, getQuoteForSwap} from '~/api/1inch.js';
import {buildTxForSwap} from '~/api/hub-deposit-proxy.js';
import useWeb3SmartWallet from '~/composables/use-web3-smartwallet.js';
import useHubToken from '~/composables/use-hub-token.js';

export default function useWeb3SmartWalletSwap() {
    const {setSmartWalletProps, smartWalletAddress, feeTxParams, preparePayload} = useWeb3SmartWallet();
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
        isSmartWalletSwapParamsLoading: false,
        toTokenAmount: '',
    });

    const oneInchSwapParams = computed(() => {
        return {
            fromTokenAddress: tokenToSellAddress.value,
            toTokenAddress: tokenToBuyAddress.value,
            amount: toErcDecimals(props.valueToSell || 0, tokenToSellDecimals.value),
            fromAddress: smartWalletAddress.value,
            // hub proxy destination
            destination: props.evmAccountAddress,
            // refundTo: props.evmAccountAddress,
            slippage: 1,
            disableEstimate: true,
            allowPartialFill: false,
        };
    });

    // @TODO throttle
    watch(oneInchSwapParams, () => {
        if (oneInchSwapParams.value.fromTokenAddress && oneInchSwapParams.value.toTokenAddress && oneInchSwapParams.value.amount > 0) {
            // console.log('oneInchSwapParams', oneInchSwapParams.value);
            // prepareTxParams();
            state.isSmartWalletSwapParamsLoading = true;
            buildTxForSwap(props.chainId, oneInchSwapParams.value)
                .then((result) => {
                    state.isSmartWalletSwapParamsLoading = false;
                    state.toTokenAmount = fromErcDecimals(result.toTokenAmount, tokenToBuyDecimals.value);
                    console.log(result);
                    // return preparePayload([result.tx.to], [result.tx.data], [result.tx.value]);
                })
                .catch((error) => {
                    state.toTokenAmount = '';
                    state.isSmartWalletSwapParamsLoading = false;
                });
        } else {
            state.toTokenAmount = '';
        }
    });

    function prepareTxParams() {
        return buildTxForSwap(props.chainId, oneInchSwapParams.value)
            .then((result) => {
                console.log(result);
                return preparePayload([result.tx.to], [result.tx.data], [result.tx.value]);
            })
            .then((payload) => {
                console.log(payload);
                return {
                    payload,
                };
            });
    }

    // function sendSmartWalletSwapTx() {
    //     return buildTxForSwap(props.chainId, oneInchSwapParams.value)
    //         .then((swapTx) => {
    //             return callSmartWallet([swapTx.to], [swapTx.data], [swapTx.value]);
    //         });
    // }

    return {
        ...toRefs(state),
        smartWalletAddress,
        oneInchSwapParams,
        feeTxParams,

        setSmartWalletSwapProps: setProps,
        prepareTxParams,
        // sendSmartWalletSwapTx,
    };
}
