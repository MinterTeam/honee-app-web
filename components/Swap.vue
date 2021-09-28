<script>
    import axios from 'axios';
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import minLength from 'vuelidate/lib/validators/minLength';
    import maxLength from 'vuelidate/lib/validators/maxLength';
    import maxValue from 'vuelidate/lib/validators/maxValue';
    import minValue from 'vuelidate/lib/validators/minValue';
    import withParams from 'vuelidate/lib/withParams';
    import decode from 'entity-decode';
    import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
    import {ESTIMATE_SWAP_TYPE} from 'minter-js-sdk/src/variables.js';
    import debounce from '~/assets/lodash5-debounce.js';
    import Big from '~/assets/big.js';
    import {postTx, estimateCoinSell, estimateCoinBuy} from '~/api/gate.js';
    import FeeBus from '~/assets/fee';
    import {getErrorText} from "~/assets/server-error";
    import {pretty, prettyExact, prettyPrecise, decreasePrecisionSignificant, getExplorerTxUrl} from '~/assets/utils.js';
    import BaseAmount from '@/components/base/BaseAmount.vue';
    import BaseLoader from '@/components/base/BaseLoader.vue';
    import Modal from '@/components/base/Modal.vue';
    import FieldSwap from '@/components/base/FieldSwap.vue';

    const isValidAmount = withParams({type: 'validAmount'}, (value) => {
        return parseFloat(value) >= 0;
    });

    let feeBus;

    let estimationCancel;
    const CANCEL_MESSAGE = 'Cancel previous request';

    export default {
        ESTIMATE_SWAP_TYPE,
        components: {
            BaseAmount,
            BaseLoader,
            Modal,
            FieldSwap,
        },
        mixins: [validationMixin],
        directives: {
        },
        props: {
            params: {
                type: Object,
                default: () => ({}),
            },
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
                    coinFrom: this.params.coinToSell?.toUpperCase() || firstBalanceSymbol,
                    coinTo: this.params.coinToBuy?.toUpperCase() || '',
                    sellAmount: this.params.valueToSell || '',
                    buyAmount: this.params.valueToBuy || '',
                },
                isSelling: true,
                /** @type FeeData */
                fee: {},
                estimation: null,
                estimationType: null,
                estimationRoute: null,
                isEstimationLoading: false,
                estimationError: false,
                isEstimationPending: false,
                debouncedGetEstimation: null,
                isUseMax: false, // should sellAllTx be used
                isConfirmModalVisible: false,
                isSuccessModalVisible: false,
            };
        },
        validations() {
            return {
                form: {
                    coinFrom: {
                        required,
                        minLength: minLength(3),
                    },
                    coinTo: {
                        required,
                        minLength: minLength(3),
                        // maxLength: maxLength(10),
                    },
                    sellAmount: {
                        required: this.isSelling ? required : () => true,
                        validAmount: this.isSelling ? (value) => value > 0 : () => true,
                        minValue: this.isSelling ? (value) => this.txDataValueToSell > 0 : () => true,
                        // maxValue: maxValue(this.maxAmount || 0),
                    },
                    buyAmount: {
                        required: !this.isSelling ? required : () => true,
                        validAmount: !this.isSelling ? (value) => value > 0 : () => true,
                        // maxValue: maxValue(this.maxAmount || 0),
                    },
                },
                minimumValueToBuy: {
                    required: (value) => value >= 0,
                    maxValue: (value) => Number(value) <= Number(this.form.buyAmount),
                },
                maximumValueToSell: {
                    required: (value) => value >= 0,
                    minValue: (value) => Number(value) >= Number(this.form.sellAmount),
                },
            };
        },
        watch: {
            'form.sellAmount': function(newVal, oldVal) {
                // wait computed to recalculate after @use-max
                setTimeout(() => {
                    if (this.isSelling) {
                        this.watchForm();
                    }
                }, 0);
            },
            'form.buyAmount': function(newVal, oldVal) {
                console.log('watch buy', !this.isSelling);
                if (!this.isSelling) {
                    this.watchForm();
                }
            },
            'form.coinFrom': function(newVal, oldVal) {
                this.watchForm();
            },
            'form.coinTo': function(newVal, oldVal) {
                this.watchForm();
            },
            feeBusParams: {
                handler(newVal) {
                    if (feeBus && typeof feeBus.$emit === 'function') {
                        feeBus.$emit('update-params', newVal);
                    }
                },
                deep: true,
            },
        },
        computed: {
            isPool() {
                return this.estimationType === ESTIMATE_SWAP_TYPE.POOL;
            },
            isSellAll() {
                if (!this.isSelling) {
                    return false;
                }
                // not use max
                if (!this.isUseMax) {
                    return false;
                }
                // use max
                // selling base coin (no matter if it is not enough to pay fee)
                if (this.form.coinFrom === this.$store.getters.COIN_NAME) {
                    return true;
                }
                // selling custom coin
                // base coin is not enough try use selected coin to pay fee
                if (!this.fee.isBaseCoinEnough) {
                    return true;
                } else {
                    return false;
                }
            },
            //@TODO move to SwapField?
            txDataValueToSell() {
                if (this.isSellAll && this.fee.coinSymbol === this.form.coinFrom) {
                    const value = new Big(this.form.sellAmount || 0).minus(this.fee.value || 0);
                    return value.gte(0) ? value.toString() : '0';
                } else {
                    return this.form.sellAmount;
                }
            },
            txDataCoins() {
                return this.estimationRoute
                    ? this.estimationRoute.map((coin) => coin.id)
                    : [this.form.coinFrom, this.form.coinTo];
            },
            txData() {
                return {
                    ...(!this.isPool ? {
                        coinToSell: this.form.coinFrom,
                        coinToBuy: this.form.coinTo,
                    } : {
                        coins: this.txDataCoins,
                    }),
                    // sell
                    valueToSell: this.form.sellAmount,
                    minimumValueToBuy: this.minimumValueToBuy,
                    // buy
                    valueToBuy: this.form.buyAmount,
                    maximumValueToSell: this.maximumValueToSell,
                };
            },
            minimumValueToBuy() {
                let slippage = 1 - 5 / 100; // 5%
                slippage = Math.max(slippage, 0);
                return decreasePrecisionSignificant(this.form.buyAmount * slippage);
            },
            maximumValueToSell() {
                let slippage = 1 + 5 / 100; // 5%
                return decreasePrecisionSignificant(this.form.sellAmount * slippage);
            },
            feeBusParams() {
                return {
                    txParams: {
                        // don't use `this.txType`, it may lead to infinite loop
                        // ignore `isSellAll` to get `sell` fee (assume sell and sell-all txs consume equal fees)
                        type: getTxType({isPool: this.isPool, isSelling: this.isSelling, isSellAll: false}),
                        data: {
                            // pass only fields that affect fee
                            coinToSell: this.form.coinFrom,
                            coins: this.txDataCoins,
                        },
                    },
                    baseCoinAmount: this.$store.getters.baseCoin && this.$store.getters.baseCoin.amount,
                    fallbackToCoinToSpend: true,
                };
            },
            // currentEstimation() {
            //     if (this.$v.form.$invalid || !this.estimation || this.isEstimationWaiting || this.estimationError) {
            //         return 0;
            //     }
            //
            //     return this.estimation;
            // },
            isEstimationWaiting() {
                return this.isEstimationPending || this.isEstimationLoading;
            },
            isEstimationErrorVisible() {
                return this.estimationError && !this.isEstimationWaiting;
            },
        },
        created() {
            feeBus = new FeeBus(this.feeBusParams);
            this.fee = feeBus.fee;
            feeBus.$on('update-fee', (newVal) => {
                this.fee = newVal;
            });

            this.debouncedGetEstimation = debounce(this.getEstimation, 1000);
        },
        methods: {
            pretty,
            prettyExact,
            prettyPrecise,
            getExplorerTxUrl,
            inputBlur() {
                // force estimation after blur if estimation was delayed
                if (this.debouncedGetEstimation.pending()) {
                    console.log('flush estimation');
                    this.debouncedGetEstimation.flush();
                }
            },
            watchForm() {
                console.log('watchForm', !this.$v.form.$invalid);
                if (this.$v.form.$invalid) {
                    return;
                }
                this.debouncedGetEstimation();
                this.isEstimationPending = true;
            },
            forceEstimation() {
                console.log('force estimation');
                // force new estimation without delay
                this.debouncedGetEstimation();
                return this.debouncedGetEstimation.flush();
            },
            getEstimation() {
                console.log('getEstimation');
                this.isEstimationPending = false;
                if (this.isEstimationLoading && typeof estimationCancel === 'function') {
                    estimationCancel(CANCEL_MESSAGE);
                }
                if (this.$v.form.$invalid) {
                    return;
                }
                this.isEstimationLoading = true;
                this.estimationError = false;

                let estimatePromise;
                if (this.isSelling) {
                    estimatePromise = estimateCoinSell({
                        coinToSell: this.form.coinFrom,
                        valueToSell: this.txDataValueToSell,
                        coinToBuy: this.form.coinTo,
                        findRoute: true,
                        // gasCoin: this.fee.coin || 0,
                    }, {
                        cancelToken: new axios.CancelToken((cancelFn) => estimationCancel = cancelFn),
                    })
                        .then((result) => {
                            this.form.buyAmount = decreasePrecisionSignificant(result.will_get);
                            // this.estimation = result.will_get;
                            return result;
                        })
                        .catch((error) => {
                            this.form.buyAmount = 0;
                            return Promise.reject(error);
                        });
                } else {
                    estimatePromise = estimateCoinBuy({
                        coinToSell: this.form.coinFrom,
                        valueToBuy: this.form.buyAmount,
                        coinToBuy: this.form.coinTo,
                        findRoute: true,
                        // gasCoin: this.fee.coin || 0,
                    }, {
                        cancelToken: new axios.CancelToken((cancelFn) => estimationCancel = cancelFn),
                    })
                        .then((result) => {
                            this.form.sellAmount = result.will_pay;
                            // this.estimation = result.will_pay;
                            return result;
                        })
                        .catch((error) => {
                            this.form.sellAmount = 0;
                            return Promise.reject(error);
                        });
                }
                return estimatePromise
                    .then((result) => {
                        console.log(result);
                        this.estimationType = result.swap_from;
                        this.estimationRoute = result.route;
                        this.isEstimationLoading = false;
                    })
                    .catch((error) => {
                        if (error.message === CANCEL_MESSAGE) {
                            return;
                        }
                        this.isEstimationLoading = false;
                        this.estimationError = getErrorText(error, 'Estimation error: ');
                    });
            },
            openConfirmation() {
                //@TODO handle loading fee
                if (this.isFormSending /* || this.fee.isLoading */) {
                    return;
                }
                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }

                this.isFormSending = true;
                this.serverError = '';
                this.serverSuccess = '';
                //@TODO in case if last estimation still loading we can use it instead of forcing new estimation
                this.forceEstimation()
                    .then(() => {
                        this.isConfirmModalVisible = true;
                        this.isFormSending = false;
                    });
            },
            submit() {
                if (this.isFormSending || this.isEstimationWaiting || this.estimationError/* || this.fee.isLoading*/) {
                    return;
                }

                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }

                this.isConfirmModalVisible = false;
                this.isFormSending = true;
                this.serverError = '';
                this.serverSuccess = '';
                postTx({
                    type: getTxType({isPool: this.isPool, isSelling: this.isSelling, isSellAll: this.isSellAll}),
                    data: this.txData,
                    gasCoin: this.fee.coin,
                }, {privateKey: this.$store.getters.privateKey})
                    .then((tx) => {
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
                this.$v.$reset();
            },
        },
    };

    /**
     *
     * @param {boolean} isSelling
     * @param {boolean} isPool
     * @param {boolean} [isSellAll]
     * @return {TX_TYPE}
     */
    function getTxType({isPool, isSelling, isSellAll}) {
        // buy
        const isBuy = !isSelling;
        if (isBuy && isPool) {
            return TX_TYPE.BUY_SWAP_POOL;
        }
        if (isBuy && !isPool) {
            return TX_TYPE.BUY;
        }
        // sell
        const isSell = !isSellAll;
        if (isSell && isPool) {
            return TX_TYPE.SELL_SWAP_POOL;
        }
        if (isSell && !isPool) {
            return TX_TYPE.SELL;
        }
        // sell all
        if (isPool) {
            return TX_TYPE.SELL_ALL_SWAP_POOL;
        }
        return TX_TYPE.SELL_ALL;
    }
</script>

<template>
    <div>
        <form novalidate @submit.prevent="openConfirmation()">
            <h1 class="u-h3 u-mb-10">
                Swap
                <template v-if="params.coinToSell">{{ params.coinToSell.toUpperCase() }}</template>
                <template v-if="params.coinToBuy && !params.coinToSell">coins</template>
                <template v-if="params.coinToBuy">for {{ params.coinToBuy.toUpperCase() }}</template>
            </h1>
<!--            <h2 class="u-h5 u-mb-10">You pay</h2>-->
            <FieldSwap
                :coin.sync="form.coinFrom"
                :$coin="$v.form.coinFrom"
                :coinList="$store.state.balance"
                :amount.sync="form.sellAmount"
                :$amount="$v.form.sellAmount"
                :useBalanceForMaxValue="true"
                :isUseMax.sync="isUseMax"
                label="You pay"
                @input-native="isSelling = true"
                @use-max="isSelling = true"
                @blur="inputBlur(); $v.form.sellAmount.$touch()"
            />
            <span class="form-field__error" v-if="$v.form.coinFrom.$dirty && !$v.form.coinFrom.required">Enter coin</span>
            <span class="form-field__error" v-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.required">Enter amount</span>
            <span class="form-field__error" v-else-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.validAmount">Wrong amount</span>
            <span class="form-field__error" v-else-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.minValue">Not enough to pay transaction fee: {{ pretty(fee.value) }} {{ fee.coinSymbol}}</span>
            <!--        <span class="form-field__error" v-else-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.maxAmount">Not enough coins</span>-->

            <button class="button button--white convert__reverse-button" type="button" @click="reverseCoins()" v-if="!params.coinToSell && !params.coinToBuy">
                <img class="" src="/img/icon-reverse.svg" width="24" height="24" alt="⇅">
            </button>

            <template v-if="!params.coinToBuy">
                <FieldSwap
                    class="u-mb-10"
                    :coin.sync="form.coinTo"
                    :$coin="$v.form.coinTo"
                    :amount.sync="form.buyAmount"
                    :$amount="$v.form.buyAmount"
                    label="You receive"
                    @input-native="isSelling = false"
                    @blur="inputBlur(); $v.form.buyAmount.$touch()"
                />

<!--                @TODO minimumValueToBuy, minimumValueToSell in estimation-->
                <div class="convert__panel u-text-error" v-if="!$v.form.$invalid && isEstimationErrorVisible">{{ estimationError }}</div>
                <div class="convert__panel u-text-error" v-else-if="$v.minimumValueToBuy.$dirty && !$v.minimumValueToBuy.required">Can't calculate swap limits</div>
                <div class="convert__panel u-text-error" v-else-if="$v.minimumValueToBuy.$dirty && !$v.minimumValueToBuy.minValue">Invalid swap limit</div>
            </template>

            <div class="estimation u-mt-10" v-if="params.coinToSell || params.coinToBuy">
                <h3 class="estimation__title">You get approximately</h3>
                <div class="estimation__item">
                    <div class="estimation__coin">
                        <img class="estimation__coin-icon" :src="$store.getters['explorer/getCoinIcon'](form.coinTo)" width="20" height="20" alt="" role="presentation">
                        <div class="estimation__coin-symbol">{{ form.coinTo }}</div>
                    </div>
                    <div class="u-fw-600 u-text-number">≈{{ pretty(form.buyAmount || 0) }}</div>
                </div>
            </div>

            <p class="u-text-center u-text-muted u-text-small u-mt-10">The final amount depends on&nbsp;the&nbsp;exchange rate at&nbsp;the&nbsp;moment of&nbsp;transaction.</p>

            <div class="u-section--small">
                <button class="button button--main button--full" :class="{'is-loading': isFormSending || isEstimationWaiting, 'is-disabled': $v.$invalid}">
                    <span class="button__content">Swap</span>
                    <BaseLoader class="button__loader" :isLoading="true"/>
                </button>
                <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
            </div>
            <p class="u-text-center u-text-muted u-text-small">By clicking this button you confirm that you’ve read and understood the text below.</p>
        </form>

        <!-- Confirm Modal -->
        <Modal v-bind:isOpen.sync="isConfirmModalVisible">
            <div class="panel">
                <div class="panel__header">
                    <h1 class="panel__header-title u-mb-10">
                        Confirm swap
                    </h1>
                </div>
                <div class="panel__section">
                    <div class="u-grid u-grid--small u-grid--vertical-margin u-text-left">
                        <template v-if="isSelling">
                            <div class="u-cell">
                                <label class="form-field form-field--dashed">
                                    <BaseAmount tag="div" class="form-field__input is-not-empty" :coin="form.coinFrom" :amount="form.sellAmount" :exact="true"/>
                                    <span class="form-field__label">You will spend</span>
                                </label>
                            </div>
                            <div class="u-cell">
                                <div class="form-field form-field--dashed">
                                    <div class="form-field__input is-not-empty">
                                        <BaseAmount :coin="form.coinTo" :amount="form.buyAmount" prefix="≈"/>
                                        <span class="u-text-muted u-display-ib">(min: {{ prettyExact(txData.minimumValueToBuy) }})</span>
                                    </div>
                                    <div class="form-field__label">
                                        You will get approximately *
                                    </div>
                                </div>
                                <div class="form-field__help u-text-left">
                                    * The result amount depends on the current rate at the time of the exchange and may differ from the above but can't exceed the limit.
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="u-cell">
                                <div class="form-field form-field--dashed">
                                    <div class="form-field__input is-not-empty">
                                        <BaseAmount :coin="form.coinFrom" :amount="form.sellAmount" prefix="≈"/>
                                        <span class="u-text-muted u-display-ib">(max: {{ prettyExact(txData.maximumValueToSell) }})</span>
                                    </div>
                                    <div class="form-field__label">
                                        You will pay approximately *
                                    </div>
                                </div>
                                <div class="form-field__help u-text-left">
                                    * The result amount depends on the current rate at the time of the exchange and may differ from the above but can't exceed the limit.
                                </div>
                            </div>
                            <div class="u-cell">
                                <label class="form-field form-field--dashed">
                                    <BaseAmount tag="div" class="form-field__input is-not-empty" :coin="form.coinTo" :amount="form.buyAmount" :exact="true"/>
                                    <span class="form-field__label">You will get</span>
                                </label>
                            </div>
                        </template>
                        <div class="u-cell u-cell--1-2">
                            <div class="form-field form-field--dashed">
                                <BaseAmount tag="div" class="form-field__input is-not-empty" :coin="form.coinTo" :amount="form.buyAmount / form.sellAmount"/>
                                <div class="form-field__label">1 {{ form.coinFrom }} rate</div>
                            </div>
                        </div>
                        <div class="u-cell u-cell--1-2">
                            <div class="form-field form-field--dashed">
                                <BaseAmount tag="div" class="form-field__input is-not-empty" :coin="form.coinFrom" :amount="form.sellAmount / form.buyAmount"/>
                                <div class="form-field__label">1 {{ form.coinTo }} rate</div>
                            </div>
                        </div>

                        <div class="u-cell">
                            <div class="form-field form-field--dashed">
                                <div class="form-field__input is-not-empty">
                                    <template v-if="isPool">
                                        Pools:
                                        {{ estimationRoute ? estimationRoute.map((coin) => coin.symbol).join(' > ') : form.coinFrom + ' > ' + form.coinTo }}
                                    </template>
                                    <template v-else>Reserves</template>
                                </div>
                                <div class="form-field__label">Swap type</div>
                            </div>
                        </div>
                        <div class="u-cell">
                            <div class="form-field form-field--dashed">
                                <div class="form-field__input is-not-empty">
                                    <BaseAmount :coin="fee.coinSymbol" :amount="fee.value" :base-coin-amount="fee.baseCoinValue"/>
                                    <span class="u-display-ib" v-if="fee.priceCoin.id > 0">({{ pretty(fee.priceCoinValue) }} {{ fee.priceCoin.symbol }})</span>
                                </div>
                                <span class="form-field__label">Transaction fee</span>
                            </div>
                            <div class="u-mt-10 u-fw-700" v-if="fee.isHighFee"><span class="u-emoji">⚠️</span> Transaction requires high fee.</div>
                        </div>
                    </div>
                </div>

                <button class="button button--main button--full u-mt-10" type="button" data-focus-on-open
                        :class="{'is-loading': isFormSending}"
                        @click="submit()"
                >
                    <span class="button__content">Confirm</span>
                    <BaseLoader class="button__loader" :isLoading="true"/>
                </button>
                <button class="button button--ghost-main button--full u-mt-10" type="button" v-if="!isFormSending" @click="isConfirmModalVisible = false">
                    Cancel
                </button>
            </div>
        </Modal>

        <!-- success modal -->
        <Modal :isOpen.sync="isSuccessModalVisible" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Success</h3>
                <div class="modal__content u-mb-10">
                    <p>Coins successfully exchanged!</p>
                </div>
                <div class="modal__footer">
                    <a class="button button--main button--full" :href="getExplorerTxUrl(serverSuccess.hash)" target="_blank" v-if="serverSuccess">
                        {{ $td('View transaction', 'form.success-view-button') }}
                    </a>
                    <button class="button button--ghost-main button--full" type="button" @click="isSuccessModalVisible = false">
                        {{ $td('Close', 'form.success-close-button') }}
                    </button>
                </div>
            </div>
        </Modal>
    </div>
</template>
