<script>
import {shortHashFilter, getTime, getEvmTxUrl, getExplorerTxUrl, pretty} from '~/assets/utils.js';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_DATA, HUB_CHAIN_BY_ID} from '~/assets/variables.js';
import Loader from '~/components/base/BaseLoader.vue';
import TxPreview from '~/components/base/TxPreview.vue';

export default {
    LOADING_STAGE,
    components: {
        Loader,
        TxPreview,
    },
    props: {
        step: {
            type: Object,
            required: true,
        },
        loadingStage: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
        };
    },
    computed: {
        // @TODO update distance continuously
        timestamp() {
            return this.step.tx?.timestamp;
        },
        // timeDistance() {
        //     return getTimeDistance(this.timestamp);
        // },
        time() {
            return this.timestamp ? getTime(this.timestamp) : '';
        },
        hash() {
            return this.step.tx?.hash || '';
        },
        nativeSymbol() {
            if (!this.step.tx) {
                return;
            }
            return HUB_CHAIN_BY_ID[this.step.tx.params?.chainId].coinSymbol;
        },
        txUrl() {
            if (this.hash.indexOf('Mt') === 0) {
                return getExplorerTxUrl(this.hash);
            }
            if (this.hash.indexOf('0x') === 0) {
                return getEvmTxUrl(this.step.tx.params?.chainId, this.hash);
            }
            if (this.hash && this.step.relayParams) {
                return `https://explorer.minter.network/smart-wallet-relay/${this.step.relayParams.hubNetworkSlug}/${this.hash}`;
            }

            return '';
        },
    },
    methods: {
        pretty,
        formatHash: (value) => shortHashFilter(value, 8),
        getEvmNetworkName(networkSlug) {
            return HUB_CHAIN_DATA[networkSlug]?.shortName || 'EVM';
        },
        isLoadingStage(stage) {
            return new RegExp(`^${stage}\\d*$`).test(this.loadingStage);
        },
    },
};
</script>

<template>
    <div>
        <div class="hub__buy-transaction-row" :class="{'u-hidden': loadingStage === $options.LOADING_STAGE.FINISH && (!step.amount || !step.coin)}">
            <span class="hub__buy-transaction-emoji u-emoji" v-if="step.error || (step.tx && step.tx.error)">❌</span>
            <span class="hub__buy-transaction-emoji u-emoji" v-else-if="step.finished">✅</span>
            <Loader class="hub__buy-loader" v-else :is-loading="true"/>

            <template v-if="loadingStage === $options.LOADING_STAGE.WAIT_ETH">
                {{ $td(`${getEvmNetworkName(step.network)} top-up to`, 'form.stage-wait-evm', {network: getEvmNetworkName(step.network)}) }}
                <template v-if="step.amount || step.coin">{{ step.amount }} {{ step.coin }}</template>
            </template>
            <template v-if="loadingStage === $options.LOADING_STAGE.WRAP_ETH">
                {{ $td('Wrap', 'form.stage-wrap') }} {{ pretty(step.amount) }} {{ nativeSymbol }}
            </template>
            <template v-if="loadingStage === $options.LOADING_STAGE.SWAP_ETH">
                {{ $td('Swap', 'form.stage-swap') }} {{ pretty(step.amount0) }} {{ step.coin0 }} {{ $td('for', 'form.stage-for') }} {{ step.coin1 }}
            </template>
            <template v-if="loadingStage === $options.LOADING_STAGE.APPROVE_BRIDGE">
                {{ $td('Approve', 'form.stage-approve') }} {{ step.coin }}
            </template>
            <template v-if="loadingStage === $options.LOADING_STAGE.SEND_TO_RELAY">
                {{ $td('Send', 'form.stage-send') }} {{ pretty(step.amount) }} {{ step.coin }} {{ $td('from smart-wallet', 'form.stage-to-relay') }}
            </template>
            <template v-if="isLoadingStage($options.LOADING_STAGE.SEND_BRIDGE)">
                {{ $td('Send', 'form.stage-send') }} {{ pretty(step.amount) }} {{ step.coin }} {{ $td('to bridge', 'form.stage-to-bridge') }}
            </template>
            <template v-if="isLoadingStage($options.LOADING_STAGE.WAIT_BRIDGE)">
                <template v-if="!step.finished">{{ $td('Waiting', 'form.stage-waiting') }} {{ step.coin }} {{ $td('from bridge', 'form.stage-from-bridge') }}</template>
                <template v-else>{{ $td('Received', 'form.stage-received') }} {{ pretty(step.amount) }} {{ step.coin }} {{ $td('from bridge', 'form.stage-from-bridge') }}</template>
            </template>
            <template v-if="loadingStage === $options.LOADING_STAGE.SWAP_MINTER">
                {{ $td('Swap', 'form.stage-swap') }} {{ pretty(step.amount0) }} {{ step.coin0 }} {{ $td('for', 'form.stage-for') }} {{ step.coin1 }}
            </template>
            <template v-if="loadingStage === $options.LOADING_STAGE.FINISH">
                {{ $td('Received', 'form.stage-received') }} {{ pretty(step.amount) }} {{ step.coin }}
            </template>
            <TxPreview
                class="u-display-inline"
                v-if="step.txParams && isLoadingStage($options.LOADING_STAGE.MINTER)"
                :tx="step.txParams"
            />
        </div>
        <div class="hub__buy-transaction-row hub__buy-transaction-meta">
            <a v-if="txUrl" :href="txUrl" class="link--main link--hover" target="_blank">{{ formatHash(hash) }}</a>
            <div class="hub__buy-time" v-if="time">
                {{ time }}
            </div>
        </div>
    </div>
</template>
