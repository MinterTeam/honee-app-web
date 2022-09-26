<script>
import stripZeros from 'pretty-num/src/strip-zeros.js';
import {findNativeCoinSymbol} from '~/api/hub.js';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_DATA, HUB_CHAIN_ID} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {wait} from '~/assets/utils/wait.js';
import {pretty} from '~/assets/utils.js';
import useWeb3TokenBalance from '~/composables/use-web3-token-balance.js';
import useWeb3Deposit from '~/composables/use-web3-deposit.js';
import useTxService from '~/composables/use-tx-service.js';
import useHubTokenData from '~/composables/use-hub-token-data.js';
import {TOP_UP_NETWORK} from '~/components/Topup.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';
import HubBuyTxListItem from '~/components/HubBuyTxListItem.vue';
import HubFeeImpact from '~/components/HubFeeImpact.vue';
import Big from '~/assets/big.js';
import useHubDiscount from '~/composables/use-hub-discount.js';

export default {
    LOADING_STAGE,
    components: {
        BaseAmountEstimation,
        BaseLoader,
        Modal,
        HubBuyTxListItem,
        HubFeeImpact,
    },
    props: {
        /** @type {HUB_CHAIN_ID} */
        networkSlug: {
            type: String,
            required: true,
        },
        showWaitIndicator: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        'topup',
    ],
    setup() {
        const { discount, discountUpsidePercent, setDiscountProps } = useHubDiscount();
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
            discount,
            discountUpsidePercent,
            setDiscountProps,

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
            isConfirmModalVisible: false,
        };
    },
    computed: {
        /** @type {TopUpNetwork} */
        network() {
            return TOP_UP_NETWORK[this.networkSlug];
        },
        /** @type {HubChainDataItem} */
        hubChainData() {
            return HUB_CHAIN_DATA[this.networkSlug];
        },
        tokenSymbol() {
            return findNativeCoinSymbol(this.hubTokenList, this.networkSlug);
        },
        hubFeeRate() {
            const discountModifier = 1 - this.discount;
            // commission to deposit is taken from external token data (e.g. chainId: 'ethereum')
            return new Big(this.tokenData?.commission || 0.01).times(discountModifier).toString();
        },
        // fee to HUB bridge calculated in COIN
        hubFee() {
            const input = this.depositAmountAfterGas;
            return new Big(input || 0).times(this.hubFeeRate).toString();
        },
        coinAmountAfterBridge() {
            const input = this.depositAmountAfterGas;
            return new Big(input || 0).minus(this.hubFee).toString();
        },
        totalFeeImpact() {
            const totalSpend = this.balance;
            const totalResult = this.coinAmountAfterBridge;
            if (!totalSpend || !totalResult) {
                return 0;
            }
            return Math.min((totalSpend - totalResult) / totalSpend * 100, 100);
        },
        isWaitingEvmTopup() {
            const step = this.txServiceState.steps[LOADING_STAGE.WAIT_ETH];
            return step?.loadingStage && !step.amount;
        },
        isEvmToppedUp() {
            return this.txServiceState.steps[LOADING_STAGE.WAIT_ETH]?.amount;
        },
        depositProps() {
            return {
                destinationMinterAddress: this.$store.getters.address,
                accountAddress: this.$store.getters.evmAddress,
                chainId: this.hubChainData.chainId,
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
                chainId: this.hubChainData.chainId,
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
    mounted() {
        this.setDiscountProps({
            minterAddress: this.$store.getters.address,
            ethAddress: this.$store.getters.evmAddress,
        });
    },
    destroyed() {
        this.evmWaitCanceler();
    },
    methods: {
        pretty,
        waitEvmBalance() {
            this.addStepData(LOADING_STAGE.WAIT_ETH, {network: this.networkSlug});
            const promise = this.waitEnoughTokenBalance()
                .then(() => {
                    this.addStepData(LOADING_STAGE.WAIT_ETH, {
                        coin: this.tokenSymbol,
                        amount: this.balance,
                        finished: true,
                    });
                });
            this.evmWaitCanceler = promise.canceler || (() => {});
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
        // cancel waiting and deposit existing balance
        deposit() {
            this.evmWaitCanceler();
            this.setStepList({});
            this.isConfirmModalVisible = false;

            this.depositFromEthereum()
                .then((outputAmount) => {
                    this.finishTopup(outputAmount, this.tokenSymbol);
                })
                .catch((error) => {
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
        <div class="form-row" v-if="depositAmountAfterGas > 0 && !isEvmToppedUp">
            <p>{{ $td(`You have ${pretty(balance)} ${tokenSymbol} on you ${hubChainData.shortName} address. Do you want to deposit it?`, 'topup.deposit-evm-balance-description', {amount: pretty(balance), coin: tokenSymbol, network: hubChainData.shortName}) }}</p>
            <button type="button" class="button button--main button--full u-mt-10" @click="isConfirmModalVisible = true">
                {{ $td(`Deposit ${pretty(balance)} ${tokenSymbol}`, 'topup.deposit-evm-balance-button', {amount: pretty(balance), coin: tokenSymbol}) }}
            </button>
        </div>

        <div class="form-row" v-if="showWaitIndicator && currentLoadingStage === $options.LOADING_STAGE.WAIT_ETH">
            <div>{{ $td('Waiting top-up transaction', 'topup.waiting-topup') }}</div>
            <div class="u-text-center">
                <BaseLoader :is-loading="isWaiting"/>
            </div>
        </div>
        <HubBuyTxListItem
            v-else-if="!isWaitingEvmTopup"
            class="hub__buy-stage form-row u-text-left"
            v-for="item in txServiceState.steps"
            :key="item.loadingStage"
            :step="item"
            :loadingStage="item.loadingStage"
        />
        <div class="form__error u-mt-10" v-if="serverError">{{ serverError }}</div>

        <!-- Confirm modal -->
        <Modal class="u-text-left" :isOpen.sync="isConfirmModalVisible">
            <h2 class="u-h3 form-row">
                {{ $td('Deposit', 'topup.confirm-deposit-title') }}
            </h2>

            <div class="information form-row">
                <h3 class="information__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                <BaseAmountEstimation :coin="tokenSymbol" :amount="balance" format="exact"/>

                <h3 class="information__title">{{ $td('You will get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                <BaseAmountEstimation :coin="tokenSymbol" :amount="coinAmountAfterBridge" format="approx"/>
            </div>

            <HubFeeImpact class="form-row" :coin="tokenSymbol" :fee-impact="totalFeeImpact" :network="hubChainData.shortName"/>

            <div class="form-row">
                <button
                    class="button button--main button--full" type="button" data-focus-on-open
                    @click="deposit()"
                >
                    {{ $td('Confirm', 'form.submit-confirm-button') }}
                </button>
                <button class="button button--ghost-main button--full u-mt-05" type="button" @click="isConfirmModalVisible = false">
                    {{ $td('Cancel', 'form.submit-cancel-button') }}
                </button>
            </div>
        </Modal>
    </div>
</template>
