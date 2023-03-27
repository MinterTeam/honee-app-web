<script>
import {getCurrentInstance} from 'vue';
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required.js';
import minLength from 'vuelidate/src/validators/minLength.js';
import minValue from 'vuelidate/src/validators/minValue.js';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import Big, {BIG_ROUND_DOWN, BIG_ROUND_UP} from '~/assets/big.js';
import {pretty} from '~/assets/utils.js';
import {wait} from '~/assets/utils/wait.js';
import {HUB_CHAIN_DATA, HUB_NETWORK} from '~/assets/variables.js';
import {postConsumerPortfolio} from '~/api/portfolio.js';
import usePortfolioWallet from '~/composables/use-portfolio-wallet.js';
import useWeb3SmartWalletPortfolioBuy from '~/composables/use-web3-smartwallet-portfolio-buy.js';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
import SwapEstimation from '~/components/base/SwapEstimation.vue';
import TxSequenceForm from '~/components/base/TxSequenceForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import PortfolioPriceImpact from '~/components/PortfolioPriceImpact.vue';

const WITHDRAW_TX_INDEX = 0;
const SEND_TX_INDEX = 1;

export default {
    TX_TYPE,
    components: {
        SwapEstimation,
        TxSequenceForm,
        BaseAmountEstimation,
        FieldCombined,
        PortfolioPriceImpact,
    },
    mixins: [validationMixin],
    emits: [
        'success',
        'success-modal-close',
        'override-stats-value',
    ],
    props: {
        portfolio: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy;
        const {getWallet} = usePortfolioWallet(vm.$store.getters.mnemonic);
        const {
            amountToWithdraw,
            minAmountToWithdraw,
            withdrawTxParams,
            withdrawFeeTxParams,
            withdrawAmountToReceiveDistribution,

            swsList,
            swsSelectedIndices,
            valueDistribution: smartWalletValueDistribution,
            amountEstimationBeforeRelayRewardList,
            amountEstimationToReceiveAfterDepositList,
            relayRewardDistribution,
            amountToSellForSwapToHubDistribution,
            setSmartWalletPortfolioBuyProps,
            getSum,
            expandAllocation,
            buildTxListAndCallSmartWallet,
        } = useWeb3SmartWalletPortfolioBuy();

        return {
            portfolioWallet: getWallet(props.portfolio.id),

            amountToWithdraw,
            minAmountToWithdraw,
            withdrawTxParams,
            withdrawFeeTxParams,
            withdrawAmountToReceiveDistribution,

            swsList,
            swsSelectedIndices,
            smartWalletValueDistribution,
            amountEstimationBeforeRelayRewardList,
            amountEstimationToReceiveAfterDepositList,
            relayRewardDistribution,
            amountToSellForSwapToHubDistribution,
            setSmartWalletPortfolioBuyProps,
            getSum,
            expandAllocation,
            buildTxListAndCallSmartWallet,
        };
    },
    data() {
        return {
            // @TODO periodically update coinBalance when no isSequenceProcessing
            // use balance in 'data' instead of store.getters to not update it after 'send' tx
            coinBalanceItem: null,
            form: {
                value: '',
                coin: this.$route.query.coin || '',
            },
            fee: {},
            estimationList: [],
            estimationTxDataList: [],
            v$estimationList: [],
            estimationFetchStateList: [],
            isSequenceProcessing: false,
            isWithdrawProcessing: false,
        };
    },
    validations() {
        const form = {
            value: {
                required,
                validAmount: (value) => value > 0,
                // maxValueAfterFee: (value) => new Big(value || 0).lte(this.maxAmountAfterFee),
                maxValue: (value) => new Big(value || 0).lte(this.coinBalance),
            },
            coin: {
                required,
                minLength: minLength(3),
            },
        };

        return {
            form,
            // @TODO combine withdraw and send tx fees ans validate it
            amountToWithdraw: {
                minValue: (value) => this.isSmartWalletWithdraw ? minValue(this.minAmountToWithdraw)(value) : true,
            },
            valueDistribution: {
                valid: (value) => value.reduce((accumulator, item) => accumulator.plus(item), new Big(0)).lte(this.form.value || 0),
            },
            valueDistributionToSpend: {
                valid: (value) => value.reduce((accumulator, item) => accumulator.plus(item), new Big(0)).gt(0),
            },
            sequenceParams: {
                valid: (value) => value.some((item) => !item.skip),
            },
        };
    },
    computed: {
        /** @type {HubChainDataItem} */
        hubChainData() {
            return HUB_CHAIN_DATA[HUB_NETWORK.BSC];
        },
        coinList() {
            return this.portfolio.coins.map((item) => {
                return {
                    ...item,
                    allocationPart: new Big(item.allocation).div(100).toString(),
                    symbol: this.$store.state.explorer.coinMapId[item.id]?.symbol || '',
                };
            });
        },
        amountToSend() {
            return this.getSum(this.amountToSendDistribution);
            // return new Big(this.form.value || 0).minus(this.amountToWithdraw).toString();
            // return new Big(this.form.value || 0).minus(this.amountToWithdraw).minus(this.combinedFeeToDeduct).toString();
        },
        valueDistribution() {
            return this.coinList.map((item) => {
                if (this.$v.form.value.$invalid) {
                    return 0;
                }
                return new Big(this.form.value || 0).times(item.allocation).div(100).toString(undefined, BIG_ROUND_DOWN);
            });
        },
        isSmartWalletWithdraw() {
            return false;
            // @TODO
            // eslint-disable-next-line no-unreachable
            return this.swsSelectedIndices.length > 0;
        },
        selectedIndices() {
            return Object.keys(this.coinList);
            // @TODO
            // eslint-disable-next-line no-unreachable
            return Object.keys(this.coinList)
                .filter((indexString) => !this.swsSelectedIndices.includes(indexString));
        },
        selectedAllocationPart() {
            return this.coinList.map((item, index) => {
                if (this.selectedIndices.includes(index.toString())) {
                    return new Big(item.allocation).div(100).toString();
                } else {
                    return 0;
                }
            });
        },
        expandedAllocationPart() {
            return this.expandAllocation(this.selectedAllocationPart);
        },
        // distribution of amount specified in send-to-isolated-address tx
        amountToSendDistribution() {
            return this.valueDistribution.map((value, index) => {
                if (this.selectedIndices.includes(index.toString())) {
                    return new Big(value).minus(this.sendFeeToDeductDistribution[index]).toString();
                } else {
                    return 0;
                }
            });
        },
        // if item not selected to swap via minter, then fallback to wide distribution (to not increase valueToSell in swap tx)
        amountToSendDistributionFallback() {
            return this.valueDistribution.map((value, index) => {
                return new Big(value).minus(this.sendFeeToDeductDistributionWide[index]).toString();
            });
        },
        // amounts used in swap tx
        valueDistributionToSpend() {
            return this.valueDistribution.map((item, index) => {
                const feeItem = this.swapFeeDataList[index];
                const feeValue = feeItem?.coinSymbol === this.form.coin ? feeItem.value : 0;
                const amountToSendPart = this.selectedIndices.includes(index.toString())
                    ? this.amountToSendDistribution[index]
                    : this.amountToSendDistributionFallback[index];
                const value = new Big(amountToSendPart).minus(feeValue).toString();
                return value < 0 ? 0 : value;
            });
        },
        estimationView() {
            return this.coinList.map((item, index) => {
                let result = {
                    coin: item.symbol,
                    hideUsd: false,
                };
                const needSwap = this.checkNeedSwapEqual(item.symbol);
                if (!needSwap && this.valueDistribution[index] > 0) {
                    return {
                        ...result,
                        amount: this.valueDistribution[index],
                    };
                }
                // don't check $v.form.value.maxValue here to show estimation results
                // don't check v$estimationList valueToSell, because valueDistributionToSpend may be 0 if not enough fee
                const validFormInput = this.v$estimationList[index] && !this.v$estimationList[index].coinToSell.$invalid && !this.v$estimationList[index].coinToBuy.$invalid && this.$v.form.value.required && this.$v.form.value.validAmount;

                if (!validFormInput) {
                    return {
                        ...result,
                        amount: item.allocation,
                        unit: '%',
                        format: 'exact',
                    };
                }

                const isLoading = this.estimationFetchStateList[index]?.loading;
                const error = this.estimationFetchStateList[index]?.error;
                const enoughToPayFee = Number(this.valueDistributionToSpend[index]) > 0;

                const minterEstimation = this.estimationList[index] || 0;
                // @TODO
                // const smartWalletEstimation = this.amountEstimationToReceiveAfterDepositList[index] || 0;
                const smartWalletEstimation = 0;
                const isSmartWalletSwapBetter = new Big(smartWalletEstimation).gt(minterEstimation);
                const finalEstimation = isSmartWalletSwapBetter ? smartWalletEstimation : minterEstimation;

                return {
                    ...result,
                    amountMinter: minterEstimation ?? '',
                    amountSmartWallet: smartWalletEstimation ?? '',
                    amount: finalEstimation ?? '',
                    isSmartWalletSwapBetter,
                    isLoading,
                    error,
                    disabled: !!error || (!isLoading && !enoughToPayFee),
                };
            });
        },
        estimationViewCategorised() {
            return {
                enabled: this.estimationView.filter((item) => !item.disabled),
                disabled: this.estimationView.filter((item) => item.disabled),
            };
        },
        estimationViewUsd() {
            return this.estimationView
                .filter((item) => !item.disabled && item.amount > 0 && !item.unit)
                .map((item, index) => {
                    return {
                        spendUsd: this.valueDistributionToSpend[index] * this.$store.getters['portfolio/getCoinPrice'](this.form.coin),
                        resultUsd: item.amount * this.$store.getters['portfolio/getCoinPrice'](item.coin),
                    };
                });
        },
        priceImpactUnavailable() {
            return this.coinBalance > 0 && this.form.value > 0 && !this.$store.getters['portfolio/getCoinPrice'](this.form.coin);
        },
        sequenceParams() {
            const swapSequence = this.coinList.map((coinItem, index) => {
                const coinSymbol = coinItem.symbol;
                const needSwap = this.checkNeedSwapEqual(coinSymbol);
                const estimationViewItem = this.estimationView[index];
                const skip = !needSwap || estimationViewItem?.disabled || estimationViewItem?.isSmartWalletSwapBetter;
                return {

                    txParams: {
                        type: this.getEstimationRef(index)?.getTxType(),
                        data: this.estimationTxDataList[index],
                        gasCoin: this.form.coin,
                    },
                    // pass false to not perform fee calculation
                    feeTxParams: needSwap ? {
                        type: TX_TYPE.SELL_SWAP_POOL,
                        data: {
                            coins: [0, 1, 2, 3, 4],
                            valueToSell: 1,
                        },
                        gasCoin: this.form.coin,
                    } : false,
                    privateKey: this.portfolioWallet.privateKey,
                    // pass skip to not send tx in sequence
                    skip,
                    prepareGasCoinPosition: 'start',
                    prepare: skip ? undefined : (swapTx) => {
                        // wait for computed to recalculated (fee -> valueDistributionToSpend)
                        return wait(100)
                            .then(() => this.getEstimationRef(index)?.getEstimation(true, true))
                            .then(() => {
                                return {
                                    type: this.getEstimationRef(index)?.getTxType(),
                                    data: this.estimationTxDataList[index],
                                };
                            });
                    },
                };
            });

            const prepareSmartWalletTx = () => {
                // wait for computed depended on withdrawValue to recalculate
                return wait(50)
                    .then(() => this.buildTxListAndCallSmartWallet())
                    .then((result) => {
                        const newPayload = JSON.parse(this.withdrawTxParams.payload);
                        newPayload.smartWalletTx = result.hash;

                        return {
                            payload: JSON.stringify(newPayload),
                            data: {
                                value: this.withdrawTxParams.data.value,
                            },
                        };
                    });
            };
            const withdraw = {
                skip: !this.isSmartWalletWithdraw,
                // gasCoin preparation updates fee.resultList and trigger recalculations
                prepareGasCoinPosition: 'start',
                prepare: [
                    () => {this.isWithdrawProcessing = true;},
                    prepareSmartWalletTx,
                    () => {this.isWithdrawProcessing = false;},
                ],
                txParams: this.withdrawTxParams,
                feeTxParams: this.withdrawFeeTxParams,
            };

            const send = {
                // gasCoin preparation update fee.resultList and trigger recalculations
                prepareGasCoinPosition: 'start',
                // wait for computed to recalculate
                prepare: () => {
                    return wait(100)
                        .then(() => {
                            return {
                                data: {
                                    value: this.amountToSend,
                                },
                            };
                        });
                },
                txParams: {
                    type: TX_TYPE.SEND,
                    data: {
                        to: this.portfolioWallet.address,
                        // value is often incorrect (withdraw tx fee paid in custom coin change pool price), so it will be recalculated after prepare
                        value: 0,
                        coin: this.form.coin,
                    },
                    payload: JSON.stringify({
                        app: 'portfolio',
                        type: 'buy',
                        id: this.portfolio.id,
                    }),
                },
            };

            return [
                withdraw, // WITHDRAW_TX_INDEX
                send, // SEND_TX_INDEX
            ].concat(swapSequence);
        },
        withdrawFeeData() {
            if (!this.isSmartWalletWithdraw) {
                return null;
            }
            const feeItem = this.fee?.resultList?.[WITHDRAW_TX_INDEX];
            // feeItem coinSymbol can differ from form.coin, but it doesn't matter because sendFee is used only for maxValue calculation in FieldCombined
            return feeItem?.coinSymbol === this.form.coin ? feeItem : null;
        },
        sendFeeData() {
            const feeItem = this.fee?.resultList?.[SEND_TX_INDEX];
            // feeItem coinSymbol can differ from form.coin, but it doesn't matter because sendFee is used only for maxValue calculation in FieldCombined
            return feeItem?.coinSymbol === this.form.coin ? feeItem : null;
        },
        combinedFeeData() {
            return {
                value: new Big(this.withdrawFeeData?.value || 0).plus(this.sendFeeData?.value || 0).toString(),
                coin: this.withdrawFeeData?.coin || this.sendFeeData?.coin,
            };
        },
        swapFeeDataList() {
            return this.fee?.resultList?.slice(SEND_TX_INDEX + 1) || [];
        },
        // if available balance is not enough to pay fee, deduct it from form.value
        combinedFeeToDeduct() {
            return this.getFeeToDeduct(this.combinedFeeData);
        },
        withdrawFeeToDeduct() {
            return this.getFeeToDeduct(this.withdrawFeeData);
        },
        sendFeeToDeduct() {
            return new Big(this.combinedFeeToDeduct).minus(this.withdrawFeeToDeduct).toString();
        },
        // actual distribution used in tx
        sendFeeToDeductDistribution() {
            return this.expandedAllocationPart.map((allocationPart) => {
                if (this.$v.form.value.$invalid) {
                    return 0;
                }
                return new Big(this.sendFeeToDeduct).times(allocationPart).toString(undefined, BIG_ROUND_UP);
            });
        },
        // distribution used in estimation (max wide for case when fee is distributed among all coins)
        sendFeeToDeductDistributionWide() {
            return this.coinList.map((item) => {
                if (this.$v.form.value.$invalid) {
                    return 0;
                }
                return new Big(this.sendFeeToDeduct).times(item.allocation).div(100).toString(undefined, BIG_ROUND_UP);
            });
        },
        coinBalance() {
            return this.coinBalanceItem?.amount || 0;
        },
    },
    watch: {
        'form.coin': {
            handler() {
                this.coinBalanceItem = this.$store.getters.getBalanceItem(this.form.coin);
            },
        },
    },
    created() {
        // smartWalletPortfolioBuyProps
        this.$watch(
            () => ({
                privateKey: this.$store.getters.privateKey,
                evmAccountAddress: this.$store.getters.evmAddress,
                depositDestinationAddress: this.portfolioWallet.address,
                chainId: this.hubChainData.chainId,
                valueToSell: this.form.value,
                coinToSell: this.form.coin,
                coinToBuyList: this.coinList,
                minterEstimationList: this.estimationList,
                minterFeeToDeduct: this.withdrawFeeToDeduct,
                isLocked: this.isSequenceProcessing && !this.isWithdrawProcessing,
            }),
            (newVal) => {
                // @TODO
                // eslint-disable-next-line no-constant-condition
                if (newVal.isLocked || true) {
                    this.setSmartWalletPortfolioBuyProps({
                        // only update isLocked to reduce recalculations
                        isLocked: true,
                    });
                } else {
                    this.setSmartWalletPortfolioBuyProps(newVal);
                }
            },
            {deep: true, immediate: true},
        );
    },
    methods: {
        pretty,
        getEstimationRef(index) {
            // $refs item in v-for is an array
            return this.$refs['estimation' + index]?.[0];
        },
        checkNeedSwapEqual(coinSymbol) {
            return this.form.coin !== coinSymbol;
        },
        getFeeToDeduct(feeData) {
            if (!(feeData?.value > 0)) {
                return 0;
            }
            const selectedBalanceItem = this.coinBalanceItem;
            const availableValue = selectedBalanceItem ? getAvailableSelectedBalance(selectedBalanceItem, feeData) : 0;
            if (new Big(this.form.value || 0).gt(availableValue)) {
                return new Big(this.form.value || 0).minus(availableValue).toString();
            } else {
                return 0;
            }
        },
        clearForm() {
            this.form.value = '';
            this.form.coin = '';
            this.$v.$reset();
        },
        handleEstimation(index, estimation) {
            this.$set(this.estimationList, index, estimation);
        },
        handleEstimationTxData(index, txData) {
            this.$set(this.estimationTxDataList, index, txData);
        },
        handleV$estimation(index, v$) {
            this.$set(this.v$estimationList, index, v$);
        },
        handleFetchState(index, v$) {
            this.$set(this.estimationFetchStateList, index, v$);
        },
        beforePostSequence() {
            return postConsumerPortfolio('init', this.portfolio.id, this.portfolioWallet.address, this.$store.getters.privateKey)
                .then((portfolio) => {
                    this.$store.commit('portfolio/addConsumerPortfolio', portfolio);
                });
        },
        beforeSuccessSequence() {
            return postConsumerPortfolio('buy', this.portfolio.id, this.portfolioWallet.address, this.$store.getters.privateKey)
                .then((portfolio) => {
                    this.$store.commit('portfolio/addConsumerPortfolio', portfolio);
                });
        },
    },
};

</script>


<template>
    <div>
        <TxSequenceForm
            :sequence-params="sequenceParams"
            :v$sequence-params="$v"
            :before-post-sequence="beforePostSequence"
            :before-success-sequence="beforeSuccessSequence"
            @update:fee="fee = $event"
            @update:is-sequence-processing="isSequenceProcessing = $event"
            @clear-form="clearForm()"
            @success="$emit('success')"
            @success-modal-close="$emit('success-modal-close')"
        >
            <template v-slot:default>
                <div class="form-row">
                    <FieldCombined
                        :coin.sync="form.coin"
                        :$coin="$v.form.coin"
                        :coinList="$store.state.balance"
                        :amount.sync="form.value"
                        :$amount="$v.form.value"
                        :useBalanceForMaxValue="true"
                        :fee="null /* manual fee subtraction */"
                        :disable-max-value-watch="isSequenceProcessing"
                        :label="$td('Amount', 'form.wallet-send-amount')"
                    />
                    <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                    <span class="form-field__error" v-if="$v.form.value.$dirty && !$v.form.value.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.value.$dirty && !$v.form.value.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.value.$dirty && !$v.form.value.maxValue">{{ $td('Not enough coins', 'form.not-enough-coins') }}</span>
                    <span class="form-field__error" v-else-if="$v.valueDistribution.$dirty && !$v.valueDistribution.valid">Value distribution is calculated incorrectly</span>
                </div>

                <div class="information form-row">
                    <template v-if="estimationViewCategorised.enabled.length > 0">
                        <h3 class="information__title">{{ $td('Tokens to buy', 'portfolio.tokens-buy-label') }}</h3>
                        <BaseAmountEstimation
                            v-for="item in estimationViewCategorised.enabled"
                            :key="item.coin"
                            v-bind="item"
                        />
                    </template>

                    <template v-if="estimationViewCategorised.disabled.length > 0">
                        <h3 class="information__title">{{ $td('Unable to buy', 'portfolio.tokens-buy-disabled-label') }}</h3>
                        <BaseAmountEstimation
                            v-for="item in estimationViewCategorised.disabled"
                            :key="item.coin"
                            v-bind="item"
                            :is-loading="false"
                            amount="—"
                        />
                    </template>
                </div>
                <!--<PortfolioPriceImpact class="form-row" :estimation-view-usd="estimationViewUsd" :price-unavailable="priceImpactUnavailable"/>-->

                <SwapEstimation
                    class="u-text-medium form-row u-hidden"
                    v-for="(coin, index) in coinList"
                    :key="coin.id"
                    :ref="'estimation' + index"
                    :idPreventConcurrency="'swapForm' + index"
                    :coin-to-sell="form.coin"
                    :coin-to-buy="checkNeedSwapEqual(coin.symbol) ? coin.symbol : ''"
                    :value-to-sell="valueDistributionToSpend[index]"
                    :max-amount-to-spend="valueDistribution[index]"
                    :is-use-max="false"
                    :fee="swapFeeDataList[index]"
                    @update:estimation="handleEstimation(index, $event)"
                    @update:tx-data="handleEstimationTxData(index, $event)"
                    @update:v$estimation="handleV$estimation(index, $event)"
                    @update:fetch-state="handleFetchState(index, $event)"
                />
            </template>

            <template v-slot:submit-title>
                {{ $td('Confirm', `form.submit-confirm-button`) }}
            </template>

            <template v-slot:confirm-modal-header>
                <h2 class="u-h3 u-mb-10">
                    {{ $td('Buy portfolio', 'portfolio.buy-title') }}
                </h2>
            </template>

            <template v-slot:confirm-modal-body>
                <div class="information form-row">
                    <template v-if="estimationViewCategorised.enabled.length > 0">
                        <h3 class="information__title">{{ $td('Tokens to buy', 'portfolio.tokens-buy-label') }}</h3>
                        <BaseAmountEstimation
                            v-for="item in estimationViewCategorised.enabled"
                            :key="item.coin"
                            v-bind="item"
                        />
                    </template>

                    <h3 class="information__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="form.value" format="exact"/>

                    <PortfolioPriceImpact class="u-mt-05 u-text-right" :estimation-view-usd="estimationViewUsd" :price-unavailable="priceImpactUnavailable"/>
                </div>
            </template>
        </TxSequenceForm>
    </div>
</template>
