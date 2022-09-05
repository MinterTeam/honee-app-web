<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import Big, {BIG_ROUND_DOWN} from '~/assets/big.js';
import {pretty} from '~/assets/utils.js';
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
    data() {
        return {
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
                maxValue: (value) => new Big(value || 0).lte(this.$store.getters.getBalanceAmount(this.form.coin)),
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
                    symbol: this.$store.state.explorer.coinMapId[item.id]?.symbol,
                };
            });
        },
        valueDistribution() {
            return this.coinList.map((item) => {
                if (this.$v.form.value.$invalid) {
                    return 0;
                }
                console.log(new Big(this.form.value || 0).times(item.allocation).div(100).toString(30, BIG_ROUND_DOWN));
                console.log(new Big(this.form.value || 0).times(item.allocation).div(100).toString(undefined, BIG_ROUND_DOWN));
                console.log(new Big(this.form.value || 0).times(item.allocation).div(100).toString(6, BIG_ROUND_DOWN));
                return new Big(this.form.value || 0).times(item.allocation).div(100).toString(undefined, BIG_ROUND_DOWN);
            });
        },
        valueDistributionToSpend() {
            return this.valueDistribution.map((value, index) => {
                const feeItem = this.fee.resultList?.[index];
                const feeValue = feeItem?.coinSymbol === this.form.coin ? feeItem.value : 0;
                value = new Big(value).minus(feeValue).toString();
                return value < 0 ? 0 : value;
            });
        },
        estimationView() {
            return this.coinList.map((item, index) => {
                let result = {
                    coin: item.symbol,
                    hideUsd: true,
                };
                const needSwap = this.checkNeedSwapEqual(item.symbol);
                if (!needSwap && this.valueDistribution[index] > 0) {
                    return {
                        ...result,
                        amount: this.valueDistribution[index],
                    };
                }
                const validFormInput = this.v$estimationList[index] && !this.v$estimationList[index].propsGroup.$invalid;

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

                return {
                    ...result,
                    amount: this.estimationList[index],
                    isLoading,
                    error,
                    disabled: !!error,
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
            return this.estimationTxDataList.map((txData, index) => {
                const coinSymbol = this.coinList[index].symbol;
                const needSwap = this.checkNeedSwapEqual(coinSymbol);
                const isDisabled = this.estimationView.find((item) => item.coin === coinSymbol)?.disabled;
                const skip = !needSwap || isDisabled;
                return {
                    // pass null to txParams to not perform fee calculation
                    txParams: needSwap ? {
                        type: this.getEstimationRef(index).getTxType(),
                        data: txData,
                    } : null,
                    // pass skip to not send tx in sequence
                    skip,
                    prepareGasCoinPosition: 'start',
                    prepare: skip ? undefined : (swapTx) => {
                        return this.getEstimationRef(index).getEstimation(true, true)
                            .then(() => {
                                return {
                                    type: this.getEstimationRef(index).getTxType(),
                                    data: this.estimationTxDataList[index],
                                };
                            });
                    },
                };
            });
        },
        feeTxParams() {
            return this.coinList.map((item) => {
                return this.checkNeedSwapEqual(item.symbol) ? {
                    type: TX_TYPE.SELL_SWAP_POOL,
                    data: {
                        coins: [0, 1, 2, 3, 4],
                        valueToSell: 1,
                    },
                    gasCoin: this.form.coin,
                } : null;
            });
        },
    },
    watch: {
    },
    methods: {
        pretty,
        getEstimationRef(index) {
            // $refs item in v-for is an array
            return this.$refs['estimation' + index][0];
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
        beforeConfirmModalShow() {

        },
    },
};

</script>


<template>
    <div>
        <TxSequenceForm
            :sequence-params="sequenceParams"
            :v$sequence-params="$v"
            :fee-tx-params="feeTxParams"
            :before-post-sequence="beforeConfirmModalShow"
            @update:fee="fee = $event"
            @clear-form="clearForm()"
            @success="$emit('success')"
            @success-modal-close="$emit('success-modal-close')"
        >
            <template v-slot:default="{fee}">
                <div class="form-row">
                    <FieldCombined
                        :coin.sync="form.coin"
                        :$coin="$v.form.coin"
                        :coinList="$store.state.balance"
                        :amount.sync="form.value"
                        :$amount="$v.form.value"
                        :useBalanceForMaxValue="true"
                        :fee="fee"
                        :label="$td('Amount', 'form.wallet-send-amount')"
                    />
                    <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                    <span class="form-field__error" v-if="$v.form.value.$dirty && !$v.form.value.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.value.$dirty && !$v.form.value.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.value.$dirty && !$v.form.value.maxValue">{{ $td('Not enough coins', 'form.not-enough-coins') }}</span>
                    <span  class="form-field__error" v-else-if="$v.valueDistribution.$dirty && !$v.valueDistribution.valid">Value distribution is calculated incorrectly</span>
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
                    :fee="fee.resultList && fee.resultList[index]"
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
