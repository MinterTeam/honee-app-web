<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import Big, {BIG_ROUND_DOWN} from '~/assets/big.js';
import {pretty} from '~/assets/utils.js';
import {wait} from '~/assets/utils/wait.js';
import {postConsumerPortfolio} from '~/api/portfolio.js';
import usePortfolioWallet from '~/composables/use-portfolio-wallet.js';
import SwapEstimation from '~/components/base/SwapEstimation.vue';
import TxSequenceForm from '~/components/base/TxSequenceForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';



export default {
    TX_TYPE,
    components: {
        SwapEstimation,
        TxSequenceForm,
        BaseAmountEstimation,
        FieldCombined,
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
    setup(props, context) {
        const {getWallet} = usePortfolioWallet(context.root.$store.getters.mnemonic);

        return {
            portfolioWallet: getWallet(props.portfolio.id),
        };
    },
    data() {
        return {
            // use balance in 'data' instead of store.getters to not update it after 'send' tx
            coinBalance: 0,
            form: {
                value: '',
                coin: this.$route.query.coin || '',
            },
            fee: {},
            estimationList: [],
            estimationTxDataList: [],
            v$estimationList: [],
            estimationFetchStateList: [],
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
        coinList() {
            return this.portfolio.coins.map((item) => {
                return {
                    ...item,
                    symbol: this.$store.state.explorer.coinMapId[item.id]?.symbol || '',
                };
            });
        },
        valueDistribution() {
            return this.coinList.map((item) => {
                if (this.$v.form.value.$invalid) {
                    return 0;
                }
                return new Big(this.form.value || 0).times(item.allocation).div(100).toString(undefined, BIG_ROUND_DOWN);
            });
        },
        valueDistributionToSpend() {
            return this.valueDistribution.map((value, index) => {
                const feeItem = this.swapFeeDataList[index];
                const feeValue = feeItem?.coinSymbol === this.form.coin ? feeItem.value : 0;
                value = new Big(value).minus(feeValue).toString();
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

                return {
                    ...result,
                    amount: this.estimationList[index] ?? '',
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
        sequenceParams() {
            const swapSequence = this.coinList.map((coinItem, index) => {
                const coinSymbol = coinItem.symbol;
                const needSwap = this.checkNeedSwapEqual(coinSymbol);
                const isDisabled = this.estimationView.find((item) => item.coin === coinSymbol)?.disabled;
                const skip = !needSwap || isDisabled;
                return {
                    // pass null to txParams to not perform fee calculation
                    txParams: needSwap ? {
                        type: this.getEstimationRef(index)?.getTxType(),
                        data: this.estimationTxDataList[index],
                        gasCoin: this.form.coin,
                    } : null,
                    feeTxParams: needSwap ? {
                        type: TX_TYPE.SELL_SWAP_POOL,
                        data: {
                            coins: [0, 1, 2, 3, 4],
                            valueToSell: 1,
                        },
                        gasCoin: this.form.coin,
                    } : undefined,
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

            const send = {
                txParams: {
                    type: TX_TYPE.SEND,
                    data: {
                        to: this.portfolioWallet.address,
                        value: this.form.value,
                        coin: this.form.coin,
                    },
                    payload: JSON.stringify({
                        app: 'portfolio',
                        type: 'buy',
                        id: this.portfolio.id,
                    }),
                },
            };

            return [send].concat(swapSequence);
        },
        sendFeeData() {
            const feeItem = this.fee?.resultList?.[0];
            // feeItem coinSymbol can differ from form.coin, but it doesn't matter because sendFee is used only for maxValue calculation in FieldCombined
            return feeItem?.coinSymbol === this.form.coin ? feeItem : null;
        },
        swapFeeDataList() {
            return this.fee?.resultList?.slice(1) || [];
        },
    },
    watch: {
        'form.coin': {
            handler() {
                this.coinBalance = this.$store.getters.getBalanceAmount(this.form.coin);
            },
        },
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
                        :fee="sendFeeData"
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
                </div>
            </template>
        </TxSequenceForm>
    </div>
</template>
