<script>
import {findNativeCoinSymbol} from '~/api/hub.js';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_DATA, HUB_CHAIN_ID} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {wait} from '~/assets/utils/wait.js';
import stripZeros from 'pretty-num/src/strip-zeros.js';
import useWeb3TokenBalance from '~/composables/use-web3-token-balance.js';
import useWeb3Deposit from '~/composables/use-web3-deposit.js';
import useTxService from '~/composables/use-tx-service.js';
import useHubTokenData from '~/composables/use-hub-token-data.js';
import {TOP_UP_NETWORK} from '~/components/Topup.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';
import HubBuyTxListItem from '~/components/HubBuyTxListItem.vue';

export default {
    LOADING_STAGE,
    components: {
        BaseLoader,
        HubBuyTxListItem,
    },
    props: {
        /** @type {HUB_CHAIN_ID} */
        networkSlug: {
            type: String,
            required: true,
        },
    },
    emits: [
        'topup',
    ],
    setup() {
        const {initPromise: hubInfoInitPromise, hubTokenList, hubPriceList} = useHubTokenData({subscribePriceList: true});

        const {
            tokenData,
            isNativeToken,
            nativeBalance,
            wrappedBalance,
            balance,
            setTokenProps,
            waitEnoughTokenBalance,
        } = useWeb3TokenBalance();

        const {
            setDepositProps,
            depositFromEthereum,
            amountToUnwrap,
            isUnwrapRequired,
            gasPriceGwei: evmGasPriceGwei,
            gasTotalFee: evmTotalFee,
            depositAmountAfterGas,
        } = useWeb3Deposit();

        const {txServiceState, currentLoadingStage, setTxServiceProps, setStepList, estimateTxGas, waitPendingStep, addStepData} = useTxService();

        return {
            hubInfoInitPromise,
            hubTokenList,
            hubPriceList,

            tokenData,
            isNativeToken,
            nativeBalance,
            wrappedBalance,
            balance,
            setTokenProps,
            waitEnoughTokenBalance,

            setDepositProps, depositFromEthereum, amountToUnwrap, isUnwrapRequired, evmGasPriceGwei, evmTotalFee, depositAmountAfterGas,

            txServiceState, currentLoadingStage, setTxServiceProps, setStepList, estimateTxGas, waitPendingStep, addStepData,
        };
    },
    fetch() {
        return this.initWaitEvmTopup();
    },
    data() {
        return {
            isWaiting: true,
            evmWaitCanceler: () => {},
            serverError: '',
        };
    },
    computed: {
        /** @type {TopUpNetwork} */
        network() {
            return TOP_UP_NETWORK[this.networkSlug];
        },
        tokenSymbol() {
            return findNativeCoinSymbol(this.hubTokenList, this.networkSlug);
        },
        depositProps() {
            return {
                destinationMinterAddress: this.$store.getters.address,
                accountAddress: this.$store.getters.evmAddress,
                chainId: HUB_CHAIN_DATA[this.networkSlug].chainId,
                // @TODO don't unwrap micro WETH balance
                amount: this.balance,
                tokenSymbol: this.tokenSymbol,
                /** @type Array<HubCoinItem> */
                hubCoinList: this.hubTokenList,
                priceList: this.hubPriceList,
            };
        },
        txServiceProps() {
            return {
                privateKey: this.$store.getters.privateKey,
                accountAddress: this.$store.getters.evmAddress,
                chainId: HUB_CHAIN_DATA[this.networkSlug].chainId,
            };
        },
    },
    watch: {
        depositProps: {
            handler(newVal) {
                // disable updating priceList > gasPriceGwei > coinAmountAfterBridge, which will triggers watchEstimation
                if (newVal.isDisableUpdateProps) {
                    return;
                }
                this.setDepositProps(newVal);
                this.setTokenProps(newVal);
            },
            deep: true,
            immediate: true,
        },
        txServiceProps: {
            handler(newVal) {
                this.setTxServiceProps(newVal);
            },
            deep: true,
            immediate: true,
        },
    },
    destroyed() {
        this.evmWaitCanceler();
    },
    methods: {
        waitEvmBalance() {
            this.addStepData(LOADING_STAGE.WAIT_ETH);
            const promise = this.waitEnoughTokenBalance()
                .then(() => {
                    this.addStepData(LOADING_STAGE.WAIT_ETH, {
                        coin: this.tokenSymbol,
                        amount: this.balance,
                        network: this.networkSlug,
                        finished: true,
                    });
                });
            this.evmWaitCanceler = promise.canceler;
            return promise;
        },
        initWaitEvmTopup() {
            this.setStepList({});
            return this.hubInfoInitPromise
                // wait computed to recalculate
                .then(() => wait(100))
                .then(() => this.waitEvmBalance())
                .then(() => this.depositFromEthereum())
                .then((outputAmount) => {
                    this.finishTopup(outputAmount, this.tokenSymbol);
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
            this.setStepList({});
            this.$emit('topup', {amount: stripZeros(amount), coinSymbol});
        },
    },
};
</script>

<template>
    <div v-if="isWaiting">
        <template v-if="currentLoadingStage === $options.LOADING_STAGE.WAIT_ETH">
            <div>{{ $td('Waiting top-up transaction', 'topup.waiting-topup') }}</div>
            <div class="u-text-center">
                <BaseLoader :is-loading="isWaiting"/>
            </div>
        </template>
        <HubBuyTxListItem
            v-else
            class="hub__buy-stage form-row u-text-left"
            v-for="item in txServiceState.steps"
            :key="item.loadingStage"
            :step="item"
            :loadingStage="item.loadingStage"
        />
        <div class="form__error u-mt-10" v-if="serverError">{{ serverError }}</div>
    </div>
</template>
