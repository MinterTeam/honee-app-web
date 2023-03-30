import {reactive, computed, toRefs, watch} from 'vue';
import {getFeeAmount} from '~/api/web3.js';
import {NATIVE_COIN_ADDRESS} from '~/assets/variables.js';
import {wait} from '~/assets/utils/wait.js';
import useWeb3SmartWalletWithRelayReward from '~/composables/use-web3-smartwallet-relay-reward.js';


export default function useWeb3SmartWalletPortfolio({estimationThrottle = undefined} = {}) {
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
            complexity: newProps.estimationComplexity,
        });
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
