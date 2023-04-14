import {reactive, computed, toRefs, watch} from 'vue';
import {getFeeAmount} from 'minter-js-web3-sdk/src/web3.js';
import {HUB_CHAIN_BY_ID, NATIVE_COIN_ADDRESS} from '~/assets/variables.js';
import {wait} from '@shrpne/utils/src/wait.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import useWeb3SmartWalletWithRelayReward from 'minter-js-web3-sdk/src/composables/use-web3-smartwallet-relay-reward.js';


export default function useWeb3SmartWalletWithRelayRewardForPortfolio({estimationThrottle = undefined} = {}) {
    const {networkGasPrice, setHubOracleProps} = useHubOracle({
        subscribePriceList: true,
    });
    const {
        setSmartWalletProps,
        amountEstimationLimitForRelayReward,
        smartWalletAddress,
        swapToRelayRewardParams,
        gasPrice,
        estimateSpendLimitForRelayReward,
        getCombinedTxGasLimit,
        recalculateEstimation,
        buildTxForRelayReward,
        callSmartWallet,
    } = useWeb3SmartWalletWithRelayReward({estimationThrottle});

    const props = reactive({
        gasTokenAddress: '',
        complexity: 1,
        // used for finding tokens to buy when buying portfolio
        // in portfolioBuy we estimate max possible complexity (which is equal to number of coins to buy)
        estimationComplexity: undefined,
        estimationSkip: false,
    });

    /**
     * @param {Partial<props>&Partial<Parameters<setSmartWalletProps>[0]>} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps);
        setSmartWalletProps({
            ...newProps,
            gasPriceGwei: networkGasPrice.value,
            complexity: newProps.estimationComplexity,
        });
        if (newProps.chainId || newProps.chainId === 0) {
            setHubOracleProps({
                hubNetworkSlug: HUB_CHAIN_BY_ID[newProps.chainId]?.hubNetworkSlug || '',
                fixInvalidGasPriceWithDummy: false,
            });
        }
    }

    const state = reactive({
        /** @type {number|string} - used only in estimationComplexity mode */
        maxAmountEstimationLimitForRelayReward: 0,
    });

    watch(amountEstimationLimitForRelayReward, () => {
        state.maxAmountEstimationLimitForRelayReward = amountEstimationLimitForRelayReward.value;
    });

    // estimation of reward
    const maxMultiSwapCombinedTxGasLimit = computed(() => getCombinedTxGasLimit(props.estimationComplexity));

    function recalculateAmountEstimationLimit(complexity) {
        if (props.estimationSkip) {
            return 0;
        }
        if (props.gasTokenAddress === NATIVE_COIN_ADDRESS) {
            return getFeeAmount(gasPrice.value, getCombinedTxGasLimit(complexity));
        }
        if (complexity === props.estimationComplexity) {
            return state.maxAmountEstimationLimitForRelayReward;
        }

        return recalculateEstimation(complexity, maxMultiSwapCombinedTxGasLimit.value, state.maxAmountEstimationLimitForRelayReward);
    }


    /**
     * @return {Promise<ParaSwapTransactionsBuildCombined>}
     */
    async function buildTxForRelayRewardWrap() {
        setSmartWalletProps({
            complexity: props.complexity,
            estimationSkip: true,
        });
        await wait(10);
        return buildTxForRelayReward()
            .finally(() => {
                // restore
                setSmartWalletProps({
                    complexity: props.estimationComplexity,
                    estimationSkip: props.estimationSkip,
                });
            });
    }

    return {
        ...toRefs(state),
        setSmartWalletPortfolioProps: setProps,
        smartWalletAddress,
        // swapToRelayRewardParams,
        // estimateSpendLimitForRelayReward,
        recalculateAmountEstimationLimit,
        buildTxForRelayReward: buildTxForRelayRewardWrap,
        callSmartWallet,
    };
}
