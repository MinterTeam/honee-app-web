<script>
import {validationMixin} from 'vuelidate';
import required from 'vuelidate/lib/validators/required';
import minLength from 'vuelidate/lib/validators/minLength';
import maxLength from 'vuelidate/lib/validators/maxLength';
import minValue from 'vuelidate/lib/validators/minValue.js';
import maxValue from 'vuelidate/lib/validators/maxValue.js';
import autosize from 'v-autosize';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import checkEmpty from '~/assets/v-check-empty.js';
import {pretty, prettyRound, getDateAmerican, getTimeDistance} from '~/assets/utils.js';
import {getStakingProgram} from '~/api/staking.js';
import {getBlock} from '~/api/explorer.js';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
import TxSequenceWithSwapForm from '~/components/base/TxSequenceWithSwapForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import FieldRange from '~/components/base/FieldRange.vue';


export default {
    TX_TYPE,
    components: {
        TxSequenceWithSwapForm,
        BaseAmountEstimation,
        FieldCombined,
        FieldRange,
    },
    directives: {
        checkEmpty,
        autosize,
    },
    mixins: [validationMixin],
    fetch() {
        this.fetchLatestBlock();

        let programId = this.params.id;
        if (programId === 'BEE') {
            programId = 19;
        }
        if (programId === 'MUSD') {
            programId = 2;
        }

        return getStakingProgram(programId)
            .then((stakingProgram) => {
                this.stakingProgram = stakingProgram;
                const duration = stakingProgram.options[this.params.duration]
                    ? this.params.duration
                    : Object.keys(stakingProgram.options)[0];
                this.form.duration = blockToYear(duration);
                this.form.coin = stakingProgram.lockCoin.symbol;
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
                coin: '',
                duration: 0,
            },
            /** @type {StakingProgram|null} */
            stakingProgram: null,
            latestBlockHeight: 0,
            estimation: 0,
        };
    },
    validations() {
        const stakingProgramOptions = this.stakingProgram ? Object.keys(this.stakingProgram.options) : [];
        const form = {
            value: {
                required,
            },
            coin: {
                required,
                minLength: minLength(3),
            },
            duration: {
                required,
                minValue: minValue(blockToYear(stakingProgramOptions[0] || 0)),
                maxValue: maxValue(blockToYear(stakingProgramOptions.slice(-1) || 0)),
            },
        };

        return {form};
    },
    computed: {
        isProgramTimedOut() {
            if (!this.stakingProgram || !this.$store.state.explorer.status) {
                return false;
            }
            return this.stakingProgram.joinEndAtBlock - this.$store.state.explorer.status.latestBlockHeight <= BLOCKS_IN_DAY;
        },
        rangeList() {
            if (!this.stakingProgram) {
                return;
            }
            return Object.keys(this.stakingProgram.options).map((item) => blockToYear(item));
        },
        // lock duration in blocks
        selectedBlock() {
            return yearToBlock(this.form.duration);
        },
        // timestamp
        unlockTime() {
            return Date.now() + this.selectedBlock * 5 * 1000;
        },
        isSelectedLockCoin() {
            return this.form.coin === this.stakingProgram?.lockCoin.symbol;
        },
        lockValue() {
            if (this.isSelectedLockCoin) {
                return this.form.value;
            } else {
                return this.estimation;
            }
        },
        dailyYieldPercent() {
            return this.stakingProgram?.options[this.selectedBlock];
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
            return this.lockValue * this.totalYieldPercent / 100;
        },
        txData() {
            return {
                value: this.lockValue,
                coin: this.stakingProgram?.lockCoin.symbol,
                dueBlock: this.latestBlockHeight + this.selectedBlock,
            };
        },
        payload() {
            return JSON.stringify({lock_id: this.stakingProgram?.id});
        },
        sequenceParams() {
            return {
                prepare: this.isSelectedLockCoin ? undefined : (swapTx, prevPrepare) => {
                    const coinToBuy = swapTx.data.coin_to_buy || swapTx.data.coins.find((item) => item.id === swapTx.tags['tx.coin_to_buy']);
                    // @TODO if user had some coinToBuy on balance, it's better to deduct fee from old balance, than from swapTx.returnAmount
                    const value = getAvailableSelectedBalance({
                        coin: coinToBuy,
                        amount: swapTx.returnAmount,
                    }, prevPrepare.extra.fee);

                    return {
                        data: {
                            value,
                        },
                    };
                },
                txParams: {
                    data: this.txData,
                    type: TX_TYPE.LOCK,
                    payload: this.payload,
                },
            };
        },
    },
    watch: {
        apr() {
            this.$emit('override-stats-value', prettyRound(this.apr) + '%');
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
        <div class="u-mt-15" v-if="!stakingProgram && $fetchState.pending">{{ $td('Loading…', 'index.loading') }}</div>
        <div class="u-mt-15" v-else-if="!stakingProgram && !$fetchState.pending">{{ $td('Can\'t load staking program', 'stake-by-lock.error-program-not-found') }}</div>
        <div class="u-mt-15" v-else-if="!stakingProgram.isEnabled">{{ $td('Staking program disabled', 'stake-by-lock.error-program-disabled') }}</div>
        <div class="u-mt-15" v-else-if="isProgramTimedOut">{{ $td('Staking program timed out', 'stake-by-lock.error-program-timeout') }}</div>
        <TxSequenceWithSwapForm
            v-else-if="stakingProgram"
            :coin-to-sell="form.coin"
            :coin-to-buy="stakingProgram.lockCoin.symbol"
            :value-to-sell="form.value"
            :sequence-params="sequenceParams"
            :v$sequence-params="$v.form"
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
                        :coinList="$store.state.balance"
                        :amount.sync="form.value"
                        :$amount="$v.form.value"
                        :useBalanceForMaxValue="true"
                        :fee="fee.resultList[0]"
                        :label="$td('Amount', 'form.wallet-send-amount')"
                    />
                    <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                    <span class="form-field__error" v-if="$v.form.value.$dirty && !$v.form.value.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                </div>

                <div class="form-row" v-if="rangeList">
                    <FieldRange
                        v-model="form.duration"
                        :list="rangeList"
                        step="1"
                        :unit="() => getTimeDistance(unlockTime)"
                        :label="$td('Lock duration', 'form.stake-lock-duration-label')"
                    />
                    <!--
                    @input="selectedInput = $options.INPUT_TYPE.LIQUIDITY_PERCENT"
                    @blur="$v.formLiquidityPercent.$touch()"
                    -->
                    <span class="form-field__error" v-if="$v.form.duration.$dirty && !$v.form.duration.required">{{ $td('Enter duration', 'form.stake-lock-duration-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.duration.$dirty && !$v.form.duration.minValue">{{ $td('Minimum', 'form.range-error-min') }} 0%</span>
                    <span class="form-field__error" v-else-if="$v.form.duration.$dirty && !$v.form.duration.maxValue">{{ $td('Maximum', 'form.range-error-max') }} 100%</span>
                </div>

                <div class="estimation form-row">
                    <template v-if="!isSelectedLockCoin">
                        <h3 class="estimation__title">{{ $td('You will buy and stake approximately', 'stake-by-lock.estimation-buy') }}</h3>
                        <BaseAmountEstimation :coin="stakingProgram.lockCoin.symbol" :amount="estimation || 0" format="approx"/>
                    </template>

                    <h3 class="estimation__title">{{ $td('You will earn', 'stake-by-lock.estimation-earn') }}</h3>
                    <div class="estimation__item">
                        <div class="estimation__coin">
                            <img class="estimation__coin-icon" :src="$store.getters['explorer/getCoinIcon'](stakingProgram.rewardCoin.symbol)" width="20" height="20" alt="" role="presentation">
                            <div class="estimation__coin-symbol">{{ stakingProgram.rewardCoin.symbol }}</div>
                        </div>
                        <div class="estimation__value">
                            ≈{{ totalYieldAmount ? pretty(totalYieldAmount) : '' }}
                            (+{{ pretty(totalYieldPercent) }}%)
                        </div>
                    </div>

                    <h3 class="estimation__title">{{ $td('Your stake will unlock in', 'stake-by-lock.estimation-unlock') }}</h3>
                    <div class="estimation__item">
                        <div>
                            {{ getTimeDistance(unlockTime) }}
                        </div>
                        <div class="estimation__value">
                            ≈ {{ $td('On', 'stake-by-lock.estimation-unlock-preposition') }}
                            {{ getDate(unlockTime) }}
                        </div>
                    </div>
                </div>
            </template>

            <template v-slot:submit-title>
                {{ $td('Confirm', `form.submit-confirm-button`) }}
            </template>

            <template v-slot:confirm-modal-header>
                <h2 class="u-h3 u-mb-10">
                    <!--                <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-delegate.svg`" alt="" role="presentation" width="40" height="40">-->
                    {{ action.title }}
                </h2>
            </template>

            <template v-slot:confirm-modal-body>
                <div class="estimation form-row">
                    <template v-if="isSelectedLockCoin">
                        <h3 class="estimation__title">{{ $td('You will stake', 'stake-by-lock.confirm-lock') }}</h3>
                        <BaseAmountEstimation :coin="form.coin" :amount="form.value" format="exact"/>
                    </template>
                    <template v-else>
                        <h3 class="estimation__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                        <BaseAmountEstimation :coin="form.coin" :amount="form.value" format="exact"/>

                        <h3 class="estimation__title">{{ $td('You will buy and stake approximately', 'stake-by-lock.buy-estimation') }}</h3>
                        <BaseAmountEstimation :coin="stakingProgram.lockCoin.symbol" :amount="estimation" format="approx"/>
                    </template>

                    <h3 class="estimation__title">{{ $td('You will earn', 'stake-by-lock.estimation-earn') }}</h3>
                    <div class="estimation__item">
                        <div class="estimation__coin">
                            <img class="estimation__coin-icon" :src="$store.getters['explorer/getCoinIcon'](stakingProgram.rewardCoin.symbol)" width="20" height="20" alt="" role="presentation">
                            <div class="estimation__coin-symbol">{{ stakingProgram.rewardCoin.symbol }}</div>
                        </div>
                        <div class="estimation__value">
                            ≈{{ totalYieldAmount ? pretty(totalYieldAmount) : '' }}
                            (+{{ pretty(totalYieldPercent) }}%)
                        </div>
                    </div>

                    <h3 class="estimation__title">{{ $td('Your stake will unlock in', 'stake-by-lock.estimation-unlock') }}</h3>
                    <div class="estimation__item">
                        <div>
                            {{ getTimeDistance(unlockTime) }}
                        </div>
                        <div class="estimation__value">
                            ≈ {{ $td('On', 'stake-by-lock.estimation-unlock-preposition') }}
                            {{ getDate(unlockTime) }}
                        </div>
                    </div>
                </div>
            </template>
        </TxSequenceWithSwapForm>
    </div>
</template>
