import {ref, reactive, computed, watch, watchEffect, toRefs, set} from 'vue';
import {watchDebounced} from '@vueuse/core';
import Big, {BIG_ROUND_DOWN, BIG_ROUND_UP} from 'minterjs-util/src/big.js';
import {getErrorText} from '~/assets/server-error.js';
import {HUB_WITHDRAW_SPEED, HUB_CHAIN_BY_ID} from '~/assets/variables.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3SmartWalletWithRelayRewardForPortfolio from '~/composables/use-web3-smartwallet-portfolio.js';
import useWeb3SmartWalletSwapWithdraw from '~/composables/use-web3-smartwallet-swap-withdraw.js';
import useWeb3Withdraw from '~/composables/use-web3-withdraw.js';


export default function useWeb3SmartWalletPortfolioBuy() {
    const {
        setSmartWalletPortfolioProps,
        maxAmountEstimationLimitForRelayReward,
        smartWalletAddress,
        recalculateAmountEstimationLimit,
        buildTxForRelayReward,
        callSmartWallet,
    } = useWeb3SmartWalletWithRelayRewardForPortfolio({estimationThrottle: 500});
    const {
        tokenDecimals: tokenToSellDecimals,
        tokenContractAddressFixNative: tokenToSellAddress,
        setHubTokenProps: setHubTokenToSellProps,
    } = useHubToken();
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
        recalculateAmountToReceive,
    } = useWeb3Withdraw();


    const props = reactive({
        privateKey: '',
        evmAccountAddress: '',
        depositDestinationAddress: '',
        /** @type {ChainId} */
        chainId: 0,
        coinToSell: '',
        // amount used to withdraw (before sell to hub)
        // must be provided value for all portfolio coins, despite how many of them supposed to trade via cross-chain (to ensure, that valueDistribution is aligned with coin to buy allocation)
        valueToSell: 0,
        /** @type {Array<{symbol: string, allocationPart: string|number}>} */
        coinToBuyList: [],
        /** @type {Array<string|number>} */
        minterEstimationList: [],
        minterFeeToDeduct: 0,
        isLocked: false,

    });

    /**
     * @param {Partial<props>} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
        setHubTokenToSellProps({
            tokenSymbol: props.coinToSell,
            chainId: props.chainId,
        });
    }


    // smart-wallet-swap list
    // prefill on creation to exclude bugs with dynamic setting properties of reactive object https://github.com/vuejs/composition-api/issues/580
    const swsList = ref(Array.from({length: 10}));
    // not account relay reward
    const estimationBeforeRelayRewardList = computed(() => {
        return props.coinToBuyList.map((item, index) => {
            return swsList.value[index]?.amountEstimationAfterSwapToHub || 0;
        });
    });
    // list of sws indices selected to swap (these smart-wallet swaps are considered better than Minter swaps)
    const swsSelectedIndices = ref([]);
    // considers relay reward and filtered only if sws swap better than minter
    const amountEstimationToReceiveAfterDepositList = ref([]);

    const complexity = computed(() => {
        return swsSelectedIndices.value.length;
    });
    const estimationComplexity = computed(() => {
        return estimationBeforeRelayRewardList.value.filter((item) => item > 0).length;
    });

    // used as value for swap estimation, relay reward will be subtracted later, to ensure, that changes to coinToBuyList will not affect valueDistribution and will not fire re-estimation
    const valueDistribution = computed(() => {
        return props.coinToBuyList.map((item) => {
            if (!props.valueToSell) {
                return 0;
            }
            return new Big(props.valueToSell || 0).times(item.allocationPart).toString(undefined, BIG_ROUND_DOWN);
        });
    });
    const amountToWithdraw = computed(() => {
        return getAmountToWithdraw(valueDistribution.value, swsSelectedIndices.value);
    });
    const minterFeeDistribution = computed(() => {
        const allocationDistribution = expandAllocation(prepareAllocationList(swsSelectedIndices.value));
        return allocationDistribution.map((allocationPart) => {
            return new Big(props.minterFeeToDeduct || 0).times(allocationPart).toString(undefined, BIG_ROUND_UP);
        });
    });
    const withdrawAmountToReceiveDistribution = computed(() => {
        return recalculateWithdrawAmountToReceiveDistribution(valueDistribution.value, swsSelectedIndices.value);
    });
    const relayRewardDistribution = computed(() => getRelayRewardDistribution(swsSelectedIndices.value));
    const amountToSellForSwapToHubDistribution = computed(() => getAmountToSellForSwapToHubDistribution(relayRewardDistribution.value, withdrawAmountToReceiveDistribution.value));
    function getAmountToSellForSwapToHubDistribution(relayRewardDistributionList, withdrawAmountToReceiveDistributionList) {
        return withdrawAmountToReceiveDistributionList.map((withdrawAmountToReceiveItem, index) => {
            const amountEstimationLimitForRelayRewardItem = relayRewardDistributionList[index];
            if (!amountEstimationLimitForRelayRewardItem || amountEstimationLimitForRelayRewardItem <= 0) {
                return 0;
            }
            return new Big(withdrawAmountToReceiveItem || 0).minus(amountEstimationLimitForRelayRewardItem).toString();
        });
    }

    //@TODO combine loaders from swsList and postpone swsSelectedIndices recalculation while isSmartWalletSwapParamsLoading
    // const isSmartWalletSwapParamsLoading = computed(() => {
    //     return state.isEstimationLimitForRelayRewardsLoading || state.isEstimationAfterSwapToHubLoading;
    // });
    //
    // const smartWalletSwapParamsError = computed(() => {
    //     return state.estimationLimitForRelayRewardsError || state.estimationAfterSwapToHubError;
    // });

    watchEffect(() => setSmartWalletPortfolioProps({
        privateKey: props.privateKey,
        evmAccountAddress: props.evmAccountAddress,
        chainId: props.chainId,
        gasTokenAddress: tokenToSellAddress.value,
        gasTokenDecimals: tokenToSellDecimals.value,
        complexity: complexity.value,
        estimationComplexity: estimationComplexity.value,
        estimationSkip: estimationComplexity.value === 0,
    }), {});

    const dummySmartWalletTxHash = Array.from({length: 64}).fill('0').join('');
    watchEffect(() => setWithdrawProps({
        hubNetworkSlug: HUB_CHAIN_BY_ID[props.chainId]?.hubNetworkSlug,
        amountToSend: amountToWithdraw.value,
        tokenSymbol: props.coinToSell,
        accountAddress: props.evmAccountAddress?.replace('0x', 'Mx'),
        destinationAddress: smartWalletAddress.value,
        speed: HUB_WITHDRAW_SPEED.FAST,
        // placeholder for minter tx payload
        smartWalletTx: dummySmartWalletTxHash,
    }));

    watch(props, () => {
        // init
        props.coinToBuyList.forEach((item, index) => {
            if (!swsList.value[index]) {
                set(swsList.value, index, useWeb3SmartWalletSwapWithdraw());
            }

            swsList.value[index].setSmartWalletSwapWithdrawProps({
                privateKey: props.privateKey,
                evmAccountAddress: props.evmAccountAddress,
                depositDestinationAddress: props.depositDestinationAddress,
                chainId: props.chainId,
                // valueToSell is set in `valueDistribution` watcher
                // valueToSell: undefined,
                coinToSell: props.coinToSell,
                coinToBuy: item.symbol,
                skipRelayReward: true,
                idPreventConcurrency: `estimateSwsBuy${index}`,
            });
        });
    }, {deep: true});

    watch(valueDistribution, () => {
        valueDistribution.value.forEach((valueToSell, index) => {
            swsList.value[index].setSmartWalletSwapWithdrawProps({
                valueToSell,
            });
        });
    });

    // @ts-expect-error WatchDebouncedOptions extend WatchOptions can't detect 'deep'
    watchDebounced([
        () => props.coinToBuyList,
        () => props.minterEstimationList,
        () => props.minterFeeToDeduct,
        maxAmountEstimationLimitForRelayReward,
        valueDistribution,
        estimationBeforeRelayRewardList,
        withdrawAmountToReceive,
    ], () => {
        if (props.isLocked) {
            return;
        }
        // list of indexes taking part in sws
        const swsIndices = filterSameTokenIndex(getIndicesOfPositiveValues(estimationBeforeRelayRewardList.value));
        console.log('swsIndices', swsIndices, estimationBeforeRelayRewardList.value);
        if (!swsIndices.length) {
            swsSelectedIndices.value = [];
            amountEstimationToReceiveAfterDepositList.value = [];
            return;
        }
        // list of indexes of coins to swap via smart wallet, which are preferred even in worst case
        let swsBetterDefinitely = [];
        // list of indexes of coins to not swap via smart wallet, which are more bad even in best case
        let swsNotBetterDefinitely = [];
        // list to try
        let swsProbably = swsIndices.slice();
        // list of excluded after try
        let swsToExclude = [];

        // if relay reward is paid fully for each token
        console.log('worst');
        const worstEstimationRelayReward = recalculateAmountEstimationLimit(1);
        const worstEstimationList = Array.from({length: valueDistribution.value.length}).map((empty, index) => {
            const indexString = index.toString();
            if (!swsIndices.includes(indexString)) {
                return 0;
            }
            // operate with array of lists with singe item to reuse current implementation
            // @TODO maybe rewrite for performance (will need to use `recalculateAmountToReceive` instead of `recalculateWithdrawAmountToReceiveDistribution`)
            function getValueDistributionWithSingleItem(indexString, valueDistributionList) {
                const valueToSellListWithSingleItem = Array.from({length: valueDistributionList.length}).fill(0);
                valueToSellListWithSingleItem[indexString] = valueDistributionList[indexString];
                return valueToSellListWithSingleItem;
            }
            const estimationList = getEstimationAfterRelayRewardList(
                getValueDistributionWithSingleItem(indexString, valueDistribution.value),
                Array.from({length: valueDistribution.value.length}).fill(worstEstimationRelayReward),
                estimationBeforeRelayRewardList.value,
                swsIndices,
            );
            return estimationList[indexString];
        });
        worstEstimationList.forEach((worstEstimation, index) => {
            if (props.minterEstimationList[index] && new Big(worstEstimation).gt(props.minterEstimationList[index])) {
                swsBetterDefinitely.push(index.toString());
            }
        });

        // @TODO bestEstimation is redundant (kept only for debug reason)
        // if relay reward is distributed among every token to buy
        if (process.env.NODE_ENV === 'development') {
            console.log('best');
            var bestEstimationList = getEstimationAfterRelayRewardList(
                valueDistribution.value,
                // distribution of coinToSell to spend for relay rewards, if it was distributed among each token (best case, when swap all via web3)
                getRelayRewardDistribution(swsIndices),
                estimationBeforeRelayRewardList.value,
                swsIndices,
            );
            bestEstimationList.forEach((bestEstimation, index) => {
                if (new Big(bestEstimation).lte(props.minterEstimationList[index] || 0)) {
                    swsNotBetterDefinitely.push(index.toString());
                }
            });
        }

        swsProbably = swsProbably.filter((item) => !swsBetterDefinitely.includes(item));
        // do while has something to exclude and has something to try
        // (stop when nothing to exclude or nothing to try)
        do {
            if (swsProbably.length === 0) {
                break;
            }
            const swsToTry = [].concat(swsBetterDefinitely, swsProbably);
            console.log('swsToTry', swsToTry);
            swsToExclude = [];
            const iterationEstimationList = getEstimationAfterRelayRewardList(
                valueDistribution.value,
                getRelayRewardDistribution(swsToTry),
                estimationBeforeRelayRewardList.value,
                swsToTry,
                swsProbably, // not swsToTry, to exclude swsBetterDefinitely from unnecessary calculations
            );
            iterationEstimationList.forEach((estimation, index) => {
                if (new Big(estimation).lte(props.minterEstimationList[index] || 0)) {
                    swsToExclude.push(index.toString());
                }
            });
            // filter already excluded and keep only new items to exclude
            swsToExclude = swsToExclude.filter((item) => swsProbably.includes(item));
            swsProbably = swsProbably.filter((item) => !swsToExclude.includes(item));
            if (process.env.NODE_ENV === 'development') {
                console.table({
                    coin: props.coinToBuyList.map((item) => item.symbol),
                    withdraw: valueDistribution.value,
                    receiveAfterWithdraw: recalculateWithdrawAmountToReceiveDistribution(valueDistribution.value,  swsToTry),
                    relayRewardDistribution: getRelayRewardDistribution(swsToTry),
                    sellDistribution: getAmountToSellForSwapToHubDistribution(getRelayRewardDistribution(swsToTry), recalculateWithdrawAmountToReceiveDistribution(valueDistribution.value,  swsToTry)),
                    worst: worstEstimationList,
                    best: bestEstimationList,
                    currentIterationBeforeRelayReward: estimationBeforeRelayRewardList.value,
                    currentIteration: iterationEstimationList,
                    minter: props.minterEstimationList,
                });
                console.log(swsBetterDefinitely, swsNotBetterDefinitely, swsProbably, swsToExclude);
            }
        } while (swsToExclude.length !== 0 && swsProbably.length !== 0);

        const swsFinal = [].concat(swsBetterDefinitely, swsProbably);
        swsSelectedIndices.value = swsFinal;
        amountEstimationToReceiveAfterDepositList.value = getEstimationAfterRelayRewardList(
            valueDistribution.value,
            getRelayRewardDistribution(swsFinal),
            estimationBeforeRelayRewardList.value,
            swsFinal,
            swsFinal,
        );
        console.log('swsFinal', swsFinal);
        if (process.env.NODE_ENV === 'development') {
            console.table({
                coin: props.coinToBuyList.map((item) => item.symbol),
                withdraw: valueDistribution.value,
                receiveAfterWithdraw: recalculateWithdrawAmountToReceiveDistribution(valueDistribution.value, swsFinal),
                finalRelayRewardDistribution: getRelayRewardDistribution(swsFinal),
                sellDistribution: getAmountToSellForSwapToHubDistribution(getRelayRewardDistribution(swsFinal), recalculateWithdrawAmountToReceiveDistribution(valueDistribution.value, swsFinal)),
                worst: worstEstimationList,
                best: bestEstimationList,
                final: amountEstimationToReceiveAfterDepositList.value,
                minter: props.minterEstimationList,
            });
        }

        // swsProbably = swsProbably.filter((item) => !swsBetterDefinitely.includes(item) && !swsNotBetterDefinitely.includes(item));

        /*
        let probablyIndexCombinationList = getCombinations(swsProbably);
        if (swsBetterDefinitely.length === 0) {
            // cases when fee is paid fully for 1 token already covered by worstEstimation
            probablyIndexCombinationList = probablyIndexCombinationList.filter((item) => item.length > 1);
        }
        const tryCombinationListUnsorted = probablyIndexCombinationList.map((indices) => {
            return [].concat(swsBetterDefinitely, indices).map((index) => props.coinToBuyList[index]);
        });
        const tryCombinationAllocationSumList = tryCombinationListUnsorted.map((combination, index) => {
            return {
                allocationSum: getSum(combination.map((item) => item.allocationPart)),
                combinationIndex: index,
            };
        });
        tryCombinationAllocationSumList.sort((a, b) => Number(b.allocationSum) - Number(a.allocationSum));
        const tryCombinationList = tryCombinationAllocationSumList.map((item) => {
            return tryCombinationListUnsorted[item.combinationIndex];
        });
        */
    }, {
        deep: true,
        debounce: 500,
        maxWait: 2000,
    });

    /**
     * https://codereview.stackexchange.com/a/7042
     * @template {string} T
     * @param {Array<T>} list
     * @returns {Array<Array<T>>}
     */
    function getCombinations(list) {
        let result = [];
        combine([], list);
        return result;
        /**
         * @param {Array} prefix
         * @param {Array} unused
         */
        function combine(prefix, unused) {
            for (let i = 0; i < unused.length; i++) {
                result.push([].concat(prefix, unused[i]));
                combine([].concat(prefix, unused[i]), unused.slice(i + 1));
            }
        }
    }

    /**
     * @param {Array<number|string>} list
     * @returns {Array<string>}
     */
    function getIndicesOfPositiveValues(list) {
        return Object.entries(list)
            .filter((entry) => Number(entry[1]) > 0)
            .map(([index]) => index);
    }

    /**
     * @param {Array<number|string>} valueDistributionList
     * @param {Array<string>} pickIndices
     * @return {string|number}
     */
    function getAmountToWithdraw(valueDistributionList, pickIndices) {
        const sum = getSum(filterByPickIndices(valueDistributionList, pickIndices), false);
        return sum.minus(props.minterFeeToDeduct).toString();
    }

    /**
     * @param {Array<number|string>} valueDistributionList
     * @param {Array<string>} pickIndices
     * @returns {Array<string|number>}
     */
    function recalculateWithdrawAmountToReceiveDistribution(valueDistributionList, pickIndices) {
        const currentAmountToWithdraw = getAmountToWithdraw(valueDistributionList, pickIndices);
        const currentWithdrawAmountToReceive = recalculateAmountToReceive(currentAmountToWithdraw);
        // console.log('recalculateWithdrawAmountToReceiveDistribution', valueDistributionList, pickIndices, currentAmountToWithdraw, currentWithdrawAmountToReceive);
        return valueDistributionList.map((valueItem, index) => {
            if (isExcludeByIndex(index, pickIndices) || Number(currentAmountToWithdraw) <= 0) {
                return 0;
            }
            const minterFeePart = minterFeeDistribution.value[index];
            const valueAfterMinterFee = new Big(valueItem).minus(minterFeePart).toString();
            const part = new Big(currentWithdrawAmountToReceive || 0).div(currentAmountToWithdraw);
            return part.times(valueAfterMinterFee).toString();
        });
    }

    /**
     * @param {Array<string>} [pickIndices]
     * @param {number|string} [overrideRelayRewardEstimationLimit]
     * @returns {Array<number|string>}
     */
    function getRelayRewardDistribution(pickIndices, overrideRelayRewardEstimationLimit) {
        // cast portfolio coinToBuy allocation to smart-wallet valueToSell allocation (e.g. if buying only 3 items of 10 coin portfolio)
        const expandedAllocationPartDistribution = expandAllocation(prepareAllocationList(pickIndices));
        const complexity = expandedAllocationPartDistribution.filter((allocationPart) => Number(allocationPart) > 0).length;
        const amountEstimationLimitForRelayRewardRecalculated = overrideRelayRewardEstimationLimit || recalculateAmountEstimationLimit(complexity);
        // console.log('expandedAllocationPartDistribution', expandedAllocationPartDistribution)
        // console.log('amountEstimationLimitForRelayReward', amountEstimationLimitForRelayReward.value, amountEstimationLimitForRelayRewardRecalculated, complexity);
        return expandedAllocationPartDistribution.map((allocationPart) => {
            return new Big(amountEstimationLimitForRelayRewardRecalculated).times(allocationPart).toString(undefined, BIG_ROUND_UP);
        });
    }

    /**
     * @param {Array<string>} [pickIndices]
     * @returns {Array<number|string>}
     */
    function prepareAllocationList(pickIndices) {
        return props.coinToBuyList.map((item, index) => {
            const isSameToken = item.symbol === props.coinToSell;
            if (isSameToken || isExcludeByIndex(index, pickIndices)) {
                return 0;
            }
            return item.allocationPart;
        });
    }

    /**
     * Spread allocation list to 1 (make sum of allocations to be equal to 1)
     * @param {Array<number|string>} allocationList - list of allocation parts (from 0 to 1)
     * @return {Array<number|string>}
     */
    function expandAllocation(allocationList) {
        const allocationSum = getSum(allocationList, false);
        return allocationList.map((allocationPart) => {
            // 1 / narrowAllocationSum == wideAllocation / narrowAllocation
            // wideAllocation = narrowAllocation * 1 / narrowAllocationSum
            return new Big(allocationSum).gt(0) ? new Big(allocationPart).div(allocationSum).toString() : 0;
        });
    }

    /**
     * @param {Array<number|string>} numberList
     * @param {boolean} [castToString=true]
     * @returns {string|Big}
     */
    function getSum(numberList, castToString = true) {
        const sum = numberList.reduce((accumulator, numberItem) => {
            return accumulator.plus(numberItem);
        }, new Big(0));
        return castToString ? sum.toString() : sum;
    }

    /**
     * @param {number|string} index
     * @param {Array<string>} [pickIndices]
     * @returns {boolean}
     */
    function isExcludeByIndex(index, pickIndices) {
        return pickIndices && !pickIndices.includes(index.toString());
    }

    /**
     * @template {any} T
     * @param {Array<T>} list
     * @param {Array<string>} [pickIndices]
     * @returns {Array<T>}
     */
    function filterByPickIndices(list, pickIndices) {
        return list.filter((item, index) => !isExcludeByIndex(index, pickIndices));
    }

    /**
     * @param {Array<string>} indices
     * @returns {Array<string>}
     */
    function filterSameTokenIndex(indices) {
        const sameTokenIndex = props.coinToBuyList.findIndex((item) => item.symbol === props.coinToSell);
        return indices.filter((index) => index !== sameTokenIndex.toString());
    }

    /**
     * @param {string|number} valueBeforeRelayReward
     * @param {string|number} estimationBeforeRelayReward
     * @param {string|number} valueAfterRelayReward
     * @return {string|number}
     */
    function getEstimationAfterRelayReward(valueBeforeRelayReward, estimationBeforeRelayReward, valueAfterRelayReward) {
        if (!Number(valueBeforeRelayReward)) {
            return 0;
        }
        // valueToSellToEstimate / valueAfterRelayReward = amountEstimationAfterSwapToHub / estimationAfterRelayReward
        // estimationAfterRelayReward = valueAfterRelayReward / valueToSellToEstimate * amountEstimationAfterSwapToHub
        return new Big(valueAfterRelayReward).div(valueBeforeRelayReward).times(estimationBeforeRelayReward).toString();
    }

    /**
     * recalculate estimations according to withdraw fee and relay reward
     * @param {Array<number|string>} valueToSellList
     * @param {Array<number|string>} relayRewardList
     * @param {Array<number|string>} estimationList
     * @param {Array<string>} distributionPickIndices
     * @param {Array<string>} [optimizationPickIndices] - pick indices to calculate (skip unnecessary calculations)
     * @return {Array<number|string>}
     */
    function getEstimationAfterRelayRewardList(valueToSellList, relayRewardList, estimationList, distributionPickIndices, optimizationPickIndices) {
        const withdrawAmountToReceiveDistribution = recalculateWithdrawAmountToReceiveDistribution(valueToSellList, distributionPickIndices);
        return valueToSellList.map((valueToSellForEstimation, index) => {
            if (isExcludeByIndex(index, optimizationPickIndices)) {
                return 0;
            }
            const withdrawAmountToReceiveBeforeRelayReward = withdrawAmountToReceiveDistribution[index];
            const valueToSellAfterRelayReward = new Big(withdrawAmountToReceiveBeforeRelayReward).minus(relayRewardList[index]).toString();
            const estimationAfterRelayReward = getEstimationAfterRelayReward(valueToSellForEstimation, estimationList[index], valueToSellAfterRelayReward);
            return estimationAfterRelayReward;
        });
    }



    /**
     * @return {Promise<SmartWalletRelaySubmitTxResult>}
     */
    async function buildTxListAndCallSmartWallet() {
        const {txList: txListForRelayReward, swapLimit} = await buildTxForRelayReward();
        const relayRewardDistributionFinal = getRelayRewardDistribution(swsSelectedIndices.value, swapLimit);
        const amountToSellForSwapToHubDistributionFinal = getAmountToSellForSwapToHubDistribution(relayRewardDistributionFinal, withdrawAmountToReceiveDistribution.value);

        const buildSwapPromiseList = [];
        swsSelectedIndices.value.forEach((indexString) => {
            const overrideAmount = amountToSellForSwapToHubDistributionFinal[indexString];
            buildSwapPromiseList.push(swsList.value[indexString].buildSwapTxList({overrideAmount}));
        });
        if (buildSwapPromiseList.length < 1) {
            throw new Error('Nothing to swap');
        }
        const swapToHubList = await Promise.all(buildSwapPromiseList);
        console.log(txListForRelayReward);
        console.log(swapToHubList);
        return callSmartWallet([].concat(txListForRelayReward, ...swapToHubList))
            .then((result) => {
                console.log(result);
                return result;
            });
    }

    return {
        amountToWithdraw,
        minAmountToWithdraw,
        withdrawTxParams,
        withdrawFeeTxParams,
        withdrawAmountToReceiveDistribution,

        swsList,
        swsSelectedIndices,
        valueDistribution,
        // usedAllocationPartDistribution,
        relayRewardDistribution,
        amountToSellForSwapToHubDistribution,
        amountEstimationBeforeRelayRewardList: estimationBeforeRelayRewardList,
        amountEstimationToReceiveAfterDepositList,

        setSmartWalletPortfolioBuyProps: setProps,
        getSum,
        expandAllocation,
        buildTxListAndCallSmartWallet,
    };
}
