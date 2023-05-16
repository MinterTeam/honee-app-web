<script>
import Big from 'minterjs-util/src/big.js';
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required.js';
import minLength from 'vuelidate/src/validators/minLength.js';
import minValue from 'vuelidate/src/validators/minValue.js';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {wait} from '@shrpne/utils/src/wait.js';
import {waitPool} from '~/api/explorer.js';
import {estimateTxCommissionGasCoinOnly} from '~/api/gate.js';
import checkEmpty from '~/assets/v-check-empty.js';
import {pretty, prettyExact} from "~/assets/utils.js";
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import TxSequenceForm from '~/components/base/TxSequenceForm.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import SwapEstimation from '~/components/base/SwapEstimation.vue';
import {convertFromPip} from 'minterjs-util/src/converter.js';


export default {
    TX_TYPE,
    components: {
        SwapEstimation,
        BaseAmountEstimation,
        TxSequenceForm,
        FieldCombined,
    },
    directives: {
        checkEmpty,
    },
    mixins: [validationMixin],
    fetch() {
        if (!this.params.coin0 || !this.params.coin1 || this.params.coin0 === this.params.coin1) {
            return this.$nuxt.error({
                status: 404,
                message: this.$td('Pool coins not specified', 'action.error-no-pool-coins'),
                useMessage: true,
            });
        }

        return this.fetchPoolData()
            .catch((error) => {
                if (error.response?.status === 404) {
                    return this.$nuxt.error({
                        status: 404,
                        message: this.$td('Pool not found', 'action.error-pool-not-found'),
                        useMessage: true,
                    });
                } else {
                    return this.$nuxt.error(error);
                }
            });
    },
    emits: [
        'success',
        'success-modal-close',
    ],
    props: {
        action: {
            type: Object,
        },
        params: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            form: {
                coinToSell: this.params.coinToSell?.toUpperCase() || '',
                // amount of coinToSell to spend
                amount: '',
                coin0: this.params.coin0?.toUpperCase() || '',
                coin1: this.params.coin1?.toUpperCase() || '',
            },
            /** @type {FeeData} */
            fee: undefined,
            estimation0: '',
            estimation1: '',
            estimationTxData0: {},
            estimationTxData1: {},
            v$estimation0: {},
            v$estimation1: {},
            estimationFetchState0: null,
            estimationFetchState1: null,
            /** @type {Pool|null} */
            poolData: null,
            isSequenceProcessing: false,
        };
    },
    validations() {
        const form = {
            coinToSell: {
                required,
                minLength: minLength(3),
            },
            amount: {
                //@TODO maxValue
                //@TODO validAmount
                required,
                minValue: (val) => minValue(this.addLiquidityFee?.value)(val),
            },
        };

        return {
            form,
        };
    },
    computed: {
        isPoolLoaded() {
            return this.poolData?.liquidity;
        },
        valueToSell0() {
            if (!this.form.amount) {
                return 0;
            }

            return new Big(this.form.amount).div(2).toString();
        },
        valueToSell1() {
            if (!this.form.amount) {
                return 0;
            }

            return new Big(this.form.amount).minus(this.valueToSell0).toString();
        },
        coin0Amount() {
            if (this.params.coin0 === this.form.coinToSell) {
                return this.valueToSell0;
            }
            return this.estimation0 || 0;
        },
        coin1Amount() {
            if (this.params.coin1 === this.form.coinToSell) {
                return this.valueToSell1;
            }
            return this.estimation1 || 0;
        },
        // maximumVolume1() {
        //     if (!this.coin0Amount) {
        //         return 0;
        //     }
        //     const slippagePercent = 5;
        //     const slippage = 1 + (slippagePercent) / 100;
        //     return decreasePrecisionSignificant(this.coin0Amount * slippage);
        // },
        // pass only swap fee to filed (swap fee are paid in coinToSell and add-liquidity fee is paid in one of pool coins)
        /** @type {FeeData} */
        swapFee() {
            if (!this.fee?.value) {
                return undefined;
            }
            const swapFee = {
                ...this.fee,
                resultList: this.fee.resultList.slice(0, 2),
            };
            swapFee.value = new Big(this.fee.value).minus(this.addLiquidityFee?.value).toString();
            return swapFee;
        },
        /** @type {FeeItemData} */
        addLiquidityFee() {
            return this.fee?.resultList?.[2];
        },
        sequenceParams() {
            let poolBlock = this.poolData?.updatedAtBlock;
            const finalState = {
                coin0Amount: this.coin0Amount,
                coin1Amount: this.coin1Amount,
            };

            const getSwapSequenceItem = (coinSymbolToBuy, getTxData, index) => {
                const estimationRef = index === 0 ? this.$refs.estimation0 : this.$refs.estimation1;
                const needSwap = coinSymbolToBuy !== this.form.coinToSell;
                const skip = !needSwap;
                return {
                    txParams: {
                        type: estimationRef?.getTxType(),
                        data: getTxData(),
                        gasCoin: this.form.coinToSell,
                    },
                    // pass false to not perform fee calculation
                    feeTxParams: needSwap ? {
                        type: TX_TYPE.SELL_SWAP_POOL,
                        data: {
                            coins: [0, 1, 2, 3, 4],
                            valueToSell: 1,
                        },
                        gasCoin: this.form.coinToSell,
                    } : false,
                    // pass skip to not send tx in sequence
                    skip,
                    prepareGasCoinPosition: 'start',
                    prepare: (swapTx) => {
                        // wait for computed to recalculated (fee -> valueDistributionToSpend)
                        return wait(100)
                            .then(() => estimationRef?.getEstimation(true, true))
                            .then(() => {
                                return {
                                    type: estimationRef?.getTxType(),
                                    data: getTxData(),
                                };
                            });
                    },
                    finalize: (tx) => {
                        const swapReturn = convertFromPip(tx.tags['tx.return']);
                        finalState[`coin${index}Amount`] = swapReturn;

                        if (isPoolAffected(tx, this.poolData.token.symbol)) {
                            poolBlock = Number(tx.height);
                        }

                        return tx;
                    },
                };
            };


            const addLiquidity = {
                // manual estimateTxCommission is used
                prepareGasCoinPosition: 'skip',
                // wait for computed to recalculate
                prepare: [
                    // @TODO 3rd estimated fee will stay as dust
                    async () => {
                        await this.fetchPoolData(poolBlock);

                        console.log('finalState', {...finalState}, {...this.poolData});
                        let isCoin1Bigger = getIsCoin1Bigger(finalState, this.poolData);
                        // use bigger coin as new gasCoin
                        const gasCoin = isCoin1Bigger ? this.params.coin1 : this.params.coin0;
                        // @TODO can throw here, new gasCoin may be not eligible to pay fee, need to use old gasCoin
                        const {commission} = await estimateTxCommissionGasCoinOnly({
                            ...this.sequenceParams[2].txParams,
                            gasCoin,
                        });
                        // reduce amount by fee
                        if (isCoin1Bigger) {
                            finalState.coin1Amount = new Big(finalState.coin1Amount).minus(commission).toString();
                        } else {
                            finalState.coin0Amount = new Big(finalState.coin0Amount).minus(commission).toString();
                        }

                        // @TODO some validation can be made to prevent such case
                        if (finalState.coin1Amount < 0 || finalState.coin0Amount < 0) {
                            throw new Error(`Not enough ${gasCoin} to pay fee`);
                        }


                        console.log('finalState', {...finalState}, {...this.poolData});
                        // update isCoin1Bigger after fee deduction
                        isCoin1Bigger = getIsCoin1Bigger(finalState, this.poolData);

                        return {
                            gasCoin,
                            // bigger volume go second
                            data: isCoin1Bigger ? {
                                coin0: this.params.coin0,
                                coin1: this.params.coin1,
                                volume0: finalState.coin0Amount,
                                maximumVolume1: finalState.coin1Amount,
                            } : {
                                coin0: this.params.coin1,
                                coin1: this.params.coin0,
                                volume0: finalState.coin1Amount,
                                maximumVolume1: finalState.coin0Amount,
                            },
                        };

                        function getIsCoin1Bigger(finalState, poolData) {
                            const coin1CostInCoin0 = new Big(finalState.coin1Amount).div(poolData.amount1).times(poolData.amount0).toString();
                            console.log({coin1CostInCoin0, isCoin1Bigger: new Big(coin1CostInCoin0).gt(finalState.coin0Amount)});
                            return new Big(coin1CostInCoin0).gt(finalState.coin0Amount);
                        }
                    },

                ],
                txParams: {
                    type: TX_TYPE.ADD_LIQUIDITY,
                    data: {
                        coin0: this.params.coin0,
                        volume0: this.coin0Amount,
                        coin1: this.params.coin1,
                    },
                    // use one of pool coins (preferring one which is coinToSell
                    gasCoin: this.form.coinToSell === this.params.coin0 || this.form.coinToSell === this.params.coin1 ? this.form.coinToSell : this.params.coin0,
                },
                // manual estimateTxCommission is used (but fee estimation needed for validation)
                feeTxParams: {
                    type: TX_TYPE.ADD_LIQUIDITY,
                    data: {
                        coin0: this.params.coin0,
                        volume0: 0,
                        coin1: this.params.coin1,
                    },
                    gasCoin: this.form.coinToSell,
                },
            };

            return [
                getSwapSequenceItem(this.params.coin0, () => this.estimationTxData0, 0),
                getSwapSequenceItem(this.params.coin1, () => this.estimationTxData1, 1),
                addLiquidity,
            ];
        },
    },
    methods: {
        pretty,
        prettyExact,
        fetchPoolData(updatedAtBlock) {
            // no pair entered
            if (!this.form.coin0 || !this.form.coin1 || this.form.coin0 === this.form.coin1) {
                return;
            }

            return waitPool(this.form.coin0, this.form.coin1, {updatedAtBlock})
                .then((poolData) => {
                    this.poolData = Object.freeze(poolData);
                });
        },
        clearForm() {
            this.form.amount = '';
            this.form.coinToSell = '';

            this.$v.$reset();
        },
    },
};

function isPoolAffected(tx, lpTokenSymbol) {
    const tagsPoolId = Number(lpTokenSymbol.replace('LP-', ''));

    const swapPools = jsonParse(tx.tags['tx.pools']);
    const feePool = jsonParse(tx.tags['tx.commission_details']);
    const pools = [].concat(swapPools, feePool);
    const idList = pools.map((pool) => pool?.['pool_id']);

    return idList.includes(tagsPoolId);
}

function jsonParse(value) {
    try {
        return JSON.parse(value);
    } catch (e) {
        return undefined;
    }
}
</script>

<template>
    <TxSequenceForm
        :sequence-params="sequenceParams"
        :v$sequence-params="$v"
        @update:fee="fee = $event"
        @update:is-sequence-processing="isSequenceProcessing = $event"
        @clear-form="clearForm()"
        @success="$emit('success')"
        @success-modal-close="$emit('success-modal-close')"
    >
        <template v-slot:default="{fee}">
            <div class="form-row">
                <FieldCombined
                    :coin.sync="form.coinToSell"
                    :$coin="$v.form.coinToSell"
                    :coinList="$store.state.balance"
                    :amount.sync="form.amount"
                    :$amount="$v.form.amount"
                    :useBalanceForMaxValue="true"
                    :disable-max-value-watch="isSequenceProcessing"
                    :fee="swapFee"
                    :label="$td('You pay', 'form.swap-sell-coin')"
                    @update:amount="$v.form.amount.$touch()"
                />
                <span class="form-field__error" v-if="$v.form.coinToSell.$dirty && !$v.form.coinToSell.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.coinToSell.$dirty && !$v.form.coinToSell.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                <span class="form-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.minValue">{{ $td('Not enough to pay transaction fee', 'form.fee-error-insufficient') }}: {{ pretty(addLiquidityFee?.value) }} {{ addLiquidityFee?.coinSymbol }}</span>
            </div>

            <div class="information form-row">
                <h3 class="information__title">{{ $td('You provide liquidity to pool', 'todo') }}</h3>
                <BaseAmountEstimation :coin="form.coin0" :amount="coin0Amount" :is-loading="estimationFetchState0?.loading" format="approx"/>
                <BaseAmountEstimation :coin="form.coin1" :amount="coin1Amount" :is-loading="estimationFetchState1?.loading" format="approx"/>
            </div>

            <SwapEstimation
                class="u-text-medium form-row u-hidden"
                ref="estimation0"
                idPreventConcurrency="swapForm0"
                :coin-to-sell="form.coinToSell"
                :coin-to-buy="form.coinToSell === form.coin0 ? '' : form.coin0"
                :value-to-sell="valueToSell0"
                :force-sell-all="false"
                :is-use-max="false"
                :fee="null && fee.resultList?.[0]"
                @update:estimation="estimation0 = $event"
                @update:tx-data="estimationTxData0 = $event"
                @update:v$estimation="v$estimation0 = $event"
                @update:fetch-state="estimationFetchState0 = $event"
            />
            <SwapEstimation
                class="u-text-medium form-row u-hidden"
                ref="estimation1"
                idPreventConcurrency="swapForm1"
                :coin-to-sell="form.coinToSell"
                :coin-to-buy="form.coinToSell === form.coin1 ? '' : form.coin1"
                :value-to-sell="valueToSell1"
                :force-sell-all="false"
                :is-use-max="false"
                :fee="null && fee.resultList?.[1]"
                @update:estimation="estimation1 = $event"
                @update:tx-data="estimationTxData1 = $event"
                @update:v$estimation="v$estimation1 = $event"
                @update:fetch-state="estimationFetchState1 = $event"
            />

            <p class="form-row u-text-center u-text-muted u-text-small">
                {{ $td('The final amount depends on&nbsp;the&nbsp;exchange rate at&nbsp;the&nbsp;moment of&nbsp;transaction.', 'form.swap-confirm-note') }}
            </p>
        </template>

        <template v-slot:submit-title>
            {{ $td('Add', 'form.pool-add-button') }}
        </template>

        <template v-slot:confirm-modal-header>
            <h2 class="u-h3 u-mb-10">
                {{ action.title }}
            </h2>
        </template>

        <template v-slot:confirm-modal-body>
            <div class="information form-row">
                <h3 class="information__title">{{ $td('You pay', 'form.swap-sell-coin') }}</h3>
                <BaseAmountEstimation :coin="form.coinToSell" :amount="form.amount"/>

                <h3 class="information__title">{{ $td('You provide liquidity to pool', 'todo') }}</h3>
                <BaseAmountEstimation :coin="form.coin0" :amount="coin0Amount" format="approx"/>
                <BaseAmountEstimation :coin="form.coin1" :amount="coin1Amount" format="approx"/>
            </div>
        </template>
    </TxSequenceForm>
</template>
