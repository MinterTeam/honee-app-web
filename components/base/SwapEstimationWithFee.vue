<back-script setup>
// https://vuejs.org/api/sfc-script-setup.html#usage-alongside-normal-script
import SwapEstimation from '~/components/base/SwapEstimation.vue';

// emits are overwritten in script-setup
defineEmits([...SwapEstimation.emits, 'update:fee']);
// props are merged between script-setup and script
// @TODO $attrs replaced with $props here
defineProps(SwapEstimation.props);
</back-script>

<script>
import {defineComponent} from 'vue';
import useFee from '~/composables/use-fee.js';
import SwapEstimation from '~/components/base/SwapEstimation.vue';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';

// wrap with useFee if used without TxSequence (which handles fee itself)
export default defineComponent({
    components: {
        SwapEstimation,
    },
    inheritAttrs: false,
    emits: [
        'update:fee',
        // 'update:v$estimation',
        // 'update:estimation',
        // 'update:tx-data',
        // 'update:fetch-state',
    ],
    props: {
        // can't rely on $attrs.coinToSell, because it is not normalized (can be defined as $attrs['coin-to-sell'])
        coinToSell: {
            type: String,
            required: true,
        },
        isWorstRoute: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const {fee, setFeeProps, refineFee} = useFee();

        return {
            fee,
            setFeeProps,
            refineFee,
        };
    },
    data() {
        return {
            txData: {},
        };
    },
    computed: {
        listenersPatched() {
            return patchListeners(this.$listeners, 'update:tx-data', this.handleTxData);
        },
        worstRoute() {
            return [this.coinToSell, 1, 2, 3, 4];
        },
    },
    watch: {
        fee: {
            handler(newVal) {
                this.$emit('update:fee', newVal);
            },
        },
    },
    created() {
        // feeBusParams
        this.$watch(
            () => {
                // don't use `this.txType`, it may lead to infinite loop
                const type = this.isWorstRoute ? TX_TYPE.SELL_SWAP_POOL : this.$refs.estimation?.getTxType?.(true);
                const coins = this.isWorstRoute ? this.worstRoute : this.txData?.coins;
                if (!coins || !type) {
                    return;
                }
                return {
                    txParams: {
                        type,
                        data: {
                            // pass only fields that affect fee
                            coinToSell: this.coinToSell,
                            coins,
                        },
                    },
                    baseCoinAmount: this.$store.getters.baseCoinAmount,
                    fallbackToCoinToSpend: true,
                };
            },
            (newVal) => newVal && this.setFeeProps(newVal),
            {deep: true, immediate: true},
        );
    },
    methods: {
        handleTxData(txData) {
            this.txData = txData;
        },
        getEstimation() {
            return this.$refs.estimation.getEstimation(...arguments);
        },
        getTxType() {
            return this.$refs.estimation.getTxType(...arguments);
        },
    },
});

/**
 * https://v2.vuejs.org/v2/api/#vm-listeners
 * @param {{ [key: string]: Function | Array<Function> }} listenerList
 * @param {string} key
 * @param {Function} invoker
 * @return {{ [key: string]: Function | Array<Function> }}
 */
function patchListeners(listenerList, key, invoker) {
    let listener = listenerList[key];
    if (!listener) {
        listener = invoker;
    } else if (typeof listener === 'function') {
        listener = [listener, invoker];
    } else if (Array.isArray(listener)) {
        listener = [...listener, invoker];
    }

    return {
        ...listenerList,
        [key]: listener,
    };
}



</script>

<template>
    <SwapEstimation
        ref="estimation"
        :coin-to-sell="coinToSell"
        v-bind="$attrs"
        v-on="listenersPatched"
        :fee="fee"
    />
</template>
