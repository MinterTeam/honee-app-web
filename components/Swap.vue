<script>
import {postTx} from '~/api/gate.js';
import {getErrorText} from "~/assets/server-error";
import {pretty, prettyExact, prettyPrecise, decreasePrecisionSignificant, getExplorerTxUrl} from '~/assets/utils.js';
import useFee from '~/composables/use-fee.js';
import {getTxType} from '~/components/base/SwapEstimation.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import SwapEstimation from '~/components/base/SwapEstimation.vue';

export default {
    components: {
        BaseAmountEstimation,
        BaseLoader,
        Modal,
        FieldCombined,
        SwapEstimation,
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
    setup() {
        const {fee, feeProps} = useFee();

        return {
            fee,
            feeProps,
        };
    },
    data() {
        const coinList = this.$store.state.balance;
        let firstBalanceSymbol = coinList?.length ? coinList[0].coin.symbol : '';
        // can't be same as coinToBuy
        if (firstBalanceSymbol === this.params.coinToBuy?.toUpperCase()) {
            firstBalanceSymbol = '';
        }
        return {
            isFormSending: false,
            serverError: '',
            serverSuccess: '',
            form: {
                coinFrom: this.params.coinToSell?.toUpperCase() || this.$route.query.coinToSell?.toUpperCase() || firstBalanceSymbol,
                coinTo: this.params.coinToBuy?.toUpperCase() || '',
                sellAmount: this.params.valueToSell || '',
                buyAmount: this.params.valueToBuy || '',
            },
            isSelling: true,
            isUseMax: false, // should sellAllTx be used
            v$estimation: {
                estimationError: {},
                isEstimationWaiting: {},
            },
            estimation: 0,
            txData: {},
            isConfirmModalVisible: false,
            isSuccessModalVisible: false,
        };
    },
    computed: {
        feeBusParams() {
            const isEstimationTypePool = !!this.txData.coins;
            return {
                txParams: {
                    // don't use `this.txType`, it may lead to infinite loop
                    // ignore `isSellAll` to get `sell` fee (assume sell and sell-all txs consume equal fees)
                    type: getTxType({isPool: isEstimationTypePool, isSelling: this.isSelling, isSellAll: false}),
                    data: {
                        // pass only fields that affect fee
                        coinToSell: this.form.coinFrom,
                        coins: this.txData.coins,
                    },
                },
                baseCoinAmount: this.$store.getters.baseCoinAmount,
                fallbackToCoinToSpend: true,
            };
        },
    },
    watch: {
        'v$estimation.estimationError': {
            handler(newVal) {
                this.handleEstimationError(this.v$estimation.estimationError?.$invalid);
            },
        },
        feeBusParams: {
            handler(newVal) {
                Object.assign(this.feeProps, newVal);
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        pretty,
        prettyExact,
        prettyPrecise,
        getExplorerTxUrl,
        handleGetEstimation(estimation) {
            this.estimation = estimation;
            if (this.isSelling) {
                this.form.buyAmount = decreasePrecisionSignificant(estimation);
            } else {
                this.form.sellAmount = estimation;
            }
        },
        // consider combine handleEstimation and handleEstimationError
        handleEstimationError(estimationError) {
            if (estimationError) {
                if (this.isSelling) {
                    this.form.buyAmount = 0;
                } else {
                    this.form.sellAmount = 0;
                }
            }
        },
        openConfirmation() {
            //@TODO handle loading fee
            if (this.isFormSending /* || this.fee.isLoading */) {
                return;
            }
            if (this.v$estimation.$invalid) {
                if (!this.v$estimation.estimationError.absent) {
                    this.$refs.estimation.getEstimation(true);
                } else {
                    this.v$estimation.$touch();
                }
                return;
            }

            this.isFormSending = true;
            this.serverError = '';
            this.serverSuccess = '';
            //@TODO in case if last estimation still loading we can use it instead of forcing new estimation
            this.$refs.estimation.getEstimation(true, true)
                .then(() => {
                    this.isConfirmModalVisible = true;
                    this.isFormSending = false;
                });
        },
        submit() {
            if (this.isFormSending || !this.v$estimation.isEstimationWaiting.finished || !this.v$estimation.estimationError.absent/* || this.fee.isLoading*/) {
                return;
            }

            if (this.v$estimation.$invalid) {
                this.v$estimation.$touch();
                return;
            }

            this.isConfirmModalVisible = false;
            this.isFormSending = true;
            this.serverError = '';
            this.serverSuccess = '';
            postTx({
                type: this.$refs.estimation.getTxType(),
                data: this.txData,
                gasCoin: this.fee.coin,
            }, {privateKey: this.$store.getters.privateKey})
                .then((tx) => {
                    this.$emit('success');
                    this.serverSuccess = tx;
                    this.isSuccessModalVisible = true;
                    this.isFormSending = false;
                    this.clearForm();
                })
                .catch((error) => {
                    console.log(error);
                    this.isFormSending = false;
                    this.serverError = getErrorText(error);
                });
        },
        reverseCoins() {
            const coinFrom = this.form.coinFrom;
            this.form.coinFrom = this.form.coinTo;
            this.form.coinTo = coinFrom;
        },
        clearForm() {
            this.form.coinFrom = this.$store.state.balance && this.$store.state.balance.length ? this.$store.state.balance[0].coin.symbol : '';
            this.form.coinTo = '';
            this.form.sellAmount = '';
            this.form.buyAmount = '';
            this.v$estimation.$reset();
        },
    },
};
</script>

<template>
    <div>
        <form novalidate @submit.prevent="openConfirmation()">
            <div class="form-row" v-if="!params.coinToSell && v$estimation.coinToSell">
                <FieldCombined
                    :coin.sync="form.coinFrom"
                    :$coin="v$estimation.coinToSell"
                    :coinList="$store.state.balance"
                    :amount.sync="form.sellAmount"
                    :$amount="v$estimation.valueToSell"
                    :useBalanceForMaxValue="true"
                    :fee="fee"
                    :isUseMax.sync="isUseMax"
                    :label="$td('You pay', 'form.swap-sell-coin')"
                    @input-native="isSelling = true"
                    @use-max="isSelling = true"
                    @blur="$refs.estimation.handleInputBlur()"
                />
                <span class="form-field__error" v-if="v$estimation.coinToSell.$dirty && !v$estimation.coinToSell.required">{{ $td('Enter coin', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="v$estimation.coinToSell.$dirty && !v$estimation.coinToSell.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                <span class="form-field__error" v-if="v$estimation.valueToSell.$dirty && !v$estimation.valueToSell.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                <span class="form-field__error" v-else-if="v$estimation.valueToSell.$dirty && !v$estimation.valueToSell.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</span>
                <span class="form-field__error" v-else-if="v$estimation.valueToSell.$dirty && v$estimation.maxAmount.$invalid">{{ $td('Not enough coins', 'form.not-enough-coins') }}</span>
                <span class="form-field__error" v-else-if="v$estimation.valueToSell.$dirty && v$estimation.maxAmountAfterFee.$invalid">{{ $td('Not enough to pay transaction fee', 'form.fee-error-insufficient') }}: {{ pretty(fee.value) }} {{ fee.coinSymbol }}</span>
            </div>

            <button
                class="form-row button button--white convert__reverse-button" type="button"
                v-if="!params.coinToSell && !params.coinToBuy"
                @click="reverseCoins()"
            >
                <img class="" src="/img/icon-reverse.svg" width="24" height="24" alt="⇅">
            </button>

            <div class="form-row" v-if="!params.coinToBuy && v$estimation.coinToBuy">
                <FieldCombined
                    class="u-mb-10"
                    :coin.sync="form.coinTo"
                    :$coin="v$estimation.coinToBuy"
                    :amount.sync="form.buyAmount"
                    :$amount="v$estimation.valueToBuy"
                    :label="$td('You receive', 'form.swap-buy-coin')"
                    @input-native="isSelling = false"
                    @blur="$refs.estimation.handleInputBlur()"
                />

                <span class="form-field__error" v-if="v$estimation.coinToBuy.$dirty && !v$estimation.coinToBuy.required">{{ $td('Enter coin', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-if="v$estimation.valueToBuy.$dirty && !v$estimation.valueToBuy.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                <span class="form-field__error" v-else-if="v$estimation.valueToBuy.$dirty && !v$estimation.valueToBuy.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</span>
            </div>

            <SwapEstimation
                class="information form-row"
                ref="estimation"
                idPreventConcurrency="swapForm"
                :coin-to-sell="form.coinFrom"
                :coin-to-buy="form.coinTo"
                :value-to-sell="isSelling ? form.sellAmount : undefined"
                :value-to-buy="!isSelling ? form.buyAmount : undefined"
                :is-use-max="isUseMax"
                :fee="fee"
                :hide-props-validation-error="true"
                @update:estimation="handleGetEstimation($event)"
                @update:tx-data="txData = $event"
                @update:v$estimation="v$estimation = $event"
            />

            <div class="information form-row" v-if="!v$estimation.$invalid && (params.coinToSell || params.coinToBuy)">
                <template v-if="params.coinToSell">
                    <h3 class="information__title">{{ $td('You spend approximately', 'form.swap-confirm-spend-estimation') }}</h3>
                    <div class="information__item">
                        <div class="information__coin">
                            <img class="information__coin-icon" :src="$store.getters['explorer/getCoinIcon'](form.coinFrom)" width="20" height="20" alt="" role="presentation">
                            <div class="information__coin-symbol">{{ form.coinFrom }}</div>
                        </div>
                        <div class="information__value">≈{{ pretty(form.sellAmount || 0) }}</div>
                    </div>
                </template>
                <template v-if="params.coinToBuy">
                    <h3 class="information__title">{{ $td('You get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                    <div class="information__item">
                        <div class="information__coin">
                            <img class="information__coin-icon" :src="$store.getters['explorer/getCoinIcon'](form.coinTo)" width="20" height="20" alt="" role="presentation">
                            <div class="information__coin-symbol">{{ form.coinTo }}</div>
                        </div>
                        <div class="information__value">≈{{ pretty(form.buyAmount || 0) }}</div>
                    </div>
                </template>
            </div>

            <p class="form-row u-text-center u-text-muted u-text-small">{{ $td('The final amount depends on&nbsp;the&nbsp;exchange rate at&nbsp;the&nbsp;moment of&nbsp;transaction.', 'form.swap-confirm-note') }}</p>

            <div class="form-row">
                <button
                    type="submit"
                    class="button button--main button--full"
                    :class="{
                        'is-loading': isFormSending || !v$estimation.isEstimationWaiting.finished,
                        'is-disabled': v$estimation.$invalid
                    }"
                >
                    <span class="button__content">{{ $td('Buy', 'index.swap') }}</span>
                    <BaseLoader class="button__loader" :isLoading="true"/>
                </button>
                <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
            </div>

            <p class="form-row u-text-center u-text-muted u-text-small">{{ $td('By clicking this button, you confirm that you’ve read and understood the disclaimer in the footer.', 'form.read-understood') }}</p>
        </form>

        <!-- Confirm Modal -->
        <Modal :isOpen.sync="isConfirmModalVisible">
            <h2 class="u-h3 u-mb-10">
                {{ $td('Confirm swap', 'form.swap-confirm') }}
            </h2>
            <div class="information form-row">
                <template v-if="isSelling">
                    <h3 class="information__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                    <BaseAmountEstimation :coin="form.coinFrom" :amount="form.sellAmount" format="exact"/>

                    <h3 class="information__title">{{ $td('You will get approximately', 'form.swap-confirm-receive-estimation') }} *</h3>
                    <BaseAmountEstimation :coin="form.coinTo" :amount="form.buyAmount" format="approx"/>
                    <!--
                    <span class="u-text-muted u-display-ib">(min: {{ prettyExact(txData.minimumValueToBuy) }})</span>
                    -->
                </template>
                <template v-else>
                    <h3 class="information__title">{{ $td('You will pay approximately', 'form.swap-confirm-pay-estimation') }} *</h3>
                    <BaseAmountEstimation :coin="form.coinFrom" :amount="form.sellAmount" format="approx"/>
                    <!--
                    <span class="u-text-muted u-display-ib">(max: {{ prettyExact(txData.maximumValueToSell) }})</span>
                    -->

                    <h3 class="information__title">{{ $td('You will get', 'form.you-will-get') }}</h3>
                    <BaseAmountEstimation :coin="form.coinTo" :amount="form.buyAmount" format="exact"/>
                </template>

                <!--
                <h3 class="information__title">{{ $td('Rate of', 'form.rate') }} {{ form.coinFrom }}</h3>
                <BaseAmountEstimation :coin="form.coinTo" :amount="form.buyAmount / form.sellAmount"/>

                <h3 class="information__title">{{ $td('Rate of', 'form.rate') }} {{ form.coinTo }}</h3>
                <BaseAmountEstimation :coin="form.coinFrom" :amount="form.sellAmount / form.buyAmount"/>

                <h3 class="information__title">{{ $td('Swap type', 'form.swap-type') }}</h3>
                <div class="information__item">
                    <template v-if="isPool">
                        Pools:
                        {{ estimationRoute ? estimationRoute.map((coin) => coin.symbol).join(' > ') : form.coinFrom + ' > ' + form.coinTo }}
                    </template>
                    <template v-else>{{ $td('Reserves', 'form.reserves') }}</template>
                </div>

                <h3 class="information__title">{{ $td('Transaction fee', 'form.tx-fee') }}</h3>
                <BaseAmountEstimation :coin="fee.coinSymbol" :amount="fee.value" :exact="true"/>

                <div class="u-mt-10 u-fw-700" v-if="fee.isHighFee"><span class="u-emoji">⚠️</span> {{ $td('Transaction requires high fee.', 'form.tx-fee-high') }}</div>
                -->
            </div>

            <div class="form-row u-text-muted u-text-small u-text-center">
                * {{ $td('The final amount depends on&nbsp;the&nbsp;exchange rate at&nbsp;the&nbsp;moment of&nbsp;transaction.', 'form.swap-confirm-note') }}
            </div>

            <button
                class="button button--main button--full form-row" type="button" data-focus-on-open
                :class="{'is-loading': isFormSending}"
                @click="submit()"
            >
                <span class="button__content">{{ $td('Confirm', 'form.submit-confirm-button') }}</span>
                <BaseLoader class="button__loader" :isLoading="true"/>
            </button>
            <button class="button button--ghost-main button--full form-row" type="button" v-if="!isFormSending" @click="isConfirmModalVisible = false">
                {{ $td('Cancel', 'form.submit-cancel-button') }}
            </button>
        </Modal>

        <!-- success modal -->
        <Modal :isOpen.sync="isSuccessModalVisible" @modal-close="$emit('success-modal-close')">
            <h2 class="u-h3 u-mb-10">{{ $td('Success', 'form.success-title') }}</h2>
            <p class="u-mb-10">{{ $td('Coins successfully exchanged!', 'form.swap-success-desc') }}</p>

            <a class="button button--main button--full" :href="getExplorerTxUrl(serverSuccess.hash)" target="_blank" v-if="serverSuccess">
                {{ $td('View transaction', 'form.success-view-button') }}
            </a>
            <button class="button button--ghost-main button--full" type="button" @click="isSuccessModalVisible = false">
                {{ $td('Close', 'form.success-close-button') }}
            </button>
        </Modal>
    </div>
</template>
