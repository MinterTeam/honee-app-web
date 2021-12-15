<script>
import {validationMixin} from 'vuelidate';
import autosize from 'v-autosize';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {isValidMnemonic} from 'minterjs-wallet';
import {postTx} from '~/api/gate.js';
import checkEmpty from '~/assets/v-check-empty.js';
import {getErrorText} from "~/assets/server-error.js";
import {getExplorerTxUrl, pretty, prettyExact} from "~/assets/utils.js";
import useFee from '~/composables/use-fee.js';
// import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import Loader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';

export default {
    components: {
        // BaseAmountEstimation,
        Loader,
        Modal,
    },
    directives: {
        autosize,
        checkEmpty,
    },
    mixins: [validationMixin],
    props: {
        txData: {
            type: Object,
            required: true,
        },
        $txData: {
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
        /** @type TX_TYPE */
        txType: {
            type: String,
            required: true,
        },
        beforeConfirmModalShow: {
            type: [Function, null],
            default: null,
        },
        alwaysAdvanced: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const {fee, feeProps} = useFee();

        return {
            fee,
            feeProps,
        };
    },
    data() {
        return {
            isFormSending: false,
            serverError: '',
            serverSuccess: null,
            form: {
                payload: '',
            },
            formAdvanced: {
                payload: '',
            },
            isModeAdvanced: false,
            isConfirmModalVisible: false,
            isSuccessModalVisible: false,
        };
    },
    validations() {
        const form = {
            payload: {
                // considers unicode bytes @see https://stackoverflow.com/a/42684638/4936667
                maxLength: (value) => this.payloadLength <= 10000,
                isNotMnemonic: (value) => !isValidMnemonic(value),
            },
        };

        return {
            form,
            txData: {
                valid: () => !this.$txData.$invalid,
            },
        };
    },
    computed: {
        balance() {
            return this.$store.getters.balance;
        },
        isShowPayload() {
            return this.txType !== TX_TYPE.REDEEM_CHECK;
        },
        showAdvanced() {
            return this.alwaysAdvanced || this.isModeAdvanced;
        },
        showSwitcherAdvanced() {
            if (this.alwaysAdvanced) {
                // switcher not needed for always visible advanced fields
                return false;
            }
            return this.txType === TX_TYPE.SEND;
        },
        payloadLength() {
            return new Blob([this.form.payload]).size;
        },
        feeBusParams() {
            return {
                txParams: {
                    payload: this.form.payload,
                    type: this.txType,
                    data: this.txData,
                },
                baseCoinAmount: this.$store.getters.baseCoin?.amount,
                fallbackToCoinToSpend: true,
            };
        },
    },
    watch: {
        feeBusParams: {
            handler(newVal) {
                Object.assign(this.feeProps, newVal);
            },
            deep: true,
            immediate: true,
        },
        form: {
            handler(newVal) {
                this.$emit('update:txForm', newVal);
            },
            deep: true,
        },
    },
    methods: {
        pretty: (val) => pretty(val, undefined, true),
        prettyExact,
        submitConfirm() {
            if (this.isFormSending) {
                return;
            }
            if (this.$v.$invalid) {
                this.$v.$touch();
                this.$txData.$touch();
                return;
            }

            let beforeShowPromise;
            if (typeof this.beforeConfirmModalShow === 'function') {
                beforeShowPromise = this.beforeConfirmModalShow(this);
            }
            // ensure beforeShowPromise to be promise
            if (!beforeShowPromise || typeof beforeShowPromise.then !== 'function') {
                beforeShowPromise = Promise.resolve();
            }
            beforeShowPromise.then(() => {
                this.isConfirmModalVisible = true;
            }).catch((e) => {
                console.log(e);
            });
        },
        submit() {
            this.isConfirmModalVisible = false;
            this.isSuccessModalVisible = false;
            this.serverError = '';
            this.serverSuccess = null;
            this.$emit('success-tx', null);

            this.postTx();
        },
        postTx() {
            this.isFormSending = true;

            let postTxPromise;
            let txParams = this.getTxParams();
            postTxPromise = postTx(txParams, {
                // private key to sign
                privateKey: this.$store.getters.privateKey,
                // don't increase gasPrice for high-fee tx
                gasRetryLimit: this.fee.isHighFee ? 0 : 2,
            });

            postTxPromise
                .then((tx) => {
                    this.isFormSending = false;
                    this.serverSuccess = tx;
                    this.$emit('success-tx', this.serverSuccess);
                    this.isSuccessModalVisible = true;
                    this.clearForm();
                })
                .catch((error) => {
                    console.log(error);
                    this.isFormSending = false;
                    this.serverError = getErrorText(error);
                });
        },
        getTxParams() {
            return {
                chainId: this.$store.getters.CHAIN_ID,
                ...clearEmptyFields(this.form),
                data: clearEmptyFields(this.txData),
                type: this.txType,
                gasCoin: this.fee.coin,
                signatureType: 1,
            };
        },
        switchToAdvanced() {
            this.isModeAdvanced = true;
            // restore advanced data
            this.form.payload = this.formAdvanced.payload;
        },
        switchToSimple() {
            this.isModeAdvanced = false;
            // save advanced data
            this.formAdvanced.payload = this.form.payload;
            // clear advanced form
            this.form.payload = '';
        },
        clearForm() {
            this.form.payload = '';
            this.formAdvanced.payload = '';
            this.$v.$reset();
            //@TODO
            // clear txData
            // const cleanTxData = {};
            // Object.keys(this.txData).forEach((key) => {
            //     cleanTxData[key] = null;
            // });
            // this.$emit('update:txData', cleanTxData);
            this.$txData.$reset();
            this.$emit('clear-form');
        },
        getExplorerTxUrl,
    },
};

/**
 * Ensure empty fields to be undefined
 * @param {Object} obj
 * @return {Object}
 */
function clearEmptyFields(obj) {
    let result = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] || obj[key] === 0 || obj[key] === false) {
            result[key] = obj[key];
        }
    });

    return result;
}
</script>

<template>
    <div>
        <slot name="panel-header"></slot>

        <!-- Form -->
        <form novalidate @submit.prevent="submitConfirm">
            <!-- Tx Data Fields -->
            <slot :fee="fee" :address-balance="balance"></slot>

            <div class="form-row" v-show="showAdvanced && isShowPayload">
                <label class="form-field" :class="{'is-error': $v.form.payload.$error}">
                    <input class="form-field__input" type="text" v-check-empty
                           v-model.trim="form.payload"
                           @blur="$v.form.payload.$touch()"
                    >
                    <span class="form-field__label">{{ $td('Message', 'form.message') }}</span>
                </label>
                <span class="form-field__error" v-if="$v.form.payload.$dirty && !$v.form.payload.maxLength">{{ $td(`Max 10000 symbols, given ${payloadLength}`, 'form.message-error-max') }}</span>
                <span class="form-field__error" v-if="$v.form.payload.$dirty && !$v.form.payload.isNotMnemonic">{{ $td('Message contains seed phrase', 'form.message-error-contains-seed') }}</span>
                <div class="form-field__help">{{ $td('Any additional information about the transaction. Please&nbsp;note it will be stored on the blockchain and visible to&nbsp;anyone.', 'form.message-help') }}</div>
            </div>


            <!-- Controls -->
            <div class="form-row" v-if="showSwitcherAdvanced">
                <button class="link--default u-semantic-button" type="button" @click="switchToSimple" v-if="showAdvanced">
                    {{ $td('Remove message', 'form.toggle-simple-mode') }}
                </button>
                <button class="link--default u-semantic-button" type="button" @click="switchToAdvanced" v-if="!showAdvanced">
                    {{ $td('Add message', 'form.toggle-advanced-mode') }}
                </button>
            </div>
            <div class="form-row">
                <button
                    class="button button--main button--full"
                    :class="{
                                'is-loading': isFormSending,
                                'is-disabled': $v.$invalid
                            }"
                >
                            <span class="button__content">
                                <slot name="submit-title">
                                    {{ $td('Send', 'form.wallet-send-button') }}
                                </slot>
                            </span>
                    <Loader class="button__loader" :isLoading="true"/>
                </button>
                <div class="form-field__error" v-if="serverError">{{ serverError }}</div>
                <div class="form-field__error" v-if="fee.error">{{ fee.error }}</div>
            </div>
        </form>

        <slot name="panel-footer"></slot>

        <!-- Confirm Modal -->
        <Modal v-bind:isOpen.sync="isConfirmModalVisible">
            <slot name="confirm-modal-header">
                <h2 class="u-h3 u-mb-10">
                    {{ $td('Send transaction', 'form.confirm-title') }}
                </h2>
            </slot>
            <slot name="confirm-modal-body"></slot>
            <!--
            <div class="form-row">
                <h3 class="estimation__title">{{ $td('Transaction fee', 'form.tx-fee') }}</h3>
                <BaseAmountEstimation :coin="fee.coinSymbol" :amount="fee.value" :exact="true"/>

                <div class="u-mt-10 u-fw-700" v-if="fee.isHighFee"><span class="u-emoji">⚠️</span> {{ $td('Transaction requires high fee.', 'form.tx-fee-high') }}</div>
            </div>
            -->
            <div class="form-row">
                <button class="button button--main button--full" type="button" data-focus-on-open
                        :class="{'is-loading': isFormSending}"
                        @click="submit"
                >
                    <span class="button__content">{{ $td('Confirm', 'form.submit-confirm-button') }}</span>
                    <Loader class="button__loader" :isLoading="true"/>
                </button>
                <button class="button button--ghost-main button--full" type="button" v-if="!isFormSending" @click="isConfirmModalVisible = false">
                    {{ $td('Cancel', 'form.submit-cancel-button') }}
                </button>
            </div>
            <slot name="confirm-modal-footer"></slot>
        </Modal>

        <!-- Success Modal -->
        <Modal v-bind:isOpen.sync="isSuccessModalVisible">
            <slot name="success-modal-header">
                <h2 class="u-h3 u-mb-10">
                    {{ $td('Success!', 'form.success-title') }}
                </h2>
            </slot>
            <slot name="success-modal-body">
                <strong>{{ $td('Tx sent:', 'form.tx-sent') }}</strong>
                <a class="link--default u-text-break" :href="getExplorerTxUrl(serverSuccess.hash)" target="_blank" v-if="serverSuccess">{{ serverSuccess.hash }}</a>
            </slot>
            <slot name="success-modal-body-extra" :success-tx="serverSuccess"></slot>
            <slot name="success-modal-button">
                <a class="button button--main button--full" :href="getExplorerTxUrl(serverSuccess.hash)" target="_blank" v-if="serverSuccess">
                    {{ $td('View transaction', 'form.success-view-button') }}
                </a>
            </slot>
            <button class="button button--ghost-main button--full" type="button" @click="isSuccessModalVisible = false">
                {{ $td('Close', 'form.success-close-button') }}
            </button>
        </Modal>
    </div>
</template>
