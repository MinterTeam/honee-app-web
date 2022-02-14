<script>
import {shortHashFilter, getTime, getEvmTxUrl, getExplorerTxUrl, pretty} from '~/assets/utils.js';
import Loader from '@/components/base/BaseLoader.vue';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_BY_ID} from '~/assets/variables.js';

export default {
    LOADING_STAGE,
    components: {
        Loader,
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
            return HUB_CHAIN_BY_ID[this.step.tx.params.chainId].coinSymbol;
        },
    },
    methods: {
        pretty,
        getEvmTxUrl,
        getExplorerTxUrl,
        formatHash: (value) => shortHashFilter(value, 8),
    },
};
</script>

<template>
    <div>
        <div class="hub__preview-transaction-row">
            <div>
                <Loader class="hub__buy-loader" :is-loading="!step.finished"/>

                <template v-if="loadingStage === $options.LOADING_STAGE.WRAP_ETH">
                    {{ $td('Wrap', 'form.stage-wrap') }} {{ pretty(step.amount) }} {{ nativeSymbol }}
                </template>
                <template v-if="loadingStage === $options.LOADING_STAGE.SWAP_ETH">
                    {{ $td('Swap', 'form.stage-swap') }} {{ pretty(step.amount0) }} {{ step.coin0 }} {{ $td('for', 'form.stage-for') }} {{ step.coin1 }}
                </template>
                <template v-if="loadingStage === $options.LOADING_STAGE.APPROVE_BRIDGE">
                    {{ $td('Approve', 'form.stage-approve') }} {{ step.coin }}
                </template>
                <template v-if="loadingStage === $options.LOADING_STAGE.SEND_BRIDGE">
                    {{ $td('Send', 'form.stage-send') }} {{ pretty(step.amount) }} {{ step.coin }} {{ $td('to bridge', 'form.stage-to-bridge') }}
                </template>
                <template v-if="loadingStage === $options.LOADING_STAGE.WAIT_BRIDGE">
                    <template v-if="!step.finished">{{ $td('Waiting', 'form.stage-waiting') }} {{ step.coin }} {{ $td('from bridge', 'form.stage-from-bridge') }}</template>
                    <template v-else>{{ $td('Received', 'form.stage-received') }} {{ pretty(step.amount) }} {{ step.coin }} {{ $td('from bridge', 'form.stage-from-bridge') }}</template>
                </template>
                <template v-if="loadingStage === $options.LOADING_STAGE.SWAP_MINTER">
                    {{ $td('Swap', 'form.stage-swap') }} {{ pretty(step.amount0) }} {{ step.coin0 }} {{ $td('for', 'form.stage-for') }} {{ step.coin1 }}
                </template>
                <template v-if="loadingStage === $options.LOADING_STAGE.FINISH">
                    {{ $td('Received', 'form.stage-received') }} {{ pretty(step.amount) }} {{ step.coin }}
                </template>
            </div>
        </div>
        <div class="hub__buy-transaction-row hub__preview-transaction-meta">
            <div>
<!-- @TODO chainId -->
                <a v-if="hash.indexOf('0x') === 0" :href="getEvmTxUrl(step.tx.params.chainId, hash)" class="link--main link--hover" target="_blank">{{ formatHash(hash) }}</a>
                <a v-if="hash.indexOf('Mt') === 0" :href="getExplorerTxUrl(hash)" class="link--main link--hover" target="_blank">{{ formatHash(hash) }}</a>
            </div>
            <div class="hub__buy-time">
                <template v-if="time">{{ time }}</template>
            </div>
        </div>
    </div>
</template>
