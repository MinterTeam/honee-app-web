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
import {getFarmProgramWithPoolData, getAmountFromPool} from '~/api/farm.js';
import {getBlock} from '~/api/explorer.js';
import SwapEstimation from '~/components/base/SwapEstimation.vue';
import TxSequenceWithSwapForm from '~/components/base/TxSequenceWithSwapForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import InputMaskedAmount from '~/components/base/InputMaskedAmount.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';

const METAGARDEN_SYMBOL = 'METAGARDEN';
const USD_SYMBOL = 'USDTE';
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
const SPOT_PRICE_METAGARDEN = 1000;
const SPOT_PRICE_USD = 40;
const SPOT_BUY_ADDRESS = 'Mxfb758e0516e3ced06eb90387b7fee61ecaad0000';

export default {
    TX_TYPE,
    METAGARDEN_SYMBOL,
    USD_SYMBOL,
    components: {
        SwapEstimation,
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
                coin: availableSpots > 0 ? METAGARDEN_SYMBOL : '',
                spotAmount: availableSpots || 1,
            },
            estimation: 0,
            estimationSpendForMetagarden: 0,
            estimationSpendForUsd: 0,
        };
    },
    //@TODO check both txs fees (maybe with extra, because first tx may affect cost of second tx and second may fail)
    validations() {
        const form = {
            coin: {
                required,
                minLength: minLength(3),
            },
            spotAmount: {
                required,
                minValue: minValue(1),
            },
        };

        return {
            form,
            estimation: {
                minValue: (value) => this.isModeBuy ? value > 0 : true,
                maxValue: (value) => this.isModeBuy ? maxValue(this.selectedBalance)(value) : true,
            },
        };
    },
    computed: {
        currentMode() {
            // 0.04 price check is made by comparing estimation (which is made based on 1000 and 40 prices)
            const isMetagardenCheaper = this.estimationSpendForUsd <= 0 || Number(this.estimationSpendForMetagarden) <= Number(this.estimationSpendForUsd);
            if (this.form.coin === METAGARDEN_SYMBOL) {
                return MODE.SEND_METAGARDEN;
            } else if (this.form.coin === USD_SYMBOL) {
                return MODE.SEND_USD;
            } else if (isMetagardenCheaper) {
                return MODE.BUY_METAGARDEN;
            } else {
                return MODE.BUY_USD;
            }
        },
        isModeBuy() {
            return this.currentMode === MODE.BUY_METAGARDEN || this.currentMode === MODE.BUY_USD;
        },
        sendTokenSymbol() {
            if (this.currentMode === MODE.SEND_METAGARDEN || this.currentMode === MODE.BUY_METAGARDEN) {
                return METAGARDEN_SYMBOL;
            } else {
                return USD_SYMBOL;
            }
        },
        sendAmount() {
            if (this.currentMode === MODE.SEND_METAGARDEN || this.currentMode === MODE.BUY_METAGARDEN) {
                return this.spotsPriceMetagarden;
            } else {
                return this.spotsPriceUsd;
            }
        },
        spendAmount() {
            return this.isModeBuy ? this.estimation : this.spotsPriceMetagarden;
        },
        spotsPriceMetagarden() {
            return this.form.spotAmount * SPOT_PRICE_METAGARDEN;
        },
        spotsPriceUsd() {
            return this.form.spotAmount * SPOT_PRICE_USD;
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


        sequenceParams() {
            const sendTxParams = {
                data: {
                    value: this.sendAmount,
                    coin: this.sendTokenSymbol,
                    to: SPOT_BUY_ADDRESS,
                },
                type: TX_TYPE.SEND,
            };
            return {
                // refineFee is not needed if no 'prepare'
                prepareGasCoinPosition: 'skip',
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
        apr() {
            this.$emit('override-stats-value', pretty(this.apr) + '%');
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
        fetchLatestBlock() {
            return getBlock('latest')
                .then((block) => {
                    this.latestBlockHeight = block.height;
                });
        },
        clearForm() {
            // this.form.value = '';
            this.form.coin = '';
            this.form.spotAmount = '';
            this.$v.$reset();
        },
    },
};
</script>

<template>
    <div>
        <div class="u-mt-15" v-if="$fetchState.pending">{{ $td('Loading…', 'index.loading') }}</div>
        <TxSequenceWithSwapForm
            :coin-to-sell="form.coin"
            :coin-to-buy="sendTokenSymbol"
            :value-to-buy="sendAmount"
            :sequence-params="sequenceParams"
            :v$sequence-params="$v"
            :before-post-sequence="fetchLatestBlock"
            @update:estimation="estimation = $event"
            @clear-form="clearForm()"
            @success="$emit('success')"
            @success-modal-close="$emit('success-modal-close')"
        >
            <template v-slot:default="{fee, estimation}">
                <div class="form-row">
                    <div class="h-field" :class="{'is-error': $v.form.spotAmount.$error}">
                        <div class="h-field__content">
                            <div class="h-field__title">{{ $td('Spots amount', 'metagarden-spot.spot-amount-label') }}</div>
                            <InputMaskedAmount
                                class="h-field__input h-field__input--medium"
                                scale="0"
                                v-model="form.spotAmount"
                                @blur="$v.form.spotAmount.$touch()"
                            />
                        </div>
                    </div>
                    <span class="form-field__error" v-if="$v.form.spotAmount.$dirty && !$v.form.spotAmount.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                </div>

                <div class="form-row">
                    <FieldCombined
                        :coin.sync="form.coin"
                        :$coin="$v.form.coin"
                        :coinList="$store.state.balance"
                        :fallbackToFullList="false"
                        :amount="spendAmount"
                        :is-estimation="true"
                        :isLoading="isEstimationWaiting"
                        :label="$td('Coin to spend', 'form.you-spend')"
                    />
                    <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                    <span class="form-field__error" v-else-if="$v.estimation.$dirty && !$v.estimation.minValue">{{ $td('Can\'t swap', 'form.todo') }}</span>
                    <span class="form-field__error" v-else-if="!$v.estimation.maxValue">{{ $td('Not enough coin balance to buy spots', 'form.todo') }}</span>
                </div>

                <!--<div class="information form-row">-->
                <!--    <template v-if="!isSelectedLockCoin">-->
                <!--        <h3 class="information__title">{{ $td('You will buy and stake approximately', 'stake-by-lock.estimation-buy') }}</h3>-->
                <!--        <BaseAmountEstimation :coin="lockTokenSymbol" :amount="estimation || 0" format="approx"/>-->
                <!--    </template>-->
                <!--</div>-->

                <SwapEstimation
                    class="u-text-medium form-row u-hidden"
                    ref="estimationMetagarden"
                    id-prevent-concurrency="swapFormMetagarden"
                    :coin-to-sell="form.coin"
                    :coin-to-buy="checkNeedSwapEqual($options.METAGARDEN_SYMBOL) ? $options.METAGARDEN_SYMBOL : ''"
                    :value-to-buy="spotsPriceMetagarden"
                    :is-use-max="false"
                    :fee="null"
                    @update:estimation="estimationSpendForMetagarden = $event"
                />
                <SwapEstimation
                    class="u-text-medium form-row u-hidden"
                    ref="estimationUsd"
                    id-prevent-concurrency="swapFormUsd"
                    :coin-to-sell="form.coin"
                    :coin-to-buy="checkNeedSwapEqual($options.USD_SYMBOL) ? $options.USD_SYMBOL : ''"
                    :value-to-buy="spotsPriceUsd"
                    :is-use-max="false"
                    :fee="null"
                    @update:estimation="estimationSpendForUsd = $event"
                />
            </template>

            <template v-slot:submit-title>
                {{ $td('Stake', `stake-by-lock.submit-button`) }}
            </template>

            <template v-slot:confirm-modal-header>
                <h2 class="u-h3 u-mb-10">
                    {{ $td('Confirm purchase', `metagarden-spot.confirm-title`) }}
                </h2>
            </template>

            <template v-slot:confirm-modal-body>
                <div class="information form-row">
                    <h3 class="information__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="spendAmount" format="approx"/>

                    <h3 class="information__title">{{ $td('To buy spots', 'todo') }}</h3>
                    <div class="information__item">
                        <div class="information__coin">
                            <div class="information__coin-symbol">{{ form.spotAmount }}</div>
                        </div>
                    </div>
                    <!--<BaseAmountEstimation :coin="'Spots'" :amount="form.spotAmount" format="exact"/>-->
                </div>
            </template>
        </TxSequenceWithSwapForm>
    </div>
</template>
