import {ref, reactive, computed, watch, set} from 'vue';
import {watchDebounced} from '@vueuse/core';
import Big from '~/assets/big.js';
import useWeb3SmartWalletSwap from '~/composables/use-web3-smartwallet-swap.js';


export default function useWeb3SmartWalletPortfolioSell() {
    const props = reactive({
        privateKey: '',
        evmAccountAddress: '',
        withdrawOriginAddress: '',
        depositDestinationAddress: '',
        /** @type {ChainId} */
        chainId: 0,
        // amount used to withdraw (before sell to hub)
        /** @type {Array<{symbol: string, amount: number|string}>} */
        coinToSellList: [],
        coinToBuy: '',
        /** @type {Array<string|number>} - amount to receive estimation in minter */
        minterEstimationList: [],
        minterFeeToDeduct: 0,
        isLocked: false,

    });

    /**
     * @param {Partial<props>} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
    }


    //@TODO sell list may be larger than 10
    const listLength = 100;

    // smart-wallet-swap list
    // prefill on creation to exclude bugs with dynamic setting properties of reactive object https://github.com/vuejs/composition-api/issues/580m
    const swsList = ref(Array.from({length: listLength}));
    // not account relay reward
    const minAmountToWithdrawList = computed(() => {
        return props.coinToSellList.map((item, index) => {
            return swsList.value[index].minAmountToWithdraw || 0;
        });
    });
    const withdrawTxParamsList = computed(() => {
        return props.coinToSellList.map((item, index) => {
            return swsList.value[index].withdrawTxParams;
        });
    });
    const withdrawFeeTxParamsList = computed(() => {
        return props.coinToSellList.map((item, index) => {
            return swsList.value[index].withdrawFeeTxParams;
        });
    });
    const amountEstimationLimitForRelayRewardList = computed(() => {
        return props.coinToSellList.map((item, index) => {
            return swsList.value[index].amountEstimationLimitForRelayReward || 0;
        });
    });
    const amountEstimationAfterSwapToHubList = computed(() => {
        return props.coinToSellList.map((item, index) => {
            return swsList.value[index].amountEstimationAfterSwapToHub || 0;
        });
    });
    // list of sws indices selected to swap (these smart-wallet swaps are considered better than Minter swaps)
    const swsSelectedIndices = ref([]);
    // filtered only if sws swap better than minter
    const amountEstimationToReceiveAfterDepositList = ref([]);


    //@TODO combine loaders from swsList and postpone swsSelectedIndices recalculation while isSmartWalletSwapParamsLoading
    // const isSmartWalletSwapParamsLoading = computed(() => {
    //     return state.isEstimationLimitForRelayRewardsLoading || state.isEstimationAfterSwapToHubLoading;
    // });
    //
    // const smartWalletSwapParamsError = computed(() => {
    //     return state.estimationLimitForRelayRewardsError || state.estimationAfterSwapToHubError;
    // });

    // @TODO throttle to 5rps @see https://docs.0x.org/0x-swap-api/advanced-topics/rate-limiting
    watch(props, () => {
        // init
        props.coinToSellList.forEach((item, index) => {
            if (!swsList.value[index]) {
                set(swsList.value, index, useWeb3SmartWalletSwap());
            }

            swsList.value[index].setSmartWalletSwapProps({
                privateKey: props.privateKey,
                evmAccountAddress: props.evmAccountAddress,
                withdrawOriginAddress: props.withdrawOriginAddress,
                depositDestinationAddress: props.depositDestinationAddress,
                chainId: props.chainId,
                valueToSell: item.amount,
                coinToSell: item.symbol,
                coinToBuy: props.coinToBuy,
                skipRelayReward: false,
                idPreventConcurrency: `estimateSwsSell${index}`,
            });
        });
    }, {deep: true});

    /* extraNonce should be number of calls, not number of txs (so using overrideExtraNonce in PortfolioSellForm)
    watch(swsSelectedIndices, () => {
        swsList.value.forEach((swsItem, index) => {
            const positionInSequence = swsSelectedIndices.value.indexOf(index.toString());
            swsItem.setSmartWalletSwapProps({
                //@TODO consequential smart-wallet calls still consume walletCreation reward (need to recalculate estimation and deduct reward from tx)
                extraNonce: positionInSequence > 0 ? positionInSequence : 0,
            });
        });
    });
    */

    watchDebounced([
        amountEstimationAfterSwapToHubList,
        () => props.minterEstimationList,
    ], () => {
        if (props.isLocked) {
            return;
        }
        swsSelectedIndices.value = Object.keys(amountEstimationAfterSwapToHubList.value)
            .filter((indexString) => {
                const isSameToken = props.coinToSellList[indexString].symbol === props.coinToBuy;
                const isSwsBetter = new Big(amountEstimationAfterSwapToHubList.value[indexString]).gt(props.minterEstimationList[indexString] || 0);
                return !isSameToken && isSwsBetter;
            });
        amountEstimationToReceiveAfterDepositList.value = amountEstimationAfterSwapToHubList.value.map((estimation, index) => {
            if (!swsSelectedIndices.value.includes(index.toString())) {
                return 0;
            }
            return estimation;
        });
        console.log('swsFinal', swsSelectedIndices.value);
        console.table({
            coin: props.coinToSellList.map((item) => item.symbol),
            withdraw: props.coinToSellList.map((item) => item.amount),
            relayReward: amountEstimationLimitForRelayRewardList.value,
            sws: amountEstimationAfterSwapToHubList.value,
            minter: props.minterEstimationList,
            final: amountEstimationToReceiveAfterDepositList.value,
        });
    }, {
        debounce: 500,
        maxWait: 1000,
        deep: true,
    });



    return {
        minAmountToWithdrawList,
        withdrawTxParamsList,
        withdrawFeeTxParamsList,
        // withdrawAmountToReceiveDistribution,

        swsList,
        swsSelectedIndices,
        amountEstimationAfterSwapToHubList,
        amountEstimationToReceiveAfterDepositList,

        setSmartWalletPortfolioSellProps: setProps,
    };
}
