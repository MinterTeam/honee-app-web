<script>
import {VueNowMixinFactory} from 'vue-now';
import {convertFromPip} from 'minterjs-util/src/converter.js';
import {getTransferFee, subscribeTransfer} from '~/api/hub.js';
import {getChainIdByHubNetwork} from '~/api/web3.js';
import Big from 'minterjs-util/src/big.js';
import {getExplorerTxUrl, getEvmTxUrl, getTimeDistance, getTimeStamp as getTime, shortHashFilter, pretty, isHubTransferFinished} from '~/assets/utils.js';
import {HUB_CHAIN_DATA, HUB_TRANSFER_STATUS as WITHDRAW_STATUS} from '~/assets/variables.js';
import BaseCoinSymbol from '~/components/base/BaseCoinSymbol.vue';
import Loader from '~/components/base/BaseLoader.vue';



export default {
    WITHDRAW_STATUS,
    HUB_CHAIN_DATA,
    components: {
        BaseCoinSymbol,
        Loader,
    },
    mixins: [
        VueNowMixinFactory(5000),
    ],
    fetch() {
        this.$store.dispatch('hub/loadWithdrawList');
    },
    data() {
        return {
            txPollList: {},
        };
    },
    computed: {
        hasTx() {
            return Object.keys(this.$store.state.hub.minterList).length;
        },
        withdrawList() {
            return Object.values(this.$store.state.hub.minterList)
                .sort((a, b) => {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
        },
    },
    watch: {
        '$store.state.hub.minterList': {
            handler: function(list = {}) {
                Object.keys(list).forEach((hash) => {
                    if (this.txPollList[hash]) {
                        // already polling
                        return;
                    }
                    const withdraw = list[hash];
                    if (isHubTransferFinished(withdraw?.status)) {
                        return;
                    }

                    const [promiseWithEmitter, unsubscribe] = subscribeTransfer(hash, withdraw.timestamp);
                    this.txPollList[hash] = unsubscribe;
                    promiseWithEmitter
                        .on('update', (transfer) => {
                            this.$store.commit('hub/updateWithdraw', transfer);
                        })
                        .then((transfer) => {
                            delete this.txPollList[hash];
                            return getTransferFee(hash)
                                .then((transferFee) => {
                                    return {
                                        ...transfer,
                                        bridgeFee: transferFee.valCommission,
                                    };
                                });
                        })
                        .then((transfer) => {
                            this.$store.commit('hub/updateWithdraw', transfer);
                        })
                        .catch((error) => {
                            if (error.message !== 'unsubscribed') {
                                console.log(error);
                            } else {
                                delete this.txPollList[hash];
                            }
                        });
                });
            },
            deep: true,
            immediate: true,
        },
    },
    destroyed() {
        Object.values(this.txPollList).forEach((unsubscribe) => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
    },
    methods: {
        getTime,
        getTimeDistance,
        getExplorerTxUrl,
        convertFromPip,
        pretty,
        formatHash: (value) => shortHashFilter(value || '', 13),
        isHubTransferFinished,
        getAmount(withdraw) {
            return new Big(withdraw.tx.data.value).minus(withdraw.bridgeFee || 0).minus(withdraw.networkFee || 0).toString();
        },
        getDestinationUrl(withdraw) {
            return getEvmTxUrl(getChainIdByHubNetwork(withdraw.destination), withdraw.outTxHash);
        },
    },
};
</script>

<template>
    <div class="" v-if="hasTx">
        <div class="u-h--uppercase u-mb-05">{{ $td('Last withdraw', 'hub.last-withdraw') }}</div>
        <div class="form-row" v-for="withdraw in withdrawList" :key="withdraw.tx.hash">
            <div class="hub__preview-transaction-row u-text-overflow">
                <div class="u-fw-700">
                    {{ pretty(getAmount(withdraw)) }}
                    <BaseCoinSymbol>{{ withdraw.tx.data.coin.symbol }}</BaseCoinSymbol>
                </div>
                <div>
                    <a class="u-text-medium link--main" :href="getExplorerTxUrl(withdraw.tx.hash)" target="_blank">{{ formatHash(withdraw.tx.hash) }}</a>
                </div>
            </div>

            <div class="hub__preview-transaction-row hub__preview-transaction-meta">
                <div>
                    {{ getTimeDistance(withdraw.timestamp || 0, undefined, $now) }} {{ $td('ago', 'hub.ago') }} ({{ getTime(withdraw.timestamp || 0) }})
                    {{ $td('to', 'hub.to') }} {{ $options.HUB_CHAIN_DATA[withdraw.destination].shortName }}
                </div>
                <div>
                    <template v-if="!withdraw.status || withdraw.status === $options.WITHDRAW_STATUS.not_found">{{ $td('Sending to Hub bridge', 'hub.sending-to-bridge') }}</template>
                    <template v-if="withdraw.status === $options.WITHDRAW_STATUS.not_found_long">{{ $td('Not found', 'hub.not-found') }}</template>
                    <!--  @TODO combine deposit_to_hub_received & batch_created into "Bridge received tx and wait gas conditions to proceed" -->
                    <template v-if="withdraw.status === $options.WITHDRAW_STATUS.deposit_to_hub_received">{{ $td('Bridge collecting batch', 'hub.bridge-batch') }}</template>
                    <template v-if="withdraw.status === $options.WITHDRAW_STATUS.batch_created">{{ $td('Sent to', 'hub.sent-to') }} {{ $options.HUB_CHAIN_DATA[withdraw.destination].shortName }}, {{ $td('waiting confirmation', 'hub.waiting-confirmation') }}</template>
                    <template v-if="withdraw.status === $options.WITHDRAW_STATUS.batch_executed">
                        {{ $td('Success', 'form.success-title') }}
                        <a class="link--main" :href="getDestinationUrl(withdraw)" target="_blank">{{ formatHash(withdraw.outTxHash) }}</a>
                    </template>
                    <template v-if="withdraw.status === $options.WITHDRAW_STATUS.refund">{{ $td('Refunded', 'hub.refunded') }}</template>

                    <Loader class="hub__preview-loader" :is-loading="!isHubTransferFinished(withdraw.status)"/>
                </div>
            </div>
        </div>
    </div>
</template>
