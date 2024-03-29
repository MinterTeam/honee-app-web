<script>
import {validationMixin} from 'vuelidate/src/index.js';
import {convertFromPip} from 'minterjs-util/src/converter.js';
import {pretty} from '~/assets/utils.js';
import TxSequenceForm from '~/components/base/TxSequenceForm.vue';
import SwapEstimation from '~/components/base/SwapEstimation.vue';


export default {
    components: {
        TxSequenceForm,
        SwapEstimation,
    },
    mixins: [validationMixin],
    emits: [
        'clear-form',
        'success',
        'success-modal-close',
        'update:fee',
        'update:estimation',
        'update:v$estimation',
        'validation-touch',
        'update:fetch-state',
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
        },
        valueToBuy: {
            type: [Number, String],
        },
        isUseMax: {
            type: Boolean,
            default: false,
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
    data() {
        return {
            /** @type {FeeData|null}*/
            fee: null,
            v$estimation: {},
            estimation: 0,
            txData: {},
        };
    },
    validations() {
        return {
            estimation: {
                valid: () => this.needSwap ? !this.v$estimation.$invalid : true,
            },
            sequenceParams: {
                valid: () => !this.v$sequenceParams.$invalid,
            },
        };
    },
    computed: {
        // typeBuy if valueToBuy specified
        isTypeBuy() {
            return !!this.valueToBuy;
        },
        // otherwise typeSell (by default)
        isTypeSell() {
            return !this.isTypeBuy;
        },
        needSwap() {
            return this.coinToSell !== this.coinToBuy;
        },
        swapFee() {
            return this.fee?.resultList?.[0] || this.fee;
        },
        sequenceParamsFinal() {
            if (!this.needSwap) {
                return this.sequenceParams;
            }

            const baseSequenceParamsArray = Array.isArray(this.sequenceParams) ? this.sequenceParams : [this.sequenceParams];
            return [
                {
                    txParams: {
                        type: this.$refs.estimation?.getTxType(),
                        data: this.txData,
                    },
                    /**
                     * @param {PostTxResponse} tx - successful swap tx
                     */
                    finalize: (tx) => {
                        const isTypeBuy = !!tx.data.value_to_buy;
                        const getAmount = convertFromPip(isTypeBuy ? tx.data.value_to_buy : tx.tags['tx.return']);
                        const spendAmount = isTypeBuy ? convertFromPip(tx.tags['tx.return']) : this.valueToSell;

                        if (new Date(tx.timestamp) > new Date(this.$store.state.balanceTimestamp)) {
                            const deductBalanceList = [
                                {
                                    coin: tx.gas_coin,
                                    amount: convertFromPip(tx.tags['tx.commission_amount']),
                                },
                                {
                                    coin: this.$store.state.explorer.coinMap[this.coinToSell],
                                    amount: spendAmount,
                                },
                            ];
                            const addBalanceList = [
                                {
                                    coin: this.$store.state.explorer.coinMap[this.coinToBuy],
                                    amount: getAmount,
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
                            returnAmount: getAmount,
                        };
                    },
                },
                ...baseSequenceParamsArray,
            ];
        },
    },
    /* update with same estimation will not fire, and not update parent values set to 0 after invalid props
    watch: {
        estimation: {
            handler(newVal) {
                this.$emit('update:estimation', newVal);
            },
        },
    },
    */
    methods: {
        pretty,
        clearForm() {
            //@TODO reset all vuelidate
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
        @update:fee="fee = $event; $emit('update:fee', $event)"
        @validation-touch="$emit('validation-touch'); $v.$touch(); v$estimation.$touch(); v$sequenceParams.$touch()"
        @clear-form="clearForm()"
        @success="$emit('success')"
        @success-modal-close="$emit('success-modal-close')"
    >
        <template v-slot:default="{fee}">
            <slot :fee="fee" :estimation="estimation" :vEstimation="v$estimation"/>


            <SwapEstimation
                class="u-text-medium form-row"
                :class="needSwap ? '': 'u-hidden'"
                ref="estimation"
                idPreventConcurrency="swapForm"
                :coin-to-sell="coinToSell"
                :coin-to-buy="needSwap ? coinToBuy : ''"
                :value-to-sell="valueToSell"
                :value-to-buy="valueToBuy"
                :is-use-max="isUseMax"
                :fee="swapFee"
                @update:estimation="estimation = $event; $emit('update:estimation', $event);"
                @update:tx-data="txData = $event"
                @update:v$estimation="v$estimation = $event; $emit('update:v$estimation', $event)"
                @update:fetch-state="$emit('update:fetch-state', $event)"
            />
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
