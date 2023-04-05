<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import Big from 'minterjs-util/src/big.js';
import {pretty} from '~/assets/utils.js';
import SwapEstimation from '~/components/base/SwapEstimation.vue';
import TxSequenceForm from '~/components/base/TxSequenceForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import PortfolioPriceImpact from '~/components/PortfolioPriceImpact.vue';



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
    data() {
        return {
            balanceList: this.$store.state.balance,
            form: {
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
            coin: {
                required,
                minLength: minLength(3),
            },
        };

        return {
            form,
            sequenceParams: {
                valid: (value) => value.some((item) => !item.skip),
            },
        };
    },
    computed: {
        coinList() {
            return this.balanceList
                .filter((item) => {
                    if (item.coin.symbol.indexOf('LP-') === 0) {
                        return false;
                    }
                    if (item.amount <= 0) {
                        return false;
                    }
                    return true;
                })
                .map((item) => {
                    return {
                        amount: item.amount,
                        id: item.coin.id,
                        symbol: item.coin.symbol,
                    };
                });
        },

        /* not needed for sellAll
        // amount minus fee to properly calculate estimation and slippage
        valueToSwapList() {
            return this.coinList.map((item, index) => {
                const feeItem = this.fee.resultList?.[index];
                const feeValue = feeItem?.coinSymbol === item.symbol ? feeItem.value : 0;
                const value = new Big(item.amount).minus(feeValue).toString();
                return value < 0 ? 0 : value;
            });
        },
        */
        isEstimationFetchLoading() {
            return this.estimationFetchStateList.some((item) => item.loading);
        },
        estimationSum() {
            return this.estimationViewCategorised.enabled.reduce((accumulator, item) => {
                return accumulator.plus(item.amountToGet || 0);
            }, new Big(0)).toString();
        },
        estimationView() {
            return this.coinList.map((item, index) => {
                let result = {
                    coin: item.symbol,
                    // display amount to sell
                    amount: item.amount,
                    hideUsd: false,
                };
                const needSwap = this.checkNeedSwapEqual(item.symbol);
                if (!needSwap) {
                    return {
                        ...result,
                        amountToGet: item.amount,
                    };
                }
                const validFormInput = this.v$estimationList[index] && !this.v$estimationList[index].propsGroup.$invalid;

                if (!validFormInput) {
                    return {
                        ...result,
                        amountToGet: 0,
                    };
                }

                const isLoading = this.estimationFetchStateList[index]?.loading/* || this.fee.isLoading*/;
                const error = this.estimationFetchStateList[index]?.error;
                const enoughToPayFee = Number(this.estimationList[index]) > 0;
                /* fee automatically excluded in sellAll
                const enoughToPayFee = Number(item.amount) > Number(this.fee.resultList?.[index]?.value);
                */

                return {
                    ...result,
                    amountToGet: this.estimationList[index] ?? '',
                    /* loading indicator not needed for amountToSell (it's already known)
                    isLoading,
                     */
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
                .filter((item) => !item.disabled && item.amountToGet > 0)
                .map((item) => {
                    return {
                        spendUsd: item.amount * this.$store.getters['portfolio/getCoinPrice'](item.coin),
                        resultUsd: item.amountToGet * this.$store.getters['portfolio/getCoinPrice'](this.form.coin),
                    };
                });
        },
        priceImpactUnavailable() {
            return this.estimationSum > 0 && !this.$store.getters['portfolio/getCoinPrice'](this.form.coin);
        },
        sequenceParams() {
            return this.coinList.map((coinItem, index) => {
                const coinSymbol = coinItem.symbol;
                const needSwap = this.checkNeedSwapEqual(coinSymbol);
                const isDisabled = this.estimationView.find((item) => item.coin === coinSymbol)?.disabled;
                const skip = !needSwap || isDisabled;
                return {
                    // pass null to txParams to not perform fee calculation
                    txParams: needSwap ? {
                        type: this.getEstimationRef(index)?.getTxType(),
                        data: this.estimationTxDataList[index],
                        gasCoin: coinSymbol,
                    } : null,
                    feeTxParams: false,
                    /* no need to calculate fee for sellAll tx
                    feeTxParams: needSwap ? {
                        type: TX_TYPE.SELL_ALL_SWAP_POOL,
                        data: {
                            coins: [item.symbol, 1, 2, 3, 4],
                        },
                        gasCoin: item.symbol,
                    } : undefined,
                    */
                    // pass skip to not send tx in sequence
                    skip,
                    prepareGasCoinPosition: 'skip',
                    prepare: skip ? undefined : (swapTx) => {
                        return this.getEstimationRef(index)?.getEstimation(true, true)
                            .then(() => {
                                return {
                                    type: this.getEstimationRef(index)?.getTxType(),
                                    data: this.estimationTxDataList[index],
                                };
                            });
                    },
                };
            });
        },
    },
    watch: {
    },
    methods: {
        pretty,
        getEstimationRef(index) {
            // $refs item in v-for is an array
            return this.$refs['estimation' + index]?.[0];
        },
        // if coins are equal, then no need swap
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
    },
};

</script>


<template>
    <div>
        <TxSequenceForm
            :sequence-params="sequenceParams"
            :v$sequence-params="$v"
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
                        :label="$td('You receive', 'form.swap-buy-coin')"
                        :amount="false"
                    />
                    <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                </div>

                <div class="information form-row">
                    <template v-if="estimationViewCategorised.enabled.length > 0">
                        <h3 class="information__title">{{ $td('Tokens to sell', 'portfolio.tokens-sell-label') }}</h3>
                        <BaseAmountEstimation
                            v-for="item in estimationViewCategorised.enabled"
                            :key="item.coin"
                            v-bind="item"
                        />
                    </template>

                    <template v-if="estimationViewCategorised.disabled.length > 0">
                        <h3 class="information__title">{{ $td('Unable to sell', 'portfolio.tokens-sell-disabled-label') }}</h3>
                        <BaseAmountEstimation
                            v-for="item in estimationViewCategorised.disabled"
                            :key="item.coin"
                            v-bind="item"
                            :is-loading="false"
                            amount="—"
                        />
                    </template>

                    <h3 class="information__title">{{ $td('You get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="estimationSum" format="approx" :is-loading="isEstimationFetchLoading"/>
                </div>
                <!--<PortfolioPriceImpact class="form-row" :estimation-view-usd="estimationViewUsd" :price-unavailable="priceImpactUnavailable"/>-->

                <SwapEstimation
                    class="u-text-medium form-row u-hidden"
                    v-for="(coin, index) in coinList"
                    :key="coin.id"
                    :ref="'estimation' + index"
                    :idPreventConcurrency="'swapForm' + index"
                    :coin-to-sell="checkNeedSwapEqual(coin.symbol) ? coin.symbol : ''"
                    :coin-to-buy="form.coin"
                    :value-to-sell="coin.amount"
                    :force-sell-all="true"
                    :is-use-max="true"
                    :fee="null && fee.resultList && fee.resultList[index]"
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
                    {{ $td('Sell all balance', 'action.title-sell-balance') }}
                </h2>
            </template>

            <template v-slot:confirm-modal-body>
                <div class="information form-row">
                    <template v-if="estimationViewCategorised.enabled.length > 0">
                        <h3 class="information__title">{{ $td('Tokens to sell', 'portfolio.tokens-sell-label') }}</h3>
                        <BaseAmountEstimation
                            v-for="item in estimationViewCategorised.enabled"
                            :key="item.coin"
                            v-bind="item"
                        />
                    </template>

                    <h3 class="information__title">{{ $td('You get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="estimationSum" format="approx" :is-loading="isEstimationFetchLoading"/>

                    <PortfolioPriceImpact class="u-mt-05 u-text-right" :estimation-view-usd="estimationViewUsd" :price-unavailable="priceImpactUnavailable"/>
                </div>
            </template>
        </TxSequenceForm>
    </div>
</template>
