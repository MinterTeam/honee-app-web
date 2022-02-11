<script>
import Big from '~/assets/big.js';
import {AsyncComputedMixin} from 'vue-async-computed/src/index.js';
import debounce from 'debounce-promise';
import {validationMixin} from 'vuelidate';
import required from 'vuelidate/lib/validators/required';
import minLength from 'vuelidate/lib/validators/minLength';
import maxLength from 'vuelidate/lib/validators/maxLength';
import minValue from 'vuelidate/lib/validators/minValue.js';
import maxValue from 'vuelidate/lib/validators/maxValue.js';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import eventBus from 'assets/event-bus.js';
import {getPoolProvider, getProviderPoolList} from '~/api/explorer.js';
import checkEmpty from '~/assets/v-check-empty.js';
import {getErrorText} from "~/assets/server-error.js";
import {decreasePrecisionFixed, decreasePrecisionSignificant, pretty, prettyExact} from "~/assets/utils.js";
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import TxForm from '~/components/base/TxForm.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import FieldRange from '~/components/base/FieldRange.vue';

let watcherTimer;

const INPUT_TYPE = {
    AMOUNT0: 'amount0',
    AMOUNT1: 'amount1',
    LIQUIDITY_AMOUNT: 'liquidity_amount',
    LIQUIDITY_PERCENT: 'liquidity_percent',
};

export default {
    TX_TYPE,
    INPUT_TYPE,
    components: {
        BaseAmountEstimation,
        TxForm,
        FieldCombined,
        FieldRange,
    },
    directives: {
        checkEmpty,
    },
    mixins: [validationMixin, AsyncComputedMixin],
    fetch() {
        this.$store.dispatch('FETCH_LIQUIDITY_LIST')
            .then((poolList) => {
                let coinList = {};
                poolList.forEach((pool) => {
                    coinList[pool.coin0.symbol] = {
                        coin: pool.coin0,
                        amount: pool.amount0,
                    };
                    coinList[pool.coin1.symbol] = {
                        coin: pool.coin1,
                        amount: pool.amount1,
                    };
                });

                this.poolCoinList = Object.values(coinList);
            });
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
    data() {
        return {
            form: {
                liquidity: this.params.liquidity || '',
                coin0: this.params.coin0?.toUpperCase() || '',
                coin1: this.params.coin1?.toUpperCase() || '',
            },
            formLiquidityPercent: '100',
            formAmount0: '',
            formAmount1: '',
            selectedInput: INPUT_TYPE.LIQUIDITY_PERCENT,
            // list of own pools' coins
            poolCoinList: [],
            debouncedFetchAddressLiquidity: null,
        };
    },
    validations() {
        const form = {
            liquidity: {
                required,
            },
            coin0: {
                required,
                minLength: minLength(3),
            },
            coin1: {
                required,
                minLength: minLength(3),
            },
        };

        return {
            form,
            formLiquidityPercent: {
                //@TODO validAmount
                minValue: minValue(0),
                maxValue: maxValue(100),
            },
            formAmount0: {
            },
            formAmount1: {
            },
            isPoolLoaded: {
                success: (value) => !!value,
            },
        };
    },
    asyncComputed: {
        addressLiquidityData() {
            return this.debouncedFetchAddressLiquidity?.(this.form.coin0, this.form.coin1);
        },
    },
    computed: {
        isPoolLoaded() {
            return this.$asyncComputed.addressLiquidityData.success && this.addressLiquidityData?.liquidity;
        },
        whatAffectsLiquidity() {
            return {
                addressLiquidityData: this.addressLiquidityData,
                // selectedInput: this.selectedInput,
                // liquidity: this.form.liquidity,
                formLiquidityPercent: this.formLiquidityPercent,
                // formAmount0: this.formAmount0,
                // formAmount1: this.formAmount1,
            };
        },
        minimumVolume0() {
            if (!this.formAmount0) {
                return 0;
            }
            let slippage = 1 - 3 / 100;
            if (slippage < 0) {
                slippage = 0;
            }

            return decreasePrecisionSignificant(this.formAmount0 * slippage);
        },
        minimumVolume1() {
            if (!this.formAmount1) {
                return 0;
            }
            let slippage = 1 - 3 / 100;
            if (slippage < 0) {
                slippage = 0;
            }

            return decreasePrecisionSignificant(this.formAmount1 * slippage);
        },
    },
    watch: {
        whatAffectsLiquidity: {
            handler() {
                // @input and @input.native may fire in different time so timer needed to wait all events
                clearTimeout(watcherTimer);
                watcherTimer = setTimeout(() => {
                    if (!this.isPoolLoaded) {
                        return;
                    }
                    /*
                    if (this.selectedInput === INPUT_TYPE.AMOUNT0 && this.isPoolLoaded) {
                        const amount0 = Math.min(this.formAmount0 || 0, this.addressLiquidityData.amount0);
                        this.formLiquidityPercent = liquidityPercentFromAmount(amount0, this.addressLiquidityData.amount0);
                        this.form.liquidity = poolTokenFromLiquidityPercent(this.formLiquidityPercent, this.addressLiquidityData.liquidity);
                        this.formAmount1 = amountFromLiquidityPercent(this.formLiquidityPercent, this.addressLiquidityData.amount1);
                    }

                    if (this.selectedInput === INPUT_TYPE.AMOUNT1 && this.isPoolLoaded) {
                        const amount1 = Math.min(this.formAmount1 || 0, this.addressLiquidityData.amount1);
                        this.formLiquidityPercent = liquidityPercentFromAmount(amount1, this.addressLiquidityData.amount1);
                        this.form.liquidity = poolTokenFromLiquidityPercent(this.formLiquidityPercent, this.addressLiquidityData.liquidity);
                        this.formAmount0 = amountFromLiquidityPercent(this.formLiquidityPercent, this.addressLiquidityData.amount0);
                    }
                    */

                    // if (this.selectedInput === INPUT_TYPE.LIQUIDITY_PERCENT && this.isPoolLoaded) {
                    const liquidityPercent = Math.max(Math.min(this.formLiquidityPercent || 0, 100), 0);
                    this.form.liquidity = poolTokenFromLiquidityPercent(liquidityPercent, this.addressLiquidityData.liquidity);
                    this.formAmount0 = amountFromLiquidityPercent(liquidityPercent, this.addressLiquidityData.amount0);
                    this.formAmount1 = amountFromLiquidityPercent(liquidityPercent, this.addressLiquidityData.amount1);
                    // }

                    /*
                    if (this.selectedInput === INPUT_TYPE.LIQUIDITY_AMOUNT && this.isPoolLoaded) {
                        this.formLiquidityPercent = new Big(this.form.liquidity || 0).div(this.addressLiquidityData.liquidity).times(100).toFixed(2);
                        this.formAmount0 = amountFromLiquidityPercent(this.formLiquidityPercent, this.addressLiquidityData.amount0);
                        this.formAmount1 = amountFromLiquidityPercent(this.formLiquidityPercent, this.addressLiquidityData.amount1);
                    }
                    */

                    function poolTokenFromLiquidityPercent(liquidityPercent, providerLiquidity) {
                        return new Big(liquidityPercent).div(100).times(providerLiquidity).toString();
                    }

                    function liquidityPercentFromAmount(inputAmount, providerAmount) {
                        return decreasePrecisionFixed(inputAmount / providerAmount * 100);
                    }

                    function amountFromLiquidityPercent(liquidityPercent, providerAmount) {
                        // don't put 0 into amount field, as it will be not convenient to edit later
                        if (!liquidityPercent) {
                            return '';
                        }
                        return decreasePrecisionSignificant(liquidityPercent / 100 * providerAmount);
                    }
                }, 20);
            },
            deep: true,
        },
    },
    mounted() {
        this.debouncedFetchAddressLiquidity = debounce(this.fetchAddressLiquidity, 400);
    },
    methods: {
        pretty,
        prettyExact,
        fetchAddressLiquidity() {
            // no pair entered
            if (!this.form.coin0 || !this.form.coin1 || this.form.coin0 === this.form.coin1) {
                return;
            }

            return getPoolProvider(this.form.coin0, this.form.coin1, this.$store.getters.address);
        },
        success() {
            eventBus.emit('update-pool-list');
        },
        beforeConfirm(txFormContext) {
            txFormContext.isFormSending = true;
            txFormContext.serverError = '';
            txFormContext.serverSuccess = '';
            return this.fetchAddressLiquidity()
                .then(() => {
                    txFormContext.isFormSending = false;
                })
                .catch((error) => {
                    txFormContext.isFormSending = false;
                    txFormContext.serverError = getErrorText(error);
                    throw error;
                });
        },
        clearForm() {
            this.form.liquidity = '';
            this.form.coin0 = '';
            this.form.coin1 = '';

            this.formLiquidityPercent = '';
            this.formAmount0 = '';
            this.formAmount1 = '';
            this.selectedInput = INPUT_TYPE.LIQUIDITY_PERCENT;

            this.$v.$reset();
        },
    },
};
</script>

<template>
    <TxForm
        :txData="{coin0: form.coin0, coin1: form.coin1, liquidity: form.liquidity, minimumVolume0: minimumVolume0, minimumVolume1: minimumVolume1}"
        :$txData="$v"
        :txType="$options.TX_TYPE.REMOVE_LIQUIDITY"
        :before-confirm-modal-show="beforeConfirm"
        @success-tx="success()"
        @clear-form="clearForm()"
    >
        <template v-slot:panel-header>
            <h1 class="u-h3 u-mb-10">
                {{ action.title || $td('Remove liquidity from swap pool', 'pool.remove-title') }}
            </h1>
            <!--            <p class="panel__header-description">-->
            <!--                {{ $td('Choose one of the coins that you own and specify the amount you would like to add.', 'swap.remove-description') }}-->
            <!--            </p>-->
        </template>

        <template v-slot:default>
            <div class="form-row">
                <FieldCombined
                    :coin.sync="form.coin0"
                    :$coin="$v.form.coin0"
                    :label="$td('First coin', 'form.pool-coin0')"
                    :coin-list="poolCoinList"
                    :fallback-to-full-list="false"
                    :amount="false"
                />
                <span class="form-field__error" v-if="$v.form.coin0.$dirty && !$v.form.coin0.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.coin0.$dirty && !$v.form.coin0.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                <!--
                :amount.sync="formAmount0"
                :$amount="$v.formAmount0"
                :max-value="isPoolLoaded ? addressLiquidityData.amount0 : undefined"
                @input-native="selectedInput = $options.INPUT_TYPE.AMOUNT0"
                @use-max="selectedInput = $options.INPUT_TYPE.AMOUNT0"
                -->
            </div>
            <div class="form-row">
                <FieldCombined
                    :coin.sync="form.coin1"
                    :$coin="$v.form.coin1"
                    :label="$td('Second coin', 'form.pool-coin1')"
                    :coin-list="poolCoinList"
                    :fallback-to-full-list="false"
                    :amount="false"
                />
                <span class="form-field__error" v-if="$v.form.coin1.$dirty && !$v.form.coin1.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.coin1.$dirty && !$v.form.coin1.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                <!--
                :amount.sync="formAmount1"
                :$amount="$v.formAmount1"
                :max-value="isPoolLoaded ? addressLiquidityData.amount1 : undefined"
                @input-native="selectedInput = $options.INPUT_TYPE.AMOUNT1"
                @use-max="selectedInput = $options.INPUT_TYPE.AMOUNT1"
                -->
            </div>
            <div class="form-row">
                <FieldRange
                    v-model="formLiquidityPercent"
                    unit="%"
                    :label="$td('Amount to return', 'form.pool-remove-liquidity-percent')"
                />
                <!--
                @input="selectedInput = $options.INPUT_TYPE.LIQUIDITY_PERCENT"
                @blur="$v.formLiquidityPercent.$touch()"
                -->
                <span class="form-field__error" v-if="$v.form.liquidity.$dirty && !$v.form.liquidity.required">{{ $td('Enter liquidity amount', 'form.pool-remove-liquidity-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.formLiquidityPercent.$dirty && !$v.formLiquidityPercent.minValue">{{ $td('Min. value 0%', 'form.percent-error-min') }}</span>
                <span class="form-field__error" v-else-if="$v.formLiquidityPercent.$dirty && !$v.formLiquidityPercent.maxValue">{{ $td('Maximum 100%', 'form.percent-error-max') }}</span>
            </div>
            <div class="form-row" v-if="form.coin0 && form.coin1">
                <span class="form__error" v-if="$v.isPoolLoaded.$dirty && !$v.isPoolLoaded.success">{{ $td('Provider’s liquidity not found for selected pair', 'form.pool-remove-liquidity-error-pool') }}</span>
                <div class="estimation u-mt-10">
                    <h3 class="estimation__title">{{ $td('You return', 'form.you-return') }}</h3>
                    <div class="estimation__item">
                        <div class="estimation__coin">
                            <img class="estimation__coin-icon" src="/img/icon-coin-lp.svg" width="20" height="20" alt="" role="presentation">
                            <div class="estimation__coin-symbol">{{ $td('LP tokens', 'form.lp-tokens') }}</div>
                        </div>
                        <div class="u-fw-600 u-text-number">{{ pretty(form.liquidity || 0) }}</div>
                    </div>

                    <h3 class="estimation__title">{{ $td('You get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                    <BaseAmountEstimation :coin="form.coin0" :amount="formAmount0" format="approx"/>
                    <BaseAmountEstimation :coin="form.coin1" :amount="formAmount1" format="approx"/>
                </div>
            </div>
        </template>

        <template v-slot:submit-title>
            {{ $td('Remove', 'form.pool-remove-button') }}
        </template>

        <template v-slot:confirm-modal-header>
            <h2 class="u-h3 u-mb-10">
<!--                <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-feature-pool.svg`" alt="" role="presentation" width="40" height="40">-->
                {{ $td('Remove liquidity from swap pool', 'form.pool-remove-title') }}
            </h2>
        </template>

        <template v-slot:confirm-modal-body>
            <div class="estimation form-row">
                <h3 class="estimation__title">{{ $td('You return', 'form.you-return') }}</h3>
                <div class="estimation__item">
                    <div class="estimation__coin">
                        <img class="estimation__coin-icon" src="/img/icon-coin-lp.svg" width="20" height="20" alt="" role="presentation">
                        <div class="estimation__coin-symbol">{{ $td('LP tokens', 'form.lp-tokens') }}</div>
                    </div>
                    <div class="u-fw-600 u-text-number">{{ prettyExact(form.liquidity || 0) }}</div>
                </div>

                <h3 class="estimation__title">{{ $td('You get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                <BaseAmountEstimation :coin="form.coin0" :amount="formAmount0" format="approx"/>
                <BaseAmountEstimation :coin="form.coin1" :amount="formAmount1" format="approx"/>
            </div>
        </template>
    </TxForm>
</template>
