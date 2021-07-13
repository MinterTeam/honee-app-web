<script>
    import axios from 'axios';
    import {IMaskDirective} from 'vue-imask';
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import minLength from 'vuelidate/lib/validators/minLength';
    import maxLength from 'vuelidate/lib/validators/maxLength';
    import maxValue from 'vuelidate/lib/validators/maxValue';
    import withParams from 'vuelidate/lib/withParams';
    import decode from 'entity-decode';
    import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
    import {ESTIMATE_SWAP_TYPE} from 'minter-js-sdk/src/variables.js';
    import {postTx, estimateCoinSell} from '~/api/gate.js';
    import FeeBus from '~/assets/fee';
    import {getErrorText} from "~/assets/server-error";
    import {pretty, decreasePrecisionSignificant} from '~/assets/utils.js';
    import FieldCoinList from '~/components/FieldCoinList';

    const isValidAmount = withParams({type: 'validAmount'}, (value) => {
        return parseFloat(value) >= 0;
    });

    let feeBus;

    let estimationCancel;

    export default {
        ESTIMATE_SWAP_TYPE,
        components: {
            FieldCoinList,
        },
        mixins: [validationMixin],
        directives: {
            imask: IMaskDirective,
        },
        filters: {
            pretty,
        },

        data() {
            const coinList = this.$store.state.balance;
            return {
                isFormSending: false,
                serverError: '',
                form: {
                    coinFrom: coinList && coinList.length ? coinList[0].coin.symbol : '',
                    coinTo: '',
                    sellAmount: '',
                },
                amountImaskOptions: {
                    mask: Number,
                    scale: 18, // digits after point, 0 for integers
                    signed: false,  // disallow negative
                    thousandsSeparator: '',  // any single char
                    padFractionalZeros: false,  // if true, then pads zeros at end to the length of scale
                    normalizeZeros: false, // appends or removes zeros at ends
                    radix: '.',  // fractional delimiter
                    mapToRadix: [','],  // symbols to process as radix
                },
                // amountMasked: '',
                /** @type FeeData */
                fee: {},
                estimation: null,
                estimationType: null,
                estimationRoute: null,
                estimationTimer: null,
                estimationLoading: false,
                estimationError: false,
                isUseMax: false, // should sellAllTx be used
            };
        },
        validations() {
            return {
                form: {
                    coinFrom: {
                        required,
                    },
                    coinTo: {
                        required,
                        minLength: minLength(3),
                        // maxLength: maxLength(10),
                    },
                    sellAmount: {
                        required,
                        validAmount: isValidAmount,
                        maxValue: maxValue(this.maxAmount || 0),
                    },
                },
                minimumValueToBuy: {
                    required: (value) => value > 0,
                    maxValue: (value) => Number(value) <= Number(this.currentEstimation),
                },
            };
        },
        watch: {
            'form.coinFrom': function(newVal, oldVal) {
                if (this.isUseMax && newVal !== oldVal) {
                    this.useMax();
                }
            },
            // every valid form change will lead to estimationTimer set up
            form: {
                handler() {
                    if (this.$v.form.$invalid) {
                        return;
                    }
                    clearTimeout(this.estimationTimer);
                    this.estimationTimer = setTimeout(this.getEstimation, 1000);
                },
                deep: true,
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
                if (!this.isUseMax) {
                    return false;
                }
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
            txType() {
                if (this.estimationType === ESTIMATE_SWAP_TYPE.POOL) {
                    return this.isSellAll ? TX_TYPE.SELL_ALL_SWAP_POOL : TX_TYPE.SELL_SWAP_POOL;
                }
                return this.isSellAll ? TX_TYPE.SELL_ALL : TX_TYPE.SELL;
            },
            txData() {
                return {
                    ...(!this.isPool ? {
                        coinToSell: this.form.coinFrom,
                        coinToBuy: this.form.coinTo,
                    } : {
                        coins: this.estimationRoute
                            ? this.estimationRoute.map((coin) => coin.id)
                            : [this.form.coinFrom, this.form.coinTo],
                    }),
                    valueToSell: this.form.sellAmount,
                    minimumValueToBuy: this.minimumValueToBuy,
                };
            },
            maxAmount() {
                // fee not subtracted
                const selectedCoin = this.$store.state.balance.find((coin) => {
                    return coin.coin.symbol === this.form.coinFrom;
                });
                return selectedCoin ? selectedCoin.amount : 0;
            },
            minimumValueToBuy() {
                let slippage = 1 - 5 / 100; // 5%
                slippage = Math.max(slippage, 0);
                return decreasePrecisionSignificant(this.currentEstimation * slippage);
            },
            feeBusParams() {
                return {
                    txParams: {
                        // don't use `this.txType`, it may lead to infinite loop, assume sell and sell-all txs consume equal fees
                        type: this.isPool ? TX_TYPE.SELL_SWAP_POOL : TX_TYPE.SELL,
                        data: {
                            // pass only fields that affect fee
                            coinToSell: this.txData.coinToSell,
                            coins: this.txData.coins,
                        },
                    },
                    baseCoinAmount: this.$store.getters.baseCoin && this.$store.getters.baseCoin.amount,
                    fallbackToCoinToSpend: true,
                };
            },
            currentEstimation() {
                if (this.$v.form.$invalid || !this.estimation || this.isEstimationWaiting || this.estimationError) {
                    return 0;
                }

                return this.estimation;
            },
            isEstimationWaiting() {
                return this.estimationTimer || this.estimationLoading;
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
        },
        methods: {
            // force estimation after blur if needed
            inputBlur() {
                // if estimation was postponed
                if (this.estimationTimer) {
                    clearTimeout(this.estimationTimer);
                    this.getEstimation();
                }
            },
            clearEstimationTimer() {
                clearTimeout(this.estimationTimer);
                this.estimationTimer = null;
            },
            getEstimation() {
                //@TODO cancel
                if (this.estimationLoading && typeof estimationCancel === 'function') {
                    // cancel previous request
                    estimationCancel();
                }
                this.estimationTimer = null;
                if (this.form.coinFrom && this.form.coinFrom === this.form.coinTo) {
                    this.estimationError = decode('Estimation error: you have to select different&nbsp;coins');
                    return;
                }
                this.estimationLoading = true;
                this.estimationError = false;
                estimateCoinSell({
                    coinToSell: this.form.coinFrom,
                    valueToSell: this.form.sellAmount,
                    coinToBuy: this.form.coinTo,
                    findRoute: true,
                    gasCoin: this.fee.coin || 0,
                }, { cancelToken: new axios.CancelToken((cancelFn) => estimationCancel = cancelFn) })
                    .then((result) => {
                        this.estimation = result.will_get;
                        this.estimationType = result.swap_from;
                        this.estimationRoute = result.route;
                        this.estimationLoading = false;
                    })
                    .catch((error) => {
                        console.log(error);
                        this.estimationLoading = false;
                        this.estimationError = getErrorText(error, 'Estimation error: ');
                    });
            },
            onAcceptAmount(e) {
                // this.amountMasked = e.detail._value;
                this.form.sellAmount = e.detail._unmaskedValue;
                // use sellTx if value typed by user manually
                this.isUseMax = false;
            },
            submit() {
                if (this.isFormSending || this.isEstimationWaiting || this.fee.isLoading) {
                    return;
                }

                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }

                this.isFormSending = true;
                this.serverError = '';
                postTx({
                    type: this.txType,
                    data: this.txData,
                    gasCoin: this.fee.coin,
                }, {privateKey: this.$store.getters.privateKey})
                    .then((tx) => {
                        this.$emit('success-tx', tx);
                        this.isFormSending = false;
                        this.clearForm();
                    })
                    .catch((error) => {
                        console.log(error);
                        this.isFormSending = false;
                        this.serverError = getErrorText(error);
                    });
            },
            // do we have enough coins to pay fee use sellAll tx
            getAbleUseSellAll() {
                if (!this.isUseMax) {
                    return Promise.resolve(false);
                }
                // selling base coin (no matter if it is not enough to pay fee)
                if (this.form.coinFrom === this.$store.getters.COIN_NAME) {
                    return Promise.resolve(true);
                }
                // base coin is not enough (no matter if selected coin is not enough to pay fee)
                if (!this.fee.isBaseCoinEnough) {
                    return Promise.resolve(true);
                }
                // selling custom coin and base coin is enough to pay fee, here we should decide if we can pay fee with custom coin using sellAllTx, or should we switch to sellTx and pay fee with base coin

                // if getting base coin, we can use `estimation`
                if (this.form.coinTo === this.$store.getters.COIN_NAME) {
                    return Promise.resolve(this.estimation >= this.fee.baseCoinValue);
                }

                return estimateCoinSell({
                    coinToSell: this.form.coinFrom,
                    valueToSell: this.maxAmount,
                    coinToBuy: this.$store.getters.COIN_NAME,
                })
                    .then((result) => {
                        return result.will_get >= this.fee.baseCoinValue;
                    })
                    .catch((error) => {
                        return true;
                    });
            },
            //@TODO exclude fee from amount
            useMax() {
                this.form.sellAmount = this.maxAmount;
                // this.amountMasked = this.maxAmount;
                // update maskRef state
                this.$refs.amountInput.maskRef.typedValue = this.maxAmount;
                const cursorPos = this.maxAmount.toString().length;
                this.$refs.amountInput.maskRef._selection = {start: cursorPos, end: cursorPos};
                // use sellAllTx if "Use max" button pressed
                this.isUseMax = true;
            },
            clearForm() {
                this.form.coinFrom = this.$store.state.balance && this.$store.state.balance.length ? this.$store.state.balance[0].coin.symbol : '';
                this.form.coinTo = '';
                this.form.sellAmount = '';
                // this.amountMasked = '';
                this.$refs.amountInput.maskRef.typedValue = '';
                this.$v.$reset();
            },
        },
    };
</script>

<template>
    <form novalidate @submit.prevent="submit">
        <div class="u-section u-container">
            <label class="bip-field bip-field--row bip-field--select" :class="{'is-error': $v.form.coinFrom.$error}">
                <span class="bip-field__label">Coin you have</span>
                <select class="bip-field__input"
                        v-model="form.coinFrom"
                        @blur="$v.form.coinFrom.$touch(); inputBlur()"
                >
                    <option v-for="coin in $store.state.balance" :key="coin.coin.id" :value="coin.coin.symbol">{{ coin.coin.symbol }} ({{ coin.amount | pretty }})</option>
                </select>
                <span class="bip-field__error" v-if="$v.form.coinFrom.$dirty && !$v.form.coinFrom.required">Enter coin</span>
            </label>
            <label class="bip-field bip-field--row bip-field--with-max" :class="{'is-error': $v.form.sellAmount.$error}">
                <span class="bip-field__label">Amount</span>
                <input class="bip-field__input" type="text" inputmode="decimal" ref="amountInput"
                       v-imask="amountImaskOptions"
                       @accept="onAcceptAmount"
                       @blur="$v.form.sellAmount.$touch(); inputBlur()"
                >
                <button class="bip-field__button bip-link u-semantic-button" type="button" @click="useMax">Use max</button>
                <span class="bip-field__error" v-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.required">Enter amount</span>
                <span class="bip-field__error" v-else-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.validAmount">Wrong amount</span>
                <span class="bip-field__error" v-else-if="$v.form.sellAmount.$dirty && !$v.form.sellAmount.maxAmount">Not enough coins</span>
            </label>
        </div>
        <div class="convert__divider">
            <div class="convert__divider-inner">
                <img class="convert__divider-icon" src="/img/icon-convert-sell.svg" alt="" role="presentation">
            </div>
        </div>

        <div class="u-section u-container">
            <FieldCoinList v-model="form.coinTo" :$value="$v.form.coinTo" @blur="inputBlur()"/>
        </div>

        <div class="u-section--bottom u-container">
            <div class="convert__panel" :class="{'is-loading': isEstimationWaiting}" v-if="!$v.form.$invalid && !isEstimationErrorVisible">
                <div class="convert__panel-content">
                    You will get approximately
                    <p class="convert__panel-amount">{{ $options.filters.pretty(estimation || 0) }} {{ form.coinTo }}</p>
                </div>
                <div class="convert__panel-content">
                    Swap from
                    <p class="convert__panel-value">{{ estimationType === $options.ESTIMATE_SWAP_TYPE.POOL ? 'Pools' : 'Reserves' }}</p>
                </div>
                <div class="convert__panel-content" v-if="estimationRoute">
                    Swap route
                    <p class="convert__panel-value">{{ estimationRoute.map((coin) => coin.symbol).join(' > ') }}</p>
                </div>
                <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                    <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                </svg>
            </div>
            <div class="convert__panel u-text-error" v-if="!$v.form.$invalid && isEstimationErrorVisible">{{ estimationError }}</div>
            <div class="convert__panel u-text-error" v-else-if="$v.minimumValueToBuy.$dirty && !$v.minimumValueToBuy.required">Can't calculate swap limits</div>
            <div class="convert__panel u-text-error" v-else-if="$v.minimumValueToBuy.$dirty && !$v.minimumValueToBuy.minValue">Invalid swap limit</div>
            <p class="convert__panel-note">The final amount depends on&nbsp;the&nbsp;exchange rate at&nbsp;the&nbsp;moment of&nbsp;transaction.</p>
        </div>

        <div class="list">
            <a class="list-item">
                <div class="list-item__center">
                    <span class="list-item__name u-text-nowrap">Transaction fee</span>
                </div>
                <div class="list-item__right list-item__right--with-loader u-text-right" :class="{'is-loading': fee.isLoading}">
                    <div class="list-item__label list-item__label--strong">
                        {{ fee.coin }} {{ fee.value | pretty }}
                        <span class="u-display-ib" v-if="!fee.isBaseCoin">({{ $store.getters.COIN_NAME }} {{ fee.baseCoinValue | pretty }})</span>
                    </div>
                    <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                    </svg>
                </div>
            </a>
        </div>

        <div class="u-section u-container">
            <button class="bip-button bip-button--main" :class="{'is-loading': isFormSending, 'is-disabled': $v.$invalid}">
                <span class="bip-button__content">Exchange</span>
                <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                    <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                </svg>
            </button>
            <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
        </div>
    </form>
</template>
