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
import BaseCoinSymbol from '~/components/base/BaseCoinSymbol.vue';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
import TxSequenceWithSwapForm from '~/components/base/TxSequenceWithSwapForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';


export default {
    TX_TYPE,
    components: {
        BaseCoinSymbol,
        TxSequenceWithSwapForm,
        BaseAmountEstimation,
        FieldCombined,
    },
    directives: {
        checkEmpty,
        autosize,
    },
    mixins: [validationMixin],
    fetch() {
        this.fetchLatestBlock();

        let programId = this.params.id;

        return getFarmProgramWithPoolData(programId)
            .then((program) => {
                this.program = program;
                this.form.coin = program.tokenSymbol;
            })
            .catch((error) => {
                this.$nuxt.error(error);
            });
    },
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
    data() {
        return {
            form: {
                value: '',
                coin: this.$route.query.coin || '',
            },
            isUseMax: false,
            /** @type {FarmProgramWithPoolData|null} */
            program: null,
            latestBlockHeight: 0,
            estimation: 0,
        };
    },
    validations() {
        const form = {
            value: {
                required,
            },
            coin: {
                required,
                minLength: minLength(3),
            },
        };

        return {
            form,
        };
    },
    computed: {
        isProgramTimedOut() {
            if (!this.program) {
                return false;
            }
            // 365 days
            return new Date(this.program.finishAt) - new Date() <= 365 * 24 * 60 * 60 * 1000;
        },
        // lock duration in blocks
        selectedBlock() {
            return this.program.lockBlocks;
        },
        // timestamp
        unlockTime() {
            return Date.now() + this.selectedBlock * 5 * 1000;
        },
        isSelectedLockCoin() {
            return this.form.coin === this.lockTokenSymbol;
        },
        lockTokenSymbol() {
            return this.program?.tokenSymbol;
        },
        lockValue() {
            if (this.isSelectedLockCoin) {
                return this.form.value;
            } else {
                return this.estimation;
            }
        },
        // based on that value rewards will be calculated
        lockValueToReward() {
            if (!this.program) {
                return 0;
            }
            const poolAmount = getAmountFromPool(this.program, this.program.rewardCoin.symbol);
            const rewardCoinLockAmount = this.lockValue / this.program.liquidity * poolAmount;
            // locked liquidity denominated in reward coin
            return rewardCoinLockAmount * 2;
        },
        dailyYieldPercent() {
            return this.program?.percent;
        },
        // earlyYieldPercent
        apr() {
            return this.dailyYieldPercent * 365;
        },
        totalYieldPercent() {
            const lockDays = Math.floor(this.selectedBlock / BLOCKS_IN_DAY);
            return lockDays * this.dailyYieldPercent;
        },
        totalYieldAmount() {
            return this.lockValueToReward * this.totalYieldPercent / 100;
        },
        txData() {
            return {
                value: this.lockValue,
                coin: this.lockTokenSymbol,
                dueBlock: this.latestBlockHeight + this.selectedBlock,
            };
        },
        sequenceParams() {
            const prepareUseMaxLockCoin = this.isUseMax ? (dummyTx, prevPrepareGasCoin) => {
                const selectedBalanceItem = this.$store.getters.getBalanceItem(this.lockTokenSymbol);
                const value = getAvailableSelectedBalance(selectedBalanceItem, prevPrepareGasCoin.extra.fee);

                return {
                    data: {
                        value,
                    },
                };
            } : undefined;
            const prepareAfterSwap = (swapTx, prevPrepareGasCoin) => {
                const coinToBuy = swapTx.data.coin_to_buy || swapTx.data.coins.find((item) => item.id === swapTx.tags['tx.coin_to_buy']);
                // @TODO if user had some coinToBuy on balance, it's better to deduct fee from old balance, than from swapTx.returnAmount
                const value = getAvailableSelectedBalance({
                    coin: coinToBuy,
                    amount: swapTx.returnAmount,
                }, prevPrepareGasCoin.extra.fee);

                return {
                    data: {
                        value,
                    },
                };
            };
            const prepare = this.isSelectedLockCoin ? prepareUseMaxLockCoin : prepareAfterSwap;
            return {
                // refineFee is not needed if no 'prepare'
                prepareGasCoinPosition: prepare ? 'start' : 'skip',
                prepare,
                txParams: {
                    data: this.txData,
                    type: TX_TYPE.LOCK,
                    gasCoin: this.$store.getters.BASE_COIN,
                },
                feeTxParams: {
                    data: {
                        coin: this.txData.coin,
                        value: 0,
                        dueBlock: 1,
                    },
                    type: TX_TYPE.LOCK,
                    gasCoin: this.$store.getters.BASE_COIN,
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
            this.form.value = '';
            this.form.coin = '';
            this.$v.$reset();
        },
    },
};

// 60 * 60 * 24 / 5
const BLOCKS_IN_DAY = 17280;
// 60 * 60 * 24 * 365 / 5
const BLOCKS_IN_YEAR = 6307200;
function blockToYear(block) {
    return block / BLOCKS_IN_YEAR;
}
function yearToBlock(year) {
    return year * BLOCKS_IN_YEAR;
}
</script>

<template>
    <div>
        <div class="u-mt-15" v-if="!program && $fetchState.pending">{{ $td('Loading…', 'index.loading') }}</div>
        <div class="u-mt-15" v-else-if="!program && !$fetchState.pending">{{ $td('Can\'t load farming program', 'farm-with-lock.error-program-not-found') }}</div>
        <div class="u-mt-15" v-else-if="isProgramTimedOut">{{ $td('Farming program timed out', 'farm-with-lock.error-program-timeout') }}</div>
        <TxSequenceWithSwapForm
            v-else-if="program"
            :coin-to-sell="form.coin"
            :coin-to-buy="lockTokenSymbol"
            :value-to-sell="form.value"
            :is-use-max="isUseMax"
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
                    <FieldCombined
                        :coin.sync="form.coin"
                        :$coin="$v.form.coin"
                        :coinList="[]"
                        :fallbackToFullList="false"
                        :amount.sync="form.value"
                        :$amount="$v.form.value"
                        :useBalanceForMaxValue="true"
                        :fee="fee.resultList[0]"
                        :label="$td('Amount', 'form.wallet-send-amount')"
                        @update:is-use-max="isUseMax = $event"
                    />
                    <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                    <span class="form-field__error" v-if="$v.form.value.$dirty && !$v.form.value.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                </div>

                <div class="information form-row">
                    <template v-if="!isSelectedLockCoin">
                        <h3 class="information__title">{{ $td('You will buy and stake approximately', 'stake-by-lock.estimation-buy') }}</h3>
                        <BaseAmountEstimation :coin="lockTokenSymbol" :amount="estimation || 0" format="approx"/>
                    </template>

                    <template v-if="dailyYieldPercent > 0">
                        <h3 class="information__title">{{ $td('You will earn', 'stake-by-lock.estimation-earn') }}</h3>
                        <div class="information__item">
                            <div class="information__coin">
                                <img class="information__coin-icon" :src="$store.getters['explorer/getCoinIcon'](program.rewardCoin.symbol)" width="20" height="20" alt="" role="presentation">
                                <BaseCoinSymbol class="information__coin-symbol">{{ program.rewardCoin.symbol }}</BaseCoinSymbol>
                            </div>
                            <div class="information__value">
                                ≈{{ totalYieldAmount ? pretty(totalYieldAmount) : '' }}
                                (+{{ pretty(totalYieldPercent) }}%)
                            </div>
                        </div>
                    </template>

                    <h3 class="information__title">{{ $td('Your stake will unlock in', 'stake-by-lock.estimation-unlock') }}</h3>
                    <div class="information__item">
                        <div>
                            {{ getTimeDistance(unlockTime) }}
                        </div>
                        <div class="information__value">
                            ≈ {{ $td('On', 'stake-by-lock.estimation-unlock-preposition') }}
                            {{ getDate(unlockTime) }}
                        </div>
                    </div>
                </div>
            </template>

            <template v-slot:submit-title>
                {{ $td('Stake', `stake-by-lock.submit-button`) }}
            </template>

            <template v-slot:confirm-modal-header>
                <h2 class="u-h3 u-mb-10">
                    <!--                <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-delegate.svg`" alt="" role="presentation" width="40" height="40">-->
                    {{ action.title }}
                </h2>
            </template>

            <template v-slot:confirm-modal-body>
                <div class="information form-row">
                    <template v-if="isSelectedLockCoin">
                        <h3 class="information__title">{{ $td('You will stake', 'stake-by-lock.confirm-lock') }}</h3>
                        <BaseAmountEstimation :coin="form.coin" :amount="form.value" format="exact"/>
                    </template>
                    <template v-else>
                        <h3 class="information__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                        <BaseAmountEstimation :coin="form.coin" :amount="form.value" format="exact"/>

                        <h3 class="information__title">{{ $td('You will buy and stake approximately', 'stake-by-lock.estimation-buy') }}</h3>
                        <BaseAmountEstimation :coin="lockTokenSymbol" :amount="estimation" format="approx"/>
                    </template>

                    <template v-if="dailyYieldPercent > 0">
                        <h3 class="information__title">{{ $td('You will earn', 'stake-by-lock.estimation-earn') }}</h3>
                        <div class="information__item">
                            <div class="information__coin">
                                <img class="information__coin-icon" :src="$store.getters['explorer/getCoinIcon'](program.rewardCoin.symbol)" width="20" height="20" alt="" role="presentation">
                                <BaseCoinSymbol class="information__coin-symbol">{{ program.rewardCoin.symbol }}</BaseCoinSymbol>
                            </div>
                            <div class="information__value">
                                ≈{{ totalYieldAmount ? pretty(totalYieldAmount) : '' }}
                                (+{{ pretty(totalYieldPercent) }}%)
                            </div>
                        </div>
                    </template>

                    <h3 class="information__title">{{ $td('Your stake will unlock in', 'stake-by-lock.estimation-unlock') }}</h3>
                    <div class="information__item">
                        <div>
                            {{ getTimeDistance(unlockTime) }}
                        </div>
                        <div class="information__value">
                            ≈ {{ $td('On', 'stake-by-lock.estimation-unlock-preposition') }}
                            {{ getDate(unlockTime) }}
                        </div>
                    </div>
                </div>
            </template>
        </TxSequenceWithSwapForm>
    </div>
</template>
