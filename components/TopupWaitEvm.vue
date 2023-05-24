<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required.js';
import stripZeros from 'pretty-num/src/strip-zeros.js';
import Big from 'minterjs-util/src/big.js';
import {isValidAmount} from '~/assets/utils/validators.js';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_BY_ID, HUB_CHAIN_DATA} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {wait} from '@shrpne/utils/src/wait.js';
import {pretty} from '~/assets/utils.js';
import useHubDiscount from '~/composables/use-hub-discount.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3TokenBalance from '~/composables/use-web3-token-balance.js';
import useWeb3Deposit from '~/composables/use-web3-deposit.js';
import useTxService from '~/composables/use-tx-service.js';
import {TOP_UP_NETWORK} from '~/components/Topup.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import Modal from '~/components/base/Modal.vue';
import HubBuyTxListItem from '~/components/base/StepListItem.vue';
import HubFeeImpact from '~/components/HubFeeImpact.vue';


/**
 * @enum {string}
 */
const MODE = {
    AFTER_TOPUP: 'topup',
    EXISTING_BALANCE: 'existing',
};

export default {
    LOADING_STAGE,
    components: {
        BaseAmountEstimation,
        BaseLoader,
        FieldCombined,
        Modal,
        HubBuyTxListItem,
        HubFeeImpact,
    },
    mixins: [validationMixin],
    props: {
        /** @type {HUB_NETWORK_SLUG} */
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
        'update:processing',
        'topup',
    ],
    setup() {
        const { discount, discountUpsidePercent, setDiscountProps } = useHubDiscount();

        const {
            initPromise: hubInfoInitPromise,
            networkNativeCoin,
            setHubOracleProps,
        } = useHubOracle({
            subscribeTokenList: true,
            subscribePriceList: true,
        });
        const {
            tokenData,
            isNativeToken,
            setHubTokenProps,
        } = useHubToken();

        const {
            nativeBalance,
            wrappedBalance,
            balance,
            setWeb3TokenProps,
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

            networkNativeCoin,
            setHubOracleProps,

            hubInfoInitPromise,
            tokenData,
            isNativeToken,
            setHubTokenProps,

            nativeBalance,
            wrappedBalance,
            balance,
            setWeb3TokenProps,
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
            form: {
                amount: '',
            },
            mode: MODE.EXISTING_BALANCE,
            evmWaitCanceler: () => {},
            serverError: '',
            isConfirmModalVisible: false,
        };
    },
    validations() {
        return {
            form: {
                amount: {
                    required,
                    validAmount: isValidAmount,
                    // maxValue: maxValue(this.maxAmount || 0),
                    minValue: (value) => value > 0,
                    enoughToPayFee: (value) => value >= this.evmTotalFee,
                },
            },
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
            return this.networkNativeCoin?.symbol;
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
            const totalSpend = this.form.amount;
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
        isDepositStarted() {
            // has any step except WAIT_ETH
            return Object.keys(this.txServiceState.steps).some((key) => key !== LOADING_STAGE.WAIT_ETH);
        },
        showExistingBalance() {
            return this.balance > this.evmTotalFee && !this.isEvmToppedUp && !this.isDepositStarted;
        },
        showLoader() {
            return this.showWaitIndicator && this.currentLoadingStage === LOADING_STAGE.WAIT_ETH;
        },
        showTxList() {
            return !this.showLoader && !this.isWaitingEvmTopup;
        },
        showSomething() {
            return this.showExistingBalance || this.showLoader || this.showTxList || this.serverError;
        },
    },
    watch: {
    },
    created() {
        // depositProps
        // tokenProps
        this.$watch(
            () => ({
                destinationMinterAddress: this.$store.getters.address,
                accountAddress: this.$store.getters.evmAddress,
                chainId: this.hubChainData.chainId,
                // @TODO don't unwrap micro WETH balance
                amount: this.mode === MODE.AFTER_TOPUP ? this.balance : this.form.amount,
                tokenSymbol: this.tokenSymbol,
                // disable updating gasPriceGwei > coinAmountAfterBridge, which will triggers watchEstimation
                freezeGasPrice: false,
            }),
            (newVal) => {
                this.setDepositProps(newVal);
                this.setHubOracleProps({
                    hubNetworkSlug: HUB_CHAIN_BY_ID[newVal.chainId]?.hubNetworkSlug,
                });
                this.setHubTokenProps(newVal);
                this.setWeb3TokenProps(newVal);
            },
            {deep: true, immediate: true},
        );

        // txServiceProps
        this.$watch(
            () => ({
                privateKey: this.$store.getters.privateKey,
                accountAddress: this.$store.getters.evmAddress,
                chainId: this.hubChainData.chainId,
            }),
            (newVal) => this.setTxServiceProps(newVal),
            {deep: true, immediate: true},
        );

        // discountProps
        this.$watch(
            () => ({
                minterAddress: this.$store.getters.address,
                ethAddress: this.$store.getters.evmAddress,
            }),
            (newVal) => this.setDiscountProps(newVal),
            {deep: true, immediate: true},
        );
    },
    destroyed() {
        this.evmWaitCanceler();
    },
    methods: {
        pretty,
        waitEvmBalance() {
            this.addStepData(LOADING_STAGE.WAIT_ETH, {network: this.networkSlug});
            const [promise, canceler] = this.waitEnoughTokenBalance();
            this.evmWaitCanceler = canceler;

            return promise
                .then(() => {
                    this.addStepData(LOADING_STAGE.WAIT_ETH, {
                        coin: this.tokenSymbol,
                        amount: this.balance,
                        finished: true,
                    });
                });
        },
        initWaitEvmTopup() {
            this.setStepList({});
            return this.hubInfoInitPromise
                // wait computed to recalculate
                .then(() => wait(100))
                .then(() => this.waitEvmBalance())
                .then(() => {
                    // change mode and wait computed to recalculate
                    this.mode = MODE.AFTER_TOPUP;
                    return wait(100);
                })
                .then(() => {
                    this.$emit('update:processing', true);
                    return this.depositFromEthereum();
                })
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
            this.$emit('update:processing', true);

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
            // this.setStepList({});
            this.$emit('update:processing', false);
            this.$emit('topup', {amount: stripZeros(amount), coinSymbol});
        },
    },
};
</script>

<template>
    <div v-if="showSomething">
        <div class="form-row" v-if="showExistingBalance">
            <hr class="card__fake-divider"/>
            <p>{{ $td(`You have available funds on you ${hubChainData.name} address. Do you want to deposit it?`, 'topup.deposit-evm-balance-description', {network: hubChainData.shortName}) }}</p>
            <div class="u-mt-10">
                <FieldCombined
                    class="h-field--is-readonly"
                    :coin="tokenSymbol"
                    :fallback-to-full-list="false"
                    :amount.sync="form.amount"
                    :$amount="$v.form.amount"
                    :label="$td('Choose amount', 'form.amount')"
                    :max-value="balance"
                    @blur="/*handleInputBlur(); */$v.form.amount.$touch()"
                />
                <span class="form-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">{{ $td('Enter amount', 'form.enter-amount') }}</span>
                <span class="form-field__error" v-else-if="$v.form.amount.$dirty && (!$v.form.amount.validAmount || !$v.form.amount.minValue)">{{ $td('Invalid amount', 'form.invalid-amount') }}</span>
                <span class="form-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.enoughToPayFee">{{ $td('Not enough to pay fee', 'form.not-enough-to-pay-fee') }}</span>
                <!--                        <span class="form-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.maxValue">{{ $td('Not enough', 'form.not-enough') }} {{ form.coinToGet }} ({{ $td('max.', 'form.max') }} {{ pretty(maxAmount) }})</span>-->
            </div>

            <button type="button" class="button button--main button--full u-mt-10" @click="isConfirmModalVisible = true">
                {{ $td(`Deposit`, 'topup.deposit-evm-balance-button') }}
            </button>
        </div>

        <div class="form-row" v-if="showLoader">
            <div>{{ $td('Waiting top-up transaction', 'topup.waiting-topup') }}</div>
            <div class="u-text-center">
                <BaseLoader :is-loading="true"/>
            </div>
        </div>
        <HubBuyTxListItem
            v-else-if="showTxList"
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
                <BaseAmountEstimation :coin="tokenSymbol" :amount="form.amount" format="exact"/>

                <h3 class="information__title">{{ $td('You will get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                <BaseAmountEstimation :coin="tokenSymbol" :amount="coinAmountAfterBridge" format="approx"/>

                <HubFeeImpact class="u-mt-05 u-text-right" :coin="tokenSymbol" :fee-impact="totalFeeImpact" :network="hubChainData.shortName"/>
            </div>

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
