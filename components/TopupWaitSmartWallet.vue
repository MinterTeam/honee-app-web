<script>
import {defineComponent} from 'vue';
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required.js';
import stripZeros from 'pretty-num/src/strip-zeros.js';
import Big from '~/assets/big.js';
import {isValidAmount} from '~/assets/utils/validators.js';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_BY_ID, HUB_CHAIN_DATA, HUB_NETWORK} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {wait} from '~/assets/utils/wait.js';
import {pretty} from '~/assets/utils.js';
import {findHubCoinItemByTokenAddress, findTokenInfo} from '~/api/hub.js';
import useHubDiscount from '~/composables/use-hub-discount.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3AddressBalance from '~/composables/use-web3-address-balance';
import useWeb3SmartWalletSwap from '~/composables/use-web3-smartwallet-swap.js';
import useTxService from '~/composables/use-tx-service.js';
import {TOP_UP_NETWORK} from '~/components/Topup.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import Modal from '~/components/base/Modal.vue';
import HubBuyTxListItem from '~/components/HubBuyTxListItem.vue';
import HubFeeImpact from '~/components/HubFeeImpact.vue';

/**
 * @enum {string}
 */
const MODE = {
    AFTER_TOPUP: 'topup',
    EXISTING_BALANCE: 'existing',
};

export default defineComponent({
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
            hubTokenList,
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
            web3Balance,
            balanceList: addressBalance,
            setWeb3AddressBalanceProps,
            waitBalanceUpdate,
        } = useWeb3AddressBalance();

        const {
            // discountUpsidePercent,
            // destinationFeeInCoin,
            // hubFeeRate,
            // hubFeeRatePercent,
            // hubFee,
            // withdrawAmountToReceive,
            // minAmountToWithdraw,
            // withdrawTxParams,
            // withdrawFeeTxParams,

            amountEstimationLimitForRelayReward: smartWalletRelayReward,
            amountToSellForSwapToHub,
            amountEstimationAfterSwapToHub,
            amountAfterDeposit,
            isSmartWalletSwapParamsLoading,
            smartWalletSwapParamsError,
            smartWalletAddress,
            /*feeTxParams: smartWalletTxParams,*/
            buildTxListAndCallSmartWallet,
            setSmartWalletSwapProps,
        } = useWeb3SmartWalletSwap();

        const {txServiceState, currentLoadingStage, setTxServiceProps, setStepList, estimateTxGas, waitPendingStep, addStepData} = useTxService();

        return {
            discount,
            discountUpsidePercent,
            setDiscountProps,

            hubInfoInitPromise,
            // networkNativeCoin,
            hubTokenList,
            setHubOracleProps,

            // tokenData,
            // isNativeToken,
            // setHubTokenProps,

            web3Balance,
            addressBalance,
            setWeb3AddressBalanceProps,
            waitBalanceUpdate,

            smartWalletRelayReward,
            amountToSellForSwapToHub,
            amountEstimationAfterSwapToHub,
            amountAfterDeposit,
            isSmartWalletSwapParamsLoading,
            smartWalletSwapParamsError,
            smartWalletAddress,
            /*feeTxParams: smartWalletTxParams,*/
            buildTxListAndCallSmartWallet,
            setSmartWalletSwapProps,

            txServiceState,
            currentLoadingStage,
            // setTxServiceProps,
            setStepList,
            estimateTxGas,
            waitPendingStep,
            addStepData,
        };
    },
    fetch() {
        return this.initWaitEvmTopup();
    },
    data() {
        return {
            form: {
                amount: '',
                value: '',
                /** @type {TokenBalanceItem} */
                tokenBalanceItem: undefined,
            },
            mode: MODE.EXISTING_BALANCE,
            /** @type {TokenBalanceItem|null} */
            updatedBalanceItem: null,
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
                    enoughToPayFee: (value) => value >= this.smartWalletRelayReward,
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
        selectedBalanceItem() {
            return this.mode === MODE.AFTER_TOPUP ? this.updatedBalanceItem : this.form.tokenBalanceItem;
        },
        selectedAmount() {
            return this.mode === MODE.AFTER_TOPUP ? this.updatedBalanceItem?.amount : this.form.amount;
        },
        /** @type {HubCoinItem|undefined} */
        hubCoin() {
            return findHubCoinItemByTokenAddress(this.hubTokenList, this.selectedBalanceItem?.tokenContractAddress, this.hubChainData.chainId, true);
        },
        tokenSymbol() {
            return this.hubCoin?.symbol || this.selectedBalanceItem?.tokenContractAddress;
        },
        usdtSymbol() {
            if (this.networkSlug === HUB_NETWORK.ETHEREUM) {
                return 'USDTE';
            }
            if (this.networkSlug === HUB_NETWORK.BSC) {
                return 'USDTBSC';
            }
            return '';
        },
        usdtHubToken() {
            return findTokenInfo(this.hubTokenList, this.usdtSymbol, this.hubChainData.chainId);
        },
        // hubFeeRate() {
        //     const discountModifier = 1 - this.discount;
        //     // commission to deposit is taken from external token data (e.g. chainId: 'ethereum')
        //     return new Big(this.tokenData?.commission || 0.01).times(discountModifier).toString();
        // },
        // fee to HUB bridge calculated in COIN
        // hubFee() {
        //     const input = this.depositAmountAfterGas;
        //     return new Big(input || 0).times(this.hubFeeRate).toString();
        // },
        coinAmountAfterBridge() {
            return this.amountAfterDeposit;
            // const input = this.depositAmountAfterGas;
            // return new Big(input || 0).minus(this.hubFee).toString();
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
            return this.addressBalance?.length > 0 && !this.isEvmToppedUp && !this.isDepositStarted;
        },
        showLoader() {
            return this.showWaitIndicator && this.currentLoadingStage === LOADING_STAGE.WAIT_ETH;
        },
        showTxList() {
            return Object.keys(this.txServiceState.steps).length > 0 && !this.showLoader && !this.isWaitingEvmTopup;
        },
        showSomething() {
            return this.showExistingBalance || this.showLoader || this.showTxList || this.serverError;
        },
    },
    watch: {
    },
    created() {
        // smartWalletSwapProps
        this.$watch(
            () => {
                const tokenBalance = this.selectedBalanceItem;

                /**
                 * @type {{valueToSell: string|number, tokenToSellContractAddress: string, tokenToSellDecimals: number}|{}}
                 */
                const tokenToSell = (() => {
                    if (tokenBalance) {
                        return {
                            tokenToSellContractAddress: tokenBalance.tokenContractAddress,
                            tokenToSellDecimals: tokenBalance.decimals,
                        };
                    }
                    return {};
                })();
                /**
                 * @type {{tokenToBuyContractAddress: string, tokenToBuyDecimals: number}|{}}
                 */
                const tokenToDeposit = (() => {
                    if (this.hubCoin) {
                        // if token to sell exists in Hub bridge, then set is as tokenToBuy, so swap will be skipped and token will be deposited as is
                        return {
                            tokenToBuyContractAddress: tokenBalance.tokenContractAddress,
                            tokenToBuyDecimals: tokenBalance.decimals,
                        };
                    } else if (this.usdtHubToken) {
                        // otherwise buy USDT
                        return {
                            tokenToBuyContractAddress: this.usdtHubToken.externalTokenId,
                            tokenToBuyDecimals: this.usdtHubToken.externalDecimals,
                        };
                    }
                    return {};
                })();

                return {
                    privateKey: this.$store.getters.privateKey,
                    evmAccountAddress: this.$store.getters.evmAddress,
                    chainId: this.hubChainData.chainId,
                    valueToSell: this.selectedAmount,
                    ...tokenToSell,
                    ...tokenToDeposit,
                    // skipEstimation: true,
                    idPreventConcurrency: 'estimateSwsSwap',
                };
            },
            (newVal) => this.setSmartWalletSwapProps(newVal),
            {deep: true, immediate: true},
        );

        // web3AddressBalanceProps
        this.$watch(
            () => ({
                accountAddress: this.smartWalletAddress,
                chainId: this.hubChainData.chainId,
            }),
            (newVal) => {
                this.setWeb3AddressBalanceProps(newVal);
                // this.setDepositProps(newVal);
                this.setHubOracleProps({
                    hubNetworkSlug: HUB_CHAIN_BY_ID[newVal.chainId]?.hubNetworkSlug,
                });
            },
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
            const promise = this.waitBalanceUpdate()
                .then((updatedList) => {
                    // @TODO select best (it is rare that multiple coins will be topped up during polling tick, but may be)
                    this.updatedBalanceItem = updatedList[0];
                    this.mode = MODE.AFTER_TOPUP;
                })
                // wait computed to recalculate
                .then(() => wait(100))
                .then(() => {
                    this.addStepData(LOADING_STAGE.WAIT_ETH, {
                        coin: this.tokenSymbol,
                        amount: this.updatedBalanceItem.amount,
                        finished: true,
                    });
                });
            this.evmWaitCanceler = promise.canceler || (() => {});
            return promise;
        },
        depositFromEthereum() {
            this.$emit('update:processing', true);
            this.addStepData(LOADING_STAGE.SEND_BRIDGE, {coin: this.tokenSymbol, amount: this.selectedAmount}, true);

            return this.buildTxListAndCallSmartWallet()
                .then((result) => {
                    window.alert(`https://explorer.minter.network/smart-wallet-relay/${result.hash}`);
                    this.addStepData(LOADING_STAGE.SEND_BRIDGE, {finished: true});
                    // @TODO subscribe hub deposit
                })
                .catch((error) => {
                    this.addStepData(LOADING_STAGE.SEND_BRIDGE, {error}, true);
                    throw error;
                });
        },
        initWaitEvmTopup() {
            this.setStepList({});
            return this.hubInfoInitPromise
                // wait computed to recalculate
                .then(() => wait(100))
                .then(() => this.waitEvmBalance())
                .then(() => {
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
        openDepositConfirmation() {
            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            this.serverError = '';
            this.isConfirmModalVisible = true;
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
            // this.setStepList({});
            this.$emit('update:processing', false);
            this.$emit('topup', {amount: stripZeros(amount), coinSymbol});
        },
    },
});
</script>

<template>
    <div v-if="showSomething">
        <div class="form-row" v-if="showExistingBalance">
            <p>{{ $td(`You have available funds on you ${hubChainData.name} address. Do you want to deposit it?`, 'topup.deposit-evm-balance-description', {network: hubChainData.shortName}) }}</p>

            <div class="u-mt-10">
                <FieldCombined
                    class="h-field--is-readonly"
                    :coin.sync="form.value"
                    :coin-list="addressBalance"
                    :fallback-to-full-list="false"
                    :amount.sync="form.amount"
                    :$amount="$v.form.amount"
                    :label="$td('Choose amount', 'form.amount')"
                    :max-value="form.tokenBalanceItem?.amount"
                    :use-balance-for-max-value="false"
                    @select-suggestion="form.tokenBalanceItem = $event"
                    @blur="/*handleInputBlur(); */$v.form.amount.$touch()"
                />
                <span class="form-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">{{ $td('Enter amount', 'form.enter-amount') }}</span>
                <span class="form-field__error" v-else-if="$v.form.amount.$dirty && (!$v.form.amount.validAmount || !$v.form.amount.minValue)">{{ $td('Invalid amount', 'form.invalid-amount') }}</span>
                <span class="form-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.enoughToPayFee">{{ $td('Not enough to pay fee', 'form.not-enough-to-pay-fee') }}</span>
                <!--                        <span class="form-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.maxValue">{{ $td('Not enough', 'form.not-enough') }} {{ form.coinToGet }} ({{ $td('max.', 'form.max') }} {{ pretty(maxAmount) }})</span>-->
            </div>

            <button type="button" class="button button--main button--full u-mt-10" :class="{'is-disabled': $v.$invalid}" @click="openDepositConfirmation()">
                {{ $td('Deposit', 'topup.deposit-evm-balance-button') }}
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
