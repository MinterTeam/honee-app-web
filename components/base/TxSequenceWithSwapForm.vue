<script>
import {validationMixin} from 'vuelidate';
import required from 'vuelidate/lib/validators/required.js';
import minLength from 'vuelidate/lib/validators/minLength.js';
import {ESTIMATE_SWAP_TYPE} from 'minter-js-sdk/src/variables.js';
import {convertFromPip} from 'minterjs-util/src/converter.js';
import useEstimateSwap from '~/composables/use-estimate-swap.js';
import Big from '~/assets/big.js';
import {pretty, decreasePrecisionSignificant} from '~/assets/utils.js';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
import TxSequenceForm from '~/components/base/TxSequenceForm.vue';
import {getTxType} from '~/components/Swap.vue';


export default {
    components: {
        TxSequenceForm,
    },
    mixins: [validationMixin],
    emits: [
        'clear-form',
        'success',
        'success-modal-close',
        'update:estimation',
        'validation-touch',
    ],
    props: {
        coinToSell: {
            type: String,
            required: true,
        },
        coinToBuy: {
            type: String,
            required: true,
        },
        valueToSell: {
            type: [Number, String],
            required: true,
        },
        /** @type {SendSequenceItem|Array<SendSequenceItem>} */
        sequenceParams: {
            type: [Array, Object],
            required: true,
        },
        v$sequenceParams: {
            type: Object,
            required: true,
            validator(value) {
                // it should be vuelidate object
                return typeof value.$error === 'boolean' &&
                    typeof value.$dirty === 'boolean' &&
                    typeof value.$invalid === 'boolean' &&
                    typeof value.$model === 'object' &&
                    typeof value.$params === 'object';
            },
        },
        beforeConfirmModalShow: {
            type: [Function, null],
            default: null,
        },
        beforePostSequence: {
            type: [Function, null],
            default: null,
        },
    },
    setup(props, context) {
        const {
            estimation,
            estimationType,
            estimationRoute,
            estimationError,
            isEstimationWaiting,
            handleInputBlur,
            estimateSwap,
        } = useEstimateSwap({
            $td: context.root.$td,
            idPreventConcurrency: 'swapForm',
        });

        return {
            // fee,
            // feeProps,

            estimation,
            estimationType,
            estimationRoute,
            estimationError,
            isEstimationWaiting,
            handleInputBlur,
            estimateSwap,
        };
    },
    data() {
        return {
            /** @type {FeeData|null}*/
            fee: null,
        };
    },
    validations() {
        return {
            coinToSell: {
                required,
                minLength: minLength(3),
            },
            coinToBuy: {
                required,
                minLength: minLength(3),
                // maxLength: maxLength(10),
            },
            valueToSell: {
                required: required,
                validAmount: (value) => value > 0,
                maxValueAfterFee: (value) => new Big(value || 0).lte(this.maxAmountAfterFee || 0),
                maxValue: (value) => new Big(value || 0).lte(this.maxAmount || 0),
            },
            sequenceParams: {
                valid: () => !this.v$sequenceParams.$invalid,
            },
        };
    },
    computed: {
        isPool() {
            return this.estimationType === ESTIMATE_SWAP_TYPE.POOL;
        },
        isSellAll() {
            // not use max
            if (!this.isUseMax) {
                return false;
            }
            // use max
            // selling base coin (no matter if it is not enough to pay fee)
            if (this.coinToSell === this.$store.getters.BASE_COIN) {
                return true;
            }
            // selling custom coin
            // base coin is not enough try use selected coin to pay fee
            if (!this.swapFee?.isBaseCoinEnough) {
                return true;
            } else {
                return false;
            }
        },
        txDataCoins() {
            return this.estimationRoute
                ? this.estimationRoute.map((coin) => coin.id)
                : [this.coinToSell, this.coinToBuy];
        },
        txData() {
            return {
                ...(!this.isPool ? {
                    coinToSell: this.coinToSell,
                    coinToBuy: this.coinToBuy,
                } : {
                    coins: this.txDataCoins,
                }),
                valueToSell: this.valueToSell,
                minimumValueToBuy: this.minimumValueToBuy,
            };
        },
        minimumValueToBuy() {
            let slippage = 1 - 5 / 100; // 5%
            slippage = Math.max(slippage, 0);
            return decreasePrecisionSignificant(this.estimation * slippage);
        },
        maxAmount() {
            const selectedCoin = this.$store.state.balance.find((coin) => {
                return coin.coin.symbol === this.coinToSell;
            });
            // coin not selected
            if (!selectedCoin) {
                return 0;
            }
            return selectedCoin.amount;
        },
        maxAmountAfterFee() {
            const selectedCoin = this.$store.state.balance.find((coin) => {
                return coin.coin.symbol === this.coinToSell;
            });
            // coin not selected
            if (!selectedCoin) {
                return 0;
            }
            return getAvailableSelectedBalance(selectedCoin, this.swapFee);
        },
        swapFee() {
            return this.fee.resultList?.[0] || this.fee;
        },
        sequenceParamsFinal() {
            if (this.coinToSell === this.coinToBuy) {
                return this.sequenceParams;
            }
            const baseSequenceParamsArray = Array.isArray(this.sequenceParams) ? this.sequenceParams : [this.sequenceParams];
            return [
                {
                    txParams: {
                        type: getTxType({isSelling: true, isPool: this.isPool, isSellAll: this.isSellAll}),
                        data: this.txData,
                    },
                    /**
                     * @param {PostTxResponse} tx - successful swap tx
                     */
                    finalize: (tx) => {
                        const returnAmount = convertFromPip(tx.tags['tx.return']);

                        if (new Date(tx.timestamp) > new Date(this.$store.state.balanceTimestamp)) {
                            const deductBalanceList = [
                                {
                                    coin: tx.gas_coin,
                                    amount: convertFromPip(tx.tags['tx.commission_amount']),
                                },
                                {
                                    coin: this.$store.state.explorer.coinMap[this.coinToSell],
                                    amount: this.valueToSell,
                                },
                            ];
                            const addBalanceList = [
                                {
                                    coin: this.$store.state.explorer.coinMap[this.coinToBuy],
                                    amount: returnAmount,
                                },
                            ];
                            this.$store.commit('UPDATE_BALANCE', {
                                deduct: deductBalanceList,
                                add: addBalanceList,
                                tx,
                            });
                        }

                        return {
                            ...tx,
                            returnAmount,
                        };
                    },
                },
                ...baseSequenceParamsArray,
            ];
        },
        v$SwapInvalid() {
            return this.$v.coinToSell.$invalid || this.$v.coinToBuy.$invalid || this.$v.valueToSell.$invalid;
        },
    },
    watch: {
        coinToSell: function(newVal, oldVal) {
            this.watchForm();
        },
        coinToBuy: function(newVal, oldVal) {
            this.watchForm();
        },
        valueToSell: function(newVal, oldVal) {
            this.watchForm();
        },
        estimation: {
            handler(newVal) {
                this.$emit('update:estimation', newVal);
            },
        },
    },
    methods: {
        pretty,
        watchForm() {
            if (this.coinToSell === this.coinToBuy) {
                return;
            }
            if (this.v$SwapInvalid) {
                return;
            }
            this.getEstimation();
        },
        getEstimation(force) {
            if (this.v$SwapInvalid) {
                return;
            }

            return this.estimateSwap({
                coinToSell: this.coinToSell,
                valueToSell: this.valueToSell,
                coinToBuy: this.coinToBuy,
                isSelling: true,
                force,
                throwOnError: false,
            });
        },
        clearForm() {
            this.$emit('clear-form');
        },
    },
};
</script>

<template>
    <TxSequenceForm
        :sequence-params="sequenceParamsFinal"
        :v$sequence-params="$v"
        :before-post-sequence="beforePostSequence"
        :before-confirm-modal-show="beforeConfirmModalShow"
        @update:fee="fee = $event"
        @validation-touch="$emit('validation-touch'); $v.$touch(); v$sequenceParams.$touch()"
        @clear-form="clearForm()"
        @success="$emit('success')"
        @success-modal-close="$emit('success-modal-close')"
    >
        <template v-slot:default="{fee}">
            <slot :fee="fee" :estimation="estimation"/>


            <div class="form__error u-text-medium u-mt-10 u-mb-10" v-if="$v.$error">
                <template v-if="$v.coinToSell.$error">{{ $td('Invalid coin to sell', 'form.swap-coin-sell-error-invalid') }}</template>
                <template v-if="$v.coinToBuy.$error">{{ $td('Invalid coin to buy', 'form.swap-coin-buy-error-invalid') }}</template>
                <template v-if="$v.valueToSell.$dirty && !$v.valueToSell.required">{{ $td('Enter amount', 'form.amount-error-required') }}</template>
                <template v-else-if="$v.valueToSell.$dirty && !$v.valueToSell.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</template>
                <template v-else-if="$v.valueToSell.$dirty && !$v.valueToSell.maxValue">{{ $td('Not enough coins', 'form.not-enough-coins') }}</template>
                <template v-else-if="$v.valueToSell.$dirty && !$v.valueToSell.maxValueAfterFee">{{ $td('Not enough to pay transaction fee', 'form.fee-error-insufficient') }}: {{ pretty(swapFee.value) }} {{ swapFee.coinSymbol }}</template>
            </div>
        </template>

        <template v-slot:submit-title>
            <slot name="submit-title"/>
        </template>

        <template v-slot:confirm-modal-header>
            <slot name="confirm-modal-header"/>
        </template>

        <template v-slot:confirm-modal-body>
            <slot name="confirm-modal-body"/>
        </template>
    </TxSequenceForm>
</template>
