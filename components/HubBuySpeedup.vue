<script>
import Big from 'minterjs-util/src/big.js';
import {web3Utils} from 'minter-js-web3-sdk/src/web3.js';
import {pretty, getEvmTxUrl, shortHashFilter} from '~/assets/utils.js';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_BY_ID} from '~/assets/variables.js';
import useNow from '~/composables/use-now.js';
import useHubOracle from '~/composables/use-hub-oracle.js';


export default {
    LOADING_STAGE,
    props: {
        /** @type {Array<SequenceStepItem>} */
        stepsOrdered: {
            type: Array,
            required: true,
        },
    },
    emits: [
        'speedup',
    ],
    setup() {
        const {now} = useNow();
        const {networkGasPrice, setHubOracleProps} = useHubOracle();

        return {
            now,

            networkGasPrice,
            setHubOracleProps,
        };
    },
    data() {
        return {
        };
    },
    computed: {
        ethGasPriceGwei() {
            return this.networkGasPrice;
        },
        slowStep() {
            const item = this.stepsOrdered.slice().reverse().find((item) => {
                const tx = item.tx;
                if (!tx || !tx.timestamp || !tx.params) {
                    return false;
                }
                const isEthTx = tx.hash.indexOf('0x') === 0;
                const isError = tx.error;
                const isMined = tx.blockHash;
                const isSlow = new Date(this.now) - new Date(tx.timestamp) > 6 * 1000;
                const canSpeedup = Number(tx.params.gasPrice) < Number(this.ethGasPriceGwei);

                return isEthTx && !isError && !isMined && isSlow && canSpeedup;
            });

            if (item) {
                item.tx.chainId = Number(item.tx.chainId);
                return item;
            }
            return undefined;
        },
    },
    created() {
        // hubTokenProps
        this.$watch(
            () => ({
                hubNetworkSlug: HUB_CHAIN_BY_ID[this.slowStep?.tx.chainId]?.hubNetworkSlug,
            }),
            (newVal) => this.setHubOracleProps(newVal),
            {deep: true, immediate: true},
        );
    },
    methods: {
        pretty,
        getEvmTxUrl,
        formatHash: (value) => shortHashFilter(value, 8),
        getFee(gasPriceGwei, gasLimit) {
            // gwei to ether
            const gasPrice = web3Utils.fromWei(web3Utils.toWei(gasPriceGwei.toString(), 'gwei'), 'ether');

            return new Big(gasPrice).times(gasLimit).toString();
        },
        speedup() {
            this.$emit('speedup', {
                txParams: {...this.slowStep.tx.params, gasPrice: this.ethGasPriceGwei},
                loadingStage: this.slowStep.loadingStage,
            });
        },
    },
};
</script>

<template>
    <div class="u-mt-20" v-if="slowStep">
        <h3 class="u-h5">Do you want to speed up pending tx?</h3>
        <div class="u-mt-05">
            Tx to speed up: <br>
            <template v-if="slowStep.loadingStage === $options.LOADING_STAGE.WRAP_ETH">
                Wrap ETH
            </template>
            <template v-if="slowStep.loadingStage === $options.LOADING_STAGE.SWAP_ETH">
                Swap {{ slowStep.coin0 }} for {{ slowStep.coin1 }}
            </template>
            <template v-if="slowStep.loadingStage === $options.LOADING_STAGE.APPROVE_BRIDGE">
                Approve {{ slowStep.coin }}
            </template>
            <template v-if="slowStep.loadingStage === $options.LOADING_STAGE.SEND_BRIDGE">
                Send {{ slowStep.coin }}
            </template>

            <a :href="getEvmTxUrl(slowStep.tx.chainId, slowStep.tx.hash)" class="link--main link--hover" target="_blank">{{ formatHash(slowStep.tx.hash) }}</a>
        </div>
        <div class="u-mt-05">
            Gas price change: <br> {{ slowStep.tx.params.gasPrice }} → <strong>{{ ethGasPriceGwei }}</strong>
        </div>
        <div class="u-mt-05">
            Fee change: <br> {{ getFee(slowStep.tx.params.gasPrice, slowStep.tx.params.gasLimit) }} ETH → <strong>{{ getFee(ethGasPriceGwei, slowStep.tx.params.gasLimit) }} ETH</strong>
        </div>
        <div class="u-mt-05 u-fw-500">
            <span class="u-emoji">⚠️</span> Make sure you have enough ETH on your address to pay new&nbsp;fee.
        </div>

        <button class="button button--main button--full u-mt-10" type="button" :class="{'is-disabled': !$store.state.onLine}" @click="speedup()">
            Speed up
        </button>
    </div>
</template>
