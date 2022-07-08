<script>
import {findNativeCoinSymbol, getOracleCoinList} from '~/api/hub.js';
import {HUB_CHAIN_DATA, HUB_CHAIN_ID} from '~/assets/variables.js';
import useWeb3TokenBalance from '~/composables/use-web3-token-balance.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import {TOP_UP_NETWORK} from '~/components/Topup.vue';
import {getErrorText} from '~/assets/server-error.js';

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
    setup() {
        const {
            tokenData,
            balance,
            setTokenProps,
            waitEnoughTokenBalance,
        } = useWeb3TokenBalance();

        return {
            tokenData,
            balance,
            setTokenProps,
            waitEnoughTokenBalance,
        };
    },
    fetch() {
        if (this.networkSlug !== HUB_CHAIN_ID.MINTER) {
            return this.initWaitEvmTopup();
        }
    },
    data() {
        return {
            isWaiting: true,
            /** @type Array<HubCoinItem> */
            hubCoinList: [],
            evmWaitCanceler: () => {},
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
        '$store.getters.baseCoin': {
            handler(newVal, oldVal) {
                if (!this.isWaiting) {
                    return;
                }
                if (this.networkSlug !== HUB_CHAIN_ID.MINTER) {
                    return;
                }
                if (newVal.amount > oldVal.amount) {
                    this.finishTopup(newVal.amount, newVal.coin.symbol);
                }
            },
        },
    },
    destroyed() {
        this.evmWaitCanceler();
    },
    methods: {
        initWaitEvmTopup() {
            return getOracleCoinList()
                .then((coinList) => {
                    this.hubCoinList = Object.freeze(coinList);

                    const coinSymbol = findNativeCoinSymbol(this.hubCoinList, this.networkSlug);
                    this.setTokenProps({
                        accountAddress: this.$store.getters.evmAddress,
                        hubCoinList: this.hubCoinList,
                        tokenSymbol: coinSymbol,
                        chainId: HUB_CHAIN_DATA[this.networkSlug].chainId,
                    });

                    const {canceler} = this.waitEnoughTokenBalance()
                        .then(() => {
                            this.finishTopup(this.balance, coinSymbol);
                        });
                    this.evmWaitCanceler = canceler;
                })
                .catch((error) => {
                    if (error.isCanceled) {
                        return;
                    }
                    console.error(error);
                    this.serverError = getErrorText(error);
                });
        },
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
