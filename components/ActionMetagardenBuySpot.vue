<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import autosize from 'v-autosize';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import checkEmpty from '~/assets/v-check-empty.js';
import {pretty, getDateAmerican, getTimeDistance} from '~/assets/utils.js';
import {SPOT_DATA} from '~/assets/variables.js';
import {prepareSpendMaxOrAfterSwap} from '~/assets/utils/sequence.js';
import SwapEstimation from '~/components/base/SwapEstimation.vue';
import TxSequenceWithSwapForm from '~/components/base/TxSequenceWithSwapForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import InputMaskedAmount from '~/components/base/InputMaskedAmount.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';

const METAGARDEN_SYMBOL = 'METAGARDEN';
const USD_SYMBOL = 'USDTBSC';
const MODE = {
    // send metagarden directly (if it is enough)
    SEND_METAGARDEN: 'send_metagarden',
    // send usdt directly (if it is selected and enough)
    SEND_USD: 'send_usd',
    // buy metagarden in pool and send (if price < $0.04)
    BUY_METAGARDEN: 'buy_metagarden',
    // buy USDT and send (if metagarden price > $0.04)
    BUY_USD: 'buy_usd',
};
export const SPOT_PRICE_METAGARDEN = 1000;

export default {
    TX_TYPE,
    METAGARDEN_SYMBOL,
    USD_SYMBOL,
    components: {
        // SwapEstimation,
        TxSequenceWithSwapForm,
        BaseAmountEstimation,
        InputMaskedAmount,
        FieldCombined,
    },
    directives: {
        checkEmpty,
        autosize,
    },
    mixins: [validationMixin],
    emits: [
        'success',
        'success-modal-close',
        'override-stats-value',
    ],
    props: {
        type: {
            /** @type {PropType<keyof SPOT_DATA>} */
            type: String,
            required: true,
        },
        action: {
            type: Object,
        },
        params: {
            type: Object,
            default: () => ({}),
        },
    },
    fetch() {

    },
    data() {
        const metagardenBalance = this.$store.getters.getBalanceAmount(METAGARDEN_SYMBOL);
        const availableSpots = Math.floor(metagardenBalance / SPOT_PRICE_METAGARDEN);

        return {
            form: {
                // coin to spend
                coin: '',
                // spot amount to buy if direction BUY
                spotAmount: undefined,
                // spend from balance if direction SELL
                spendAmount: undefined,
                // coin: availableSpots > 0 ? METAGARDEN_SYMBOL : '',
                // spotAmount: availableSpots || 1,
            },
            isUseMax: false,
            estimation: 0,
            estimationSpendForMetagarden: 0,
            estimationSpendForUsd: 0,
            estimationFetchState: null,
            estimationFetchStateMetagarden: null,
            estimationFetchStateUsd: null,
        };
    },
    //@TODO check both txs fees (maybe with extra, because first tx may affect cost of second tx and second may fail)
    validations() {
        const form = {
            coin: {
                required,
                minLength: minLength(3),
            },
        };

        return {
            form,
            spendAmount: {
                minValue: (value) => value > 0,
                maxValue: (value) => maxValue(this.selectedBalance)(value),
            },
            spotAmount: {
                required,
                minValue: minValue(this.spotData.minAmount),
            },
            estimation: {
                finished: (value) => !this.isEstimationLoading,
            },
            sendAmount: {
                required: (value) => value > 0,
            },
        };
    },
    computed: {
        spotData() {
            return SPOT_DATA[this.type];
        },
        isDirectionBuy() {
            return this.type === 'FARMER';
        },
        currentMode() {
            // 0.04 price check is made by comparing estimation (which is made based on 1000 and 40 prices)
            // const isMetagardenCheaper = this.estimationSpendForUsd <= 0 || Number(this.estimationSpendForMetagarden) <= Number(this.estimationSpendForUsd);
            if (this.form.coin === METAGARDEN_SYMBOL) {
                if (this.type === 'FARMER') {
                    return MODE.BUY_USD;
                }
                return MODE.SEND_METAGARDEN;
            } else if (this.form.coin === USD_SYMBOL) {
                return MODE.SEND_USD;
            // disable BUY_METAGARDEN mode
            // } else if (isMetagardenCheaper) {
            //     return MODE.BUY_METAGARDEN;
            } else {
                return MODE.BUY_USD;
            }
        },
        isModeSwap() {
            return this.currentMode === MODE.BUY_METAGARDEN || this.currentMode === MODE.BUY_USD;
        },
        // coin in 'SEND' tx
        sendTokenSymbol() {
            if (this.currentMode === MODE.SEND_METAGARDEN || this.currentMode === MODE.BUY_METAGARDEN) {
                return METAGARDEN_SYMBOL;
            } else {
                return USD_SYMBOL;
            }
        },
        // value in 'SEND' tx
        sendAmountDirectionBuy() {
            if (this.currentMode === MODE.SEND_METAGARDEN || this.currentMode === MODE.BUY_METAGARDEN) {
                return this.spotsPriceMetagarden;
            } else {
                return this.spotsPriceUsd;
            }
        },
        sendAmountDirectionSell() {
            if (this.isModeSwap) {
                return this.estimation;
            } else {
                return this.form.spendAmount;
            }
        },
        sendAmount() {
            return this.isDirectionBuy ? this.sendAmountDirectionBuy : this.sendAmountDirectionSell;
        },
        // spend from balance
        spendAmountDirectionBuy() {
            if (this.isModeSwap) {
                return this.estimation;
            } else {
                return this.sendAmountDirectionBuy;
            }
        },
        spendAmount() {
            return this.isDirectionBuy ? this.spendAmountDirectionBuy : this.form.spendAmount;
        },
        // receive spots in direction SELL
        spotAmountDirectionSell() {
            if (this.currentMode === MODE.SEND_METAGARDEN || this.currentMode === MODE.BUY_METAGARDEN) {
                return this.sendAmount / SPOT_PRICE_METAGARDEN;
            } else {
                return this.sendAmount / this.spotData.priceUsd;
            }
        },
        spotAmount() {
            return this.isDirectionBuy ? this.form.spotAmount : this.spotAmountDirectionSell;
        },
        spotsPriceMetagarden() {
            return this.form.spotAmount * SPOT_PRICE_METAGARDEN;
        },
        spotsPriceUsd() {
            return this.form.spotAmount * this.spotData.priceUsd;
        },
        selectedBalance() {
            return this.$store.getters.getBalanceAmount(this.form.coin);
        },
        // metagardenBalance() {
        //     return this.$store.getters.getBalanceAmount(METAGARDEN_SYMBOL);
        // },
        // available to buy by direct send
        // availableSpotsDirect() {
        //     return Math.floor(this.metagardenBalance / SPOT_PRICE_METAGARDEN);
        // },
        isEstimationLoading() {
            return this.estimationFetchState?.loading || this.estimationFetchStateMetagarden?.loading || this.estimationFetchStateUsd?.loading;
        },


        sequenceParams() {
            const prepare = prepareSpendMaxOrAfterSwap(this.isUseMax, this.isModeSwap, () => this.$store.getters.getBalanceItem(this.form.coin));

            const sendTxParams = {
                data: {
                    value: this.sendAmount,
                    coin: this.sendTokenSymbol,
                    to: this.spotData.buyAddress,
                },
                type: TX_TYPE.SEND,
            };

            return {
                // refineFee is not needed if no 'prepare'
                prepareGasCoinPosition: prepare ? 'start' : 'skip',
                prepare,
                txParams: sendTxParams,
                feeTxParams: {
                    ...sendTxParams,
                    data: {
                        ...sendTxParams.data,
                        value: 0,
                    },
                },
            };
        },
    },
    watch: {
        'form.spotAmount': {
            handler() {
                if (!this.isDirectionBuy) {
                    return;
                }
                if (!(this.form.spotAmount > 0)) {
                    this.estimation = 0;
                }
            },
        },
        'form.spendAmount': {
            handler() {
                if (this.isDirectionBuy) {
                    return;
                }
                if (!(this.form.spendAmount > 0)) {
                    this.estimation = 0;
                }
            },
        },
    },
    methods: {
        pretty,
        checkNeedSwapEqual(coinSymbol) {
            return this.form.coin !== coinSymbol;
        },
        getDate(value) {
            return getDateAmerican(value, {locale: this.$i18n.locale});
        },
        getTimeDistance(value) {
            return getTimeDistance(value, true, {
                roundingMethod: 'round',
                locale: this.$i18n.locale,
            });
        },
        clearForm() {
            // this.form.value = '';
            this.form.coin = '';
            this.form.spotAmount = '';
            this.form.spendAmount = '';
            this.$v.$reset();
        },
    },
};
</script>

<template>
    <div>
        <div class="card__content card__content--medium" v-if="$fetchState.pending">{{ $td('Loading…', 'index.loading') }}</div>
        <TxSequenceWithSwapForm
            class="card__content card__content--medium"
            :coin-to-sell="form.coin"
            :coin-to-buy="sendTokenSymbol"
            :value-to-sell="form.spendAmount"
            :value-to-buy="sendAmountDirectionBuy"
            :is-use-max="isUseMax"
            :sequence-params="sequenceParams"
            :v$sequence-params="$v"
            @update:estimation="estimation = $event"
            @update:fetch-state="estimationFetchState = $event"
            @clear-form="clearForm()"
            @success="$emit('success')"
            @success-modal-close="$emit('success-modal-close')"
        >
            <template v-slot:default="{fee, estimation}">
                <slot name="card-top"/>

                <div class="form-row" v-if="isDirectionBuy">
                    <div class="h-field" :class="{'is-error': $v.spotAmount.$error}">
                        <div class="h-field__content">
                            <div class="h-field__title">{{ $td(`${spotData.plural} amount`, 'metagarden.spot-amount-label', {spotPlural: spotData.pluralRu}) }}</div>
                            <InputMaskedAmount
                                class="h-field__input h-field__input--medium"
                                placeholder="0"
                                :scale="undefined"
                                v-model="form.spotAmount"
                                @blur="$v.spotAmount.$touch()"
                            />
                        </div>
                    </div>
                    <span class="form-field__error" v-if="$v.spotAmount.$dirty && !$v.spotAmount.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.spotAmount.$dirty && !$v.spotAmount.minValue">{{ $td('Minimum', 'form.amount-error-min') }} {{ spotData.minAmount }}</span>
                </div>

                <div class="form-row">
                    <FieldCombined
                        :coin.sync="form.coin"
                        :$coin="$v.form.coin"
                        :coinList="$store.state.balance"
                        :fallbackToFullList="false"
                        :amount="isDirectionBuy ? spendAmountDirectionBuy : form.spendAmount"
                        @update:amount="isDirectionBuy ? undefined : form.spendAmount = $event"
                        :$amount="$v.spendAmount"
                        :useBalanceForMaxValue="true"
                        :fee="fee.resultList[0]"
                        :is-estimation="isDirectionBuy"
                        :isLoading="isDirectionBuy ? isEstimationLoading : false"
                        :label="$td('Coin to spend', 'form.you-spend')"
                        @update:is-use-max="isUseMax = $event"
                    />
                    <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                    <span class="form-field__error" v-else-if="$v.spendAmount.$dirty && !$v.spendAmount.minValue">
                        <template v-if="isDirectionBuy">{{ $td('Can\'t swap', 'form.swap-error') }}</template>
                        <template v-else>{{ $td('Enter amount', 'form.amount-error-required') }}</template>
                    </span>
                    <span class="form-field__error" v-else-if="$v.spendAmount.$dirty && !$v.spendAmount.maxValue">{{ $td('Not enough coin balance', 'form.spots-error-balance') }}</span>
                </div>

                <div class="information form-row" v-if="!isDirectionBuy">
                    <h3 class="information__title">{{ $td('You will buy', 'todo') }}</h3>
                    <BaseAmountEstimation
                        :coin="spotData.plural"
                        :amount="spotAmount || 0"
                        :format="isModeSwap ? 'approx' : undefined"
                        :hide-icon="true"
                        :is-loading="isEstimationLoading"
                    />

                    <div class="u-text-warn u-fw-700 u-text-small u-mt-05 u-text-right" v-if="$v.spotAmount.$error">
                        {{ $td('Minimum', 'form.amount-error-min') }} {{ spotData.minAmount }}
                    </div>
                </div>

                <!--
                <SwapEstimation
                    class="u-text-medium form-row u-hidden"
                    ref="estimationMetagarden"
                    id-prevent-concurrency="swapFormMetagarden"
                    :coin-to-sell="form.coin"
                    :coin-to-buy="isModeSwap ? $options.METAGARDEN_SYMBOL : ''"
                    :value-to-buy="spotsPriceMetagarden"
                    :is-use-max="false"
                    :fee="null"
                    @update:estimation="estimationSpendForMetagarden = $event"
                    @update:fetch-state="estimationFetchStateMetagarden = $event"
                />
                <SwapEstimation
                    class="u-text-medium form-row u-hidden"
                    ref="estimationUsd"
                    id-prevent-concurrency="swapFormUsd"
                    :coin-to-sell="form.coin"
                    :coin-to-buy="isModeSwap ? $options.USD_SYMBOL : ''"
                    :value-to-buy="spotsPriceUsd"
                    :is-use-max="false"
                    :fee="null"
                    @update:estimation="estimationSpendForUsd = $event"
                    @update:fetch-state="estimationFetchStateUsd = $event"
                />
                -->
            </template>

            <template v-slot:submit-title>
                {{ $td('Buy', `form.buy-button`) }}
            </template>

            <template v-slot:confirm-modal-header>
                <h2 class="u-h3 u-mb-10">
                    {{ $td('Confirm purchase', `metagarden.confirm-title`) }}
                </h2>
            </template>

            <template v-slot:confirm-modal-body>
                <div class="information form-row">
                    <h3 class="information__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="spendAmount" :format="isDirectionBuy ? 'approx' : undefined"/>

                    <h3 class="information__title">{{ $td('You will buy', 'todo') }}</h3>
                    <BaseAmountEstimation
                        :coin="spotData.plural"
                        :amount="spotAmount"
                        :format="isModeSwap && isDirectionBuy ? 'approx' : undefined"
                        :hide-icon="true"
                    />
                </div>
            </template>
        </TxSequenceWithSwapForm>

        <div class="card__content card__content--medium">
            <nuxt-link class="button button--full button--ghost-main" :to="$i18nGetPreferredPath('/topup/instant')">
                {{ $td('+ Instant deposit', 'index.topup-instant') }}
            </nuxt-link>
        </div>
    </div>
</template>
