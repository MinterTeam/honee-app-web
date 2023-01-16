<script>
import {validationMixin} from 'vuelidate/src/index.js';
import {getErrorText} from "~/assets/server-error.js";
import {ensurePromise} from "~/assets/utils.js";
import {HUB_BUY_STAGE as LOADING_STAGE} from '~/assets/variables.js';
import useFee from '~/composables/use-fee.js';
import useTxService from '~/composables/use-tx-service.js';
import Loader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';
import HubBuyTxListItem from '~/components/HubBuyTxListItem.vue';

export default {
    LOADING_STAGE,
    components: {
        Loader,
        Modal,
        HubBuyTxListItem,
    },
    mixins: [validationMixin],
    emits: [
        'success',
        'progress-modal-close',
        'success-modal-close',
        'clear-form',
        'validation-touch',
        'update:fee',
        'update:is-sequence-processing',
    ],
    props: {
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
        beforeSuccessSequence: {
            type: [Function, null],
            default: null,
        },
    },
    setup() {
        const {fee, setFeeProps, refineByIndex} = useFee();
        const { txServiceState, currentLoadingStage, setStepList, sendTxSequence} = useTxService();

        return {
            fee,
            setFeeProps,
            refineByIndex,

            txServiceState,
            currentLoadingStage,
            setStepList,
            sendTxSequence,
        };
    },
    data() {
        return {
            isFormSending: false,
            serverError: '',
            isConfirmModalVisible: false,
            isProgressModalVisible: false,
        };
    },
    //@TODO maybe use v$sequenceParams directly
    validations() {
        return {
            sequenceParams: {
                valid: () => !this.v$sequenceParams.$invalid,
            },
        };
    },
    computed: {
    },
    watch: {
        fee: {
            handler(newVal) {
                this.$emit('update:fee', newVal);
            },
        },
        isFormSending: {
            handler(newVal) {
                this.$emit('update:is-sequence-processing', newVal);
            },
        },
    },
    created() {
        // feeBusParams
        this.$watch(
            () => {
                const sequenceParamsArray = Array.isArray(this.sequenceParams) ? this.sequenceParams : [this.sequenceParams];
                const txParamsList = sequenceParamsArray.map((item) => item.feeTxParams ?? item.txParams);

                return {
                    txParamsList,
                    baseCoinAmount: this.$store.getters.baseCoinAmount,
                    fallbackToCoinToSpend: true,
                    isLocked: this.isFormSending || txParamsList.length === 0,
                };
            },
            (newVal) => this.setFeeProps(newVal),
            {deep: true, immediate: true},
        );
    },
    methods: {
        handleProgressModalClose() {
            this.$emit('progress-modal-close');
            if (this.currentLoadingStage === LOADING_STAGE.FINISH) {
                this.$emit('success-modal-close');
            }
        },
        submitConfirm() {
            if (this.isFormSending) {
                return;
            }
            if (this.$v.$invalid) {
                this.$v.$touch();
                this.v$sequenceParams.$touch();
                this.$emit('validation-touch');
                return;
            }

            ensurePromise(this.beforeConfirmModalShow, this).then(() => {
                this.isConfirmModalVisible = true;
            }).catch((error) => {
                console.log(error);
            });
        },
        submit() {
            this.isConfirmModalVisible = false;
            this.isProgressModalVisible = true;

            this.postSequence();
        },
        postSequence() {
            this.isFormSending = true;
            this.serverError = '';
            this.setStepList({});

            ensurePromise(this.beforePostSequence)
                .then(() => {
                    let sequenceParams = Array.isArray(this.sequenceParams) ? this.sequenceParams : [this.sequenceParams];
                    sequenceParams = sequenceParams.map((item, index) => {
                        if (item.skip) {
                            return item;
                        }

                        // fill txParams with gasCoin
                        const prepareGasCoin = item.prepareGasCoinPosition === 'skip' && index === 0
                            ? () => ({gasCoin: this.fee.resultList?.[0]?.coin})
                            : () => this.refineByIndex(index).then((fee) => ({
                                gasCoin: fee?.coin,
                                // extra data to pass to next `prepare`
                                extra: {fee},
                            }));
                        const itemPrepare = Array.isArray(item.prepare)
                            ? item.prepare
                            : (item.prepare ? [item.prepare] : []);
                        const prepareGasCoinPosition = item.prepareGasCoinPosition || 'start';

                        //@TODO ensure correct prepare array is formed
                        return {
                            ...item,
                            prepare: arrayInsertAtPosition(itemPrepare, prepareGasCoin, prepareGasCoinPosition),
                        };
                    });
                    return this.sendTxSequence(sequenceParams, {
                        // private key to sign
                        privateKey: this.$store.getters.privateKey,
                        // don't increase gasPrice for high-fee tx
                        gasRetryLimit: this.fee.isHighFee ? 0 : 2,
                    });
                })
                .then((tx) => {
                    return ensurePromise(this.beforeSuccessSequence);
                })
                .then(() => {
                    this.isFormSending = false;
                    this.$emit('success');
                    this.clearForm();
                })
                .catch((error) => {
                    console.error(error);
                    this.isFormSending = false;
                    this.serverError = getErrorText(error);
                });
        },
        finishSending() {
            this.isProgressModalVisible = false;
            this.setStepList({});
        },
        clearForm() {
            this.$v.$reset();
            this.v$sequenceParams.$reset();
            this.$emit('clear-form');
        },
    },
};

/**
 * @param {Array<function>} target
 * @param {function} item
 * @param {'start'|'end'} position
 * @return {Array<function>}
 */
function arrayInsertAtPosition(target, item, position) {
    target = target.slice();
    if (position === 'start') {
        target.unshift(item);
    } else {
        target.push(item);
    }
    return target;
}
</script>

<template>
    <div>
        <slot name="panel-header"></slot>

        <!-- Form -->
        <form novalidate @submit.prevent="submitConfirm()">
            <!-- Tx Data Fields -->
            <slot :fee="fee"></slot>


            <div class="form-row">
                <button
                    type="submit"
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
            <p class="form-row u-text-center u-text-muted u-text-small">{{ $td('By clicking this button, you confirm that you’ve read and understood the disclaimer in the footer.', 'form.read-understood') }}</p>
        </form>

        <slot name="panel-footer"></slot>

        <!-- Confirm Modal -->
        <Modal :isOpen.sync="isConfirmModalVisible">
            <slot name="confirm-modal-header">
                <h2 class="u-h3 u-mb-10">
                    {{ $td('Send transaction', 'form.confirm-title') }}
                </h2>
            </slot>
            <slot name="confirm-modal-body"></slot>
            <!--
            <div class="form-row">
                <h3 class="information__title">{{ $td('Transaction fee', 'form.tx-fee') }}</h3>
                <BaseAmountEstimation :coin="fee.coinSymbol" :amount="fee.value" :exact="true"/>

                <div class="u-mt-10 u-fw-700" v-if="fee.isHighFee"><span class="u-emoji">⚠️</span> {{ $td('Transaction requires high fee.', 'form.tx-fee-high') }}</div>
            </div>
            -->
            <div class="form-row">
                <button
                    class="button button--main button--full" type="button" data-focus-on-open
                    :class="{'is-loading': isFormSending}"
                    @click="submit()"
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

        <!-- Loading modal -->
        <Modal :isOpen.sync="isProgressModalVisible" @modal-close="handleProgressModalClose()" :disable-outside-click="isFormSending">
            <h2 class="u-h3 u-mb-10" v-if="currentLoadingStage === $options.LOADING_STAGE.FINISH">
                {{ $td('Success', 'form.success-title') }}!
            </h2>
            <slot name="progress-modal-header" v-else>
                <h2 class="u-h3 u-mb-10">
                    <template v-if="sequenceParams.length > 1">
                        {{ $td('Sending transactions', 'sequence.progress-modal-title-multi') }}
                    </template>
                    <template v-else>
                        {{ $td('Sending transaction', 'sequence.progress-modal-title-single') }}
                    </template>
                </h2>
            </slot>

            <HubBuyTxListItem
                class="hub__buy-stage form-row"
                v-for="item in txServiceState.steps"
                :key="item.loadingStage"
                :step="item"
                :loadingStage="item.loadingStage"
            />
            <div class="form-row" v-if="serverError || !$store.state.onLine">
                <div class="u-grid u-grid--small u-grid--vertical-margin--small">
                    <div class="u-cell form__error u-text-wrap u-text-medium">
                        <template v-if="!$store.state.onLine">{{ $td('No Internet connection', 'error.no-internet-connection') }}</template>
                        <template v-else>{{ serverError }}</template>
                    </div>
                    <!--
                    <div class="u-cell u-cell&#45;&#45;1-2">
                        <button class="button button&#45;&#45;main button&#45;&#45;full" type="button" :class="{'is-disabled': !$store.state.onLine}" @click="retrySending()">
                            {{ $td('Retry', 'common.retry') }}
                        </button>
                    </div>
                    -->
                    <div class="u-cell">
                        <button class="button button--ghost button--full" type="button" @click="finishSending()">
                            {{ $td('Finish', 'common.finish') }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="form-row u-text-medium u-fw-500" v-if="currentLoadingStage !== $options.LOADING_STAGE.FINISH">
                <span class="u-emoji">⚠️</span> {{ $td('Please keep this page active, otherwise progress may&nbsp;be&nbsp;lost.', 'index.keep-page-active') }}
            </div>
            <div class="form-row" v-if="currentLoadingStage === $options.LOADING_STAGE.FINISH">
                <button class="button button--ghost-main button--full" type="button" @click="isProgressModalVisible = false; /*finishSending();*/">
                    {{ $td('Close', 'common.close') }}
                </button>
            </div>
        </Modal>
    </div>
</template>
