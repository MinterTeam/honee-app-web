<script>
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
    import {getErrorText} from "~/assets/server-error";
    import {pretty, prettyExact, prettyPrecise, decreasePrecisionSignificant, getExplorerTxUrl} from '~/assets/utils.js';
    import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
    import useFee from '~/composables/use-fee.js';
    import BaseAmountEstimation from '@/components/base/BaseAmountEstimation.vue';
    import BaseLoader from '@/components/base/BaseLoader.vue';
    import Modal from '@/components/base/Modal.vue';
    import FieldCombined from '~/components/base/FieldCombined.vue';

    const isValidAmount = withParams({type: 'validAmount'}, (value) => {
        return parseFloat(value) >= 0;
    });

    export default {
        ESTIMATE_SWAP_TYPE,
        components: {
            BaseAmountEstimation,
            BaseLoader,
            Modal,
            FieldCombined,
        },
        mixins: [validationMixin],
        directives: {
        },
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
                    coinFrom: this.params.coinToSell?.toUpperCase() || firstBalanceSymbol,
                    coinTo: this.params.coinToBuy?.toUpperCase() || '',
                    sellAmount: this.params.valueToSell || '',
                    buyAmount: this.params.valueToBuy || '',
                },
                isSelling: true,
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
                        maxValueAfterFee: this.isSelling ? maxValue(this.maxAmountAfterFee || 0) : () => true,
                        maxValue: this.isSelling ? maxValue(this.maxAmount || 0) : () => true,
                    },
                    buyAmount: {
                        required: !this.isSelling ? required : () => true,
                        validAmount: !this.isSelling ? (value) => value > 0 : () => true,
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
                    Object.assign(this.feeProps, newVal);
                },
                deep: true,
                immediate: true,
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
            maxAmount() {
                const selectedCoin = this.$store.state.balance.find((coin) => {
                    return coin.coin.symbol === this.form.coinFrom;
                });
                // coin not selected
                if (!selectedCoin) {
                    return 0;
                }
                return selectedCoin.amount;
            },
            maxAmountAfterFee() {
                const selectedCoin = this.$store.state.balance.find((coin) => {
                    return coin.coin.symbol === this.form.coinFrom;
                });
                // coin not selected
                if (!selectedCoin) {
                    return 0;
                }
                return getAvailableSelectedBalance(selectedCoin, this.fee);
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
                const isEstimationServerErrorVisible = this.estimationError && !this.isEstimationWaiting;

                // show only if form fields are valid
                return !this.$v.form.$invalid && (isEstimationServerErrorVisible || this.$v.minimumValueToBuy.$error || this.$v.maximumValueToSell.$error);
            },
        },
        created() {
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
                    this.debouncedGetEstimation.flush();
                }
            },
            watchForm() {
                if (this.$v.form.$invalid) {
                    return;
                }
                this.debouncedGetEstimation();
                this.isEstimationPending = true;
            },
            forceEstimation() {
                // force new estimation without delay
                this.debouncedGetEstimation();
                return this.debouncedGetEstimation.flush();
            },
            getEstimation() {
                this.isEstimationPending = false;
                if (this.$v.form.$invalid) {
                    return;
                }
                this.isEstimationLoading = true;
                this.estimationError = false;

                let estimatePromise;
                if (this.isSelling) {
                    estimatePromise = estimateCoinSell({
                        coinToSell: this.form.coinFrom,
                        valueToSell: this.form.sellAmount,
                        coinToBuy: this.form.coinTo,
                        findRoute: true,
                        // gasCoin: this.fee.coin || 0,
                    }, {
                        idPreventConcurrency: 'swapForm',
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
                        idPreventConcurrency: 'swapForm',
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
                        this.estimationType = result.swap_from;
                        this.estimationRoute = result.route;
                        this.isEstimationLoading = false;
                    })
                    .catch((error) => {
                        if (error.isCanceled) {
                            return;
                        }
                        this.isEstimationLoading = false;
                        this.estimationError = getErrorText(error, this.$td('Estimation error', 'form.estimation-error') + ': ');
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
                if (this.estimationError) {
                    this.forceEstimation();
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
                {{ $t(action.langKey + '-combined', {
                    coin0: params.coinToSell ? params.coinToSell.toUpperCase() : $td('coins', action.langKey + '-coin0-empty'),
                    conjunction: params.coinToBuy ? $td('for', action.langKey + '-conjunction') : undefined,
                    coin1: params.coinToBuy ? params.coinToBuy.toUpperCase() : undefined,
                }) }}
                <!--
                {{ $td('Buy', 'index.swap') }}
                <template v-if="params.coinToSell">{{ params.coinToSell.toUpperCase() }}</template>
                <template v-if="params.coinToBuy && !params.coinToSell">{{ $td('coins', 'form.coins-2') }}</template>
                <template v-if="params.coinToBuy">for {{ params.coinToBuy.toUpperCase() }}</template>
                -->
            </h1>
            <div class="form-row">
                <FieldCombined
                    v-if="!params.coinToSell"
                    :coin.sync="form.coinFrom"
                    :$coin="$v.form.coinFrom"
                    :coinList="$store.state.balance"
                    :amount.sync="form.sellAmount"
                    :$amount="$v.form.sellAmount"
                    :useBalanceForMaxValue="true"
                    :fee="fee"
                    :isUseMax.sync="isUseMax"
                    :label="$td('You pay', 'form.swap-sell-coin')"
                    @input-native="isSelling = true"
                    @use-max="isSelling = true"
                    @blur="inputBlur()"
                />
                <span class="form-field__error" v-if="$v.form.coinFrom.$dirty && !$v.form.coinFrom.required">{{ $td('Enter coin', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</span>
                <span class="form-field__error" v-else-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.maxValue">{{ $td('Not enough coins', 'form.not-enough-coins') }}</span>
                <span class="form-field__error" v-else-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.maxValueAfterFee">{{ $td('Not enough to pay transaction fee', 'form.fee-error-insufficient') }}: {{ pretty(fee.value) }} {{ fee.coinSymbol}}</span>
            </div>

            <button class="form-row button button--white convert__reverse-button" type="button" @click="reverseCoins()" v-if="!params.coinToSell && !params.coinToBuy">
                <img class="" src="/img/icon-reverse.svg" width="24" height="24" alt="⇅">
            </button>

            <div class="form-row" v-if="!params.coinToBuy">
                <FieldCombined
                    class="u-mb-10"
                    :coin.sync="form.coinTo"
                    :$coin="$v.form.coinTo"
                    :amount.sync="form.buyAmount"
                    :$amount="$v.form.buyAmount"
                    :label="$td('You receive', 'form.swap-buy-coin')"
                    @input-native="isSelling = false"
                    @blur="inputBlur()"
                />

                <span class="form-field__error" v-if="$v.form.coinTo.$dirty && !$v.form.coinTo.required">{{ $td('Enter coin', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-if="$v.form.buyAmount.$dirty && !$v.form.buyAmount.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.buyAmount.$dirty && !$v.form.buyAmount.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</span>
            </div>

            <div class="estimation form-row form__error u-hidden-empty" v-if="isEstimationErrorVisible">
                <template v-if="($v.minimumValueToBuy.$dirty && !$v.minimumValueToBuy.required) || ($v.maximumValueToSell.$dirty && !$v.maximumValueToSell.required)">
                    {{ $td('Estimation error', 'form.estimation-error') }}: {{ $td('Can’t calculate swap limits', 'form.estimation-error-limit-required') }}
                </template>
                <template v-else-if="($v.minimumValueToBuy.$dirty && !$v.minimumValueToBuy.maxValue) || ($v.maximumValueToSell.$dirty && !$v.maximumValueToSell.minValue)">
                    {{ $td('Estimation error', 'form.estimation-error') }}: {{ $td('Invalid swap limit', 'form.estimation-error-limit-invalid') }}
                </template>
                <template v-else>
                    {{ estimationError }}
                </template>
            </div>

            <div class="estimation form-row" v-else-if="params.coinToSell || params.coinToBuy">
                <template v-if="params.coinToSell">
                    <h3 class="estimation__title">{{ $td('You spend approximately', 'form.swap-confirm-spend-estimation') }}</h3>
                    <div class="estimation__item">
                        <div class="estimation__coin">
                            <img class="estimation__coin-icon" :src="$store.getters['explorer/getCoinIcon'](form.coinFrom)" width="20" height="20" alt="" role="presentation">
                            <div class="estimation__coin-symbol">{{ form.coinFrom }}</div>
                        </div>
                        <div class="estimation__value">≈{{ pretty(form.sellAmount || 0) }}</div>
                    </div>
                </template>
                <template v-if="params.coinToBuy">
                    <h3 class="estimation__title">{{ $td('You get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                    <div class="estimation__item">
                        <div class="estimation__coin">
                            <img class="estimation__coin-icon" :src="$store.getters['explorer/getCoinIcon'](form.coinTo)" width="20" height="20" alt="" role="presentation">
                            <div class="estimation__coin-symbol">{{ form.coinTo }}</div>
                        </div>
                        <div class="estimation__value">≈{{ pretty(form.buyAmount || 0) }}</div>
                    </div>
                </template>
            </div>

            <p class="form-row u-text-center u-text-muted u-text-small">{{ $td('The final amount depends on&nbsp;the&nbsp;exchange rate at&nbsp;the&nbsp;moment of&nbsp;transaction.', 'form.swap-confirm-note') }}</p>

            <div class="form-row">
                <button class="button button--main button--full" :class="{'is-loading': isFormSending || isEstimationWaiting, 'is-disabled': $v.$invalid}">
                    <span class="button__content">{{ $td('Buy', 'index.swap') }}</span>
                    <BaseLoader class="button__loader" :isLoading="true"/>
                </button>
                <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
            </div>

            <p class="form-row u-text-center u-text-muted u-text-small">{{ $td('By clicking this button, you confirm that you’ve read and understood the disclaimer in the footer.', 'form.read-understood') }}</p>
        </form>

        <!-- Confirm Modal -->
        <Modal v-bind:isOpen.sync="isConfirmModalVisible">
            <h2 class="u-h3 u-mb-10">
                {{ $td('Confirm swap', 'form.swap-confirm') }}
            </h2>
            <div class="estimation form-row">
                <template v-if="isSelling">
                    <h3 class="estimation__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                    <BaseAmountEstimation :coin="form.coinFrom" :amount="form.sellAmount" format="exact"/>

                    <h3 class="estimation__title">{{ $td('You will get approximately', 'form.swap-confirm-receive-estimation') }} *</h3>
                    <BaseAmountEstimation :coin="form.coinTo" :amount="form.buyAmount" format="approx"/>
                    <!--
                    <span class="u-text-muted u-display-ib">(min: {{ prettyExact(txData.minimumValueToBuy) }})</span>
                    -->
                </template>
                <template v-else>
                    <h3 class="estimation__title">{{ $td('You will pay approximately', 'form.swap-confirm-pay-estimation') }} *</h3>
                    <BaseAmountEstimation :coin="form.coinFrom" :amount="form.sellAmount" format="approx"/>
                    <!--
                    <span class="u-text-muted u-display-ib">(max: {{ prettyExact(txData.maximumValueToSell) }})</span>
                    -->

                    <h3 class="estimation__title">{{ $td('You will get', 'form.you-will-get') }}</h3>
                    <BaseAmountEstimation :coin="form.coinTo" :amount="form.buyAmount" format="exact"/>
                </template>

                <!--
                <h3 class="estimation__title">{{ $td('Rate of', 'form.rate') }} {{ form.coinFrom }}</h3>
                <BaseAmountEstimation :coin="form.coinTo" :amount="form.buyAmount / form.sellAmount"/>

                <h3 class="estimation__title">{{ $td('Rate of', 'form.rate') }} {{ form.coinTo }}</h3>
                <BaseAmountEstimation :coin="form.coinFrom" :amount="form.sellAmount / form.buyAmount"/>

                <h3 class="estimation__title">{{ $td('Swap type', 'form.swap-type') }}</h3>
                <div class="estimation__item">
                    <template v-if="isPool">
                        Pools:
                        {{ estimationRoute ? estimationRoute.map((coin) => coin.symbol).join(' > ') : form.coinFrom + ' > ' + form.coinTo }}
                    </template>
                    <template v-else>{{ $td('Reserves', 'form.reserves') }}</template>
                </div>

                <h3 class="estimation__title">{{ $td('Transaction fee', 'form.tx-fee') }}</h3>
                <BaseAmountEstimation :coin="fee.coinSymbol" :amount="fee.value" :exact="true"/>

                <div class="u-mt-10 u-fw-700" v-if="fee.isHighFee"><span class="u-emoji">⚠️</span> {{ $td('Transaction requires high fee.', 'form.tx-fee-high') }}</div>
                -->
            </div>

            <div class="form-row u-text-muted u-text-small u-text-center">
                * {{ $td('The final amount depends on&nbsp;the&nbsp;exchange rate at&nbsp;the&nbsp;moment of&nbsp;transaction.', 'form.swap-confirm-note') }}
            </div>

            <button class="button button--main button--full form-row" type="button" data-focus-on-open
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
        <Modal :isOpen.sync="isSuccessModalVisible">
            <h2 class="u-h3 u-mb-10">{{ $td('Success', 'form.success-title') }}</h2>
            <p class="u-mb-10">{{ $td('Coins successfully exchanged!', 'form.success-desc') }}</p>

            <a class="button button--main button--full" :href="getExplorerTxUrl(serverSuccess.hash)" target="_blank" v-if="serverSuccess">
                {{ $td('View transaction', 'form.success-view-button') }}
            </a>
            <button class="button button--ghost-main button--full" type="button" @click="isSuccessModalVisible = false">
                {{ $td('Close', 'form.success-close-button') }}
            </button>
        </Modal>
    </div>
</template>
