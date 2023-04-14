<script>
import Big from 'minterjs-util/src/big.js';
import {AsyncComputedMixin} from 'vue-async-computed/src/index.js';
import debounce from 'debounce-promise';
import stripZeros from 'pretty-num/src/pretty-num.js';
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required.js';
import minLength from 'vuelidate/src/validators/minLength.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import eventBus from '~/assets/event-bus.js';
import focusElement from '~/assets/focus-element.js';
import {getPool, getSwapCoinList} from '@/api/explorer.js';
import checkEmpty from '~/assets/v-check-empty.js';
import {decreasePrecisionSignificant, pretty, prettyExact} from "~/assets/utils.js";
import {getErrorText} from '~/assets/server-error.js';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import TxForm from '~/components/base/TxForm.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';

let watcherTimer;

const INPUT_TYPE = {
    AMOUNT0: 'amount0',
    AMOUNT1: 'amount1',
};

export default {
    TX_TYPE,
    INPUT_TYPE,
    components: {
        BaseAmountEstimation,
        TxForm,
        FieldCombined,
    },
    directives: {
        checkEmpty,
    },
    mixins: [validationMixin, AsyncComputedMixin],
    fetch() {
        return getSwapCoinList()
            .then((coinList) => {
                this.poolCoinList = coinList;
            });
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
    data() {
        return {
            form: {
                coin0: this.params.coin0?.toUpperCase() || '',
                volume0: this.params.volume0 || '',
                coin1: this.params.coin1?.toUpperCase() || '',
            },
            formAmount1: '',
            selectedInput: INPUT_TYPE.AMOUNT0,
            // list of all pools' coins
            poolCoinList: [],
            debouncedFetchPoolData: null,
        };
    },
    validations() {
        const form = {
            volume0: {
                //@TODO maxValue
                //@TODO validAmount
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
            formAmount1: {
            },
        };
    },
    asyncComputed: {
        poolData() {
            return this.debouncedFetchPoolData?.(this.form.coin0, this.form.coin1);
        },
    },
    computed: {
        isPoolLoaded() {
            return this.$asyncComputed.poolData.success && this.poolData?.liquidity;
        },
        // coin1Amount() {
        //     if (!this.isPoolLoaded || !this.form.volume0) {
        //         return 0;
        //     }
        //
        //     return new Big(this.form.volume0).div(this.poolData.amount0).times(this.poolData.amount1).toFixed();
        // },
        maximumVolume1() {
            if (!this.formAmount1) {
                return 0;
            }
            const slippagePercent = 5;
            const slippage = 1 + (slippagePercent) / 100;
            return decreasePrecisionSignificant(this.formAmount1 * slippage);
        },
        whatAffectsAmount() {
            return {
                poolData: this.poolData,
                volume0: this.form.volume0,
                selectedInput: this.selectedInput,
                formAmount1: this.formAmount1,
            };
        },
        // intersection of address balance and pool coins
        availableCoinList() {
            if (!this.poolCoinList.length) {
                return this.$store.state.balance;
            }

            return this.$store.state.balance.filter((balanceItem) => {
                return this.poolCoinList.find((poolCoin) => poolCoin.id === balanceItem.coin.id);
            });
        },
    },
    watch: {
        whatAffectsAmount: {
            handler() {
                // @input and @input.native may fire in different time so timer needed to wait all events
                clearTimeout(watcherTimer);
                watcherTimer = setTimeout(() => {
                    if (this.selectedInput === INPUT_TYPE.AMOUNT0 && this.isPoolLoaded) {
                        if (!this.form.volume0) {
                            this.formAmount1 = '';
                        } else {
                            this.formAmount1 = decreasePrecisionSignificant(new Big(this.form.volume0).div(this.poolData.amount0).times(this.poolData.amount1).toString());
                        }
                    }

                    if (this.selectedInput === INPUT_TYPE.AMOUNT1 && this.isPoolLoaded) {
                        if (!this.formAmount1) {
                            this.form.volume0 = '';
                        } else {
                            this.form.volume0 = stripZeros(new Big(this.formAmount1).div(this.poolData.amount1).times(this.poolData.amount0).toString());
                        }
                    }
                }, 20);
            },
            deep: true,
        },
    },
    mounted() {
        this.debouncedFetchPoolData = debounce(this.fetchPoolData, 400);

        eventBus.on('activate-add-liquidity', ({coin0, coin1}) => {
            this.form.coin0 = coin0;
            this.form.coin1 = coin1;

            const inputEl = this.$refs.fieldAmount.$el.querySelector('input');
            focusElement(inputEl);
        });
    },
    destroyed() {
        eventBus.off('activate-add-liquidity');
    },
    methods: {
        pretty,
        prettyExact,
        fetchPoolData() {
            // no pair entered
            if (!this.form.coin0 || !this.form.coin1 || this.form.coin0 === this.form.coin1) {
                return;
            }

            return getPool(this.form.coin0, this.form.coin1);
        },
        success() {
            eventBus.emit('update-pool-list');
        },
        beforeConfirm(txFormContext) {
            txFormContext.isFormSending = true;
            txFormContext.serverError = '';
            txFormContext.serverSuccess = '';
            return this.fetchPoolData()
                .then(() => {
                    txFormContext.isFormSending = false;
                })
                .catch((error) => {
                    txFormContext.isFormSending = false;
                    txFormContext.serverError = getErrorText(error);
                    throw error;
                });
        },
        reverseCoins() {
            const coin0 = this.form.coin0;
            const coin0Amount = this.form.volume0;
            this.form.coin0 = this.form.coin1;
            this.form.coin1 = coin0;
            this.form.volume0 = this.formAmount1;
            this.formAmount1 = coin0Amount;
        },
        clearForm() {
            this.form.volume0 = '';
            this.form.coin0 = '';
            this.form.coin1 = '';

            this.formAmount1 = '';
            this.selectedInput = INPUT_TYPE.AMOUNT0;
            this.$v.$reset();
        },
    },
};
</script>

<template>
    <TxForm
        :txData="{...form, maximumVolume1}"
        :$txData="$v.form"
        :txType="$options.TX_TYPE.ADD_LIQUIDITY"
        :before-confirm-modal-show="beforeConfirm"
        @success-tx="success()"
        @clear-form="clearForm()"
        @success="$emit('success')"
        @success-modal-close="$emit('success-modal-close')"
    >
        <template v-slot:default="{fee}">
            <div class="form-row">
                <FieldCombined
                    :coin.sync="form.coin0"
                    :$coin="$v.form.coin0"
                    :coinList="availableCoinList"
                    :amount.sync="form.volume0"
                    :$amount="$v.form.volume0"
                    :useBalanceForMaxValue="true"
                    :fee="fee"
                    :label="$td('First coin', 'form.pool-coin0')"
                    @input-native="selectedInput = $options.INPUT_TYPE.AMOUNT0"
                    @use-max="selectedInput = $options.INPUT_TYPE.AMOUNT0"
                />
                <span class="form-field__error" v-if="$v.form.coin0.$dirty && !$v.form.coin0.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.coin0.$dirty && !$v.form.coin0.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                <span class="form-field__error" v-if="$v.form.volume0.$dirty && !$v.form.volume0.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
            </div>

            <button class="form-row button button--white convert__reverse-button" type="button" @click="reverseCoins()">
                <img class="" src="/img/icon-reverse.svg" width="24" height="24" alt="⇅">
            </button>

            <div class="form-row">
                <FieldCombined
                    :coin.sync="form.coin1"
                    :$coin="$v.form.coin1"
                    :coinList="availableCoinList"
                    :amount.sync="formAmount1"
                    :$amount="$v.formAmount1"
                    :useBalanceForMaxValue="true"
                    :label="$td('Second coin', 'form.pool-coin1')"
                    @input-native="selectedInput = $options.INPUT_TYPE.AMOUNT1"
                    @use-max="selectedInput = $options.INPUT_TYPE.AMOUNT1"
                />
                <span class="form-field__error" v-if="$v.form.coin1.$dirty && !$v.form.coin1.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                <span class="form-field__error" v-else-if="$v.form.coin1.$dirty && !$v.form.coin1.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
            </div>

            <p class="form-row u-text-center u-text-muted u-text-small">
                {{ $td('Second coin amount is estimated and depends on&nbsp;the&nbsp;pool ratio at&nbsp;the&nbsp;moment of&nbsp;transaction.', 'form.pool-remove-amount-help') }}
            </p>
        </template>

        <template v-slot:submit-title>
            {{ $td('Add', 'form.pool-add-button') }}
        </template>

        <template v-slot:confirm-modal-header>
            <h2 class="u-h3 u-mb-10">
                <!-- <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-feature-pool.svg`" alt="" role="presentation" width="40" height="40">-->
                {{ action.title }}
            </h2>
        </template>

        <template v-slot:confirm-modal-body>
            <div class="information form-row">
                <h3 class="information__title">{{ $td('First coin', 'form.pool-coin0') }}</h3>
                <BaseAmountEstimation :coin="form.coin0" :amount="form.volume0" format="exact"/>

                <h3 class="information__title">{{ $td('Second coin', 'form.pool-coin1') }}</h3>
                <BaseAmountEstimation :coin="form.coin1" :amount="formAmount1" format="approx"/>
                <!--
                <span class="u-text-muted">({{ maximumVolume1 }} maximum)</span>
                -->
            </div>
        </template>
    </TxForm>
</template>
