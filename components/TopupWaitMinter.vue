<script>
import {HUB_CHAIN_ID} from '~/assets/variables.js';
import {arrayToMap} from '~/assets/utils/collection.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import {TOP_UP_NETWORK} from '~/components/Topup.vue';

export default {
    components: {
        BaseLoader,
    },
    props: {
        networkSlug: {
            type: String,
            required: true,
        },
    },
    emits: [
        'topup',
    ],
    data() {
        return {
            isWaiting: true,
            serverError: '',
        };
    },
    computed: {
        /** @type {TopUpNetwork} */
        network() {
            return TOP_UP_NETWORK[this.networkSlug];
        },
    },
    watch: {
        '$store.state.balance': {
            /**
             * @param {Array<BalanceItem>} newVal
             * @param {Array<BalanceItem>} oldVal
             */
            handler(newVal, oldVal) {
                if (!this.isWaiting) {
                    return;
                }
                if (this.networkSlug !== HUB_CHAIN_ID.MINTER) {
                    return;
                }
                const oldBalanceMap = arrayToMap(oldVal, 'coin.id');
                newVal.some((newBalanceItem) => {
                    const oldBalanceItem = oldBalanceMap[newBalanceItem.coin.id];
                    const oldAmount = oldBalanceItem?.amount || 0;
                    if (newBalanceItem.amount > oldAmount) {
                        this.finishTopup(newBalanceItem.amount, newBalanceItem.coin.symbol);
                        return true;
                    }
                });
            },
        },
    },
    methods: {
        finishTopup(amount, coinSymbol) {
            this.isWaiting = false;
            this.$emit('topup', {amount, coinSymbol});
        },
    },
};
</script>

<template>
    <div v-if="isWaiting">
        <div class="form__error" v-if="serverError">{{ serverError }}</div>
        <template v-else>
            <div>{{ $td('Waiting top-up transaction', 'topup.waiting-topup') }}</div>
            <div class="u-text-center">
                <BaseLoader :is-loading="isWaiting"/>
            </div>
        </template>
    </div>
</template>
