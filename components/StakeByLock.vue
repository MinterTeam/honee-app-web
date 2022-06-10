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
import TxForm from '~/components/base/TxForm.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import FieldRange from '~/components/base/FieldRange.vue';


export default {
    TX_TYPE,
    components: {
        TxForm,
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

        return getStakingProgram()
            .then((stakingProgram) => {
                this.stakingProgram = stakingProgram;
                this.form.duration = blockToYear(Object.keys(stakingProgram.options)[0]);
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
                value: this.params.value || '',
                coin: this.params.coin?.toUpperCase() || '',
                duration: 0,
            },
            /** @type {StakingProgram|null}*/
            stakingProgram: null,
            latestBlockHeight: 0,
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
            return this.form.value * this.totalYieldPercent / 100;
        },
        txData() {
            return {
                value: this.form.value,
                coin: this.form.coin,
                dueBlock: this.latestBlockHeight + this.selectedBlock,
            };
        },
        payload() {
            return JSON.stringify({lock_id: this.stakingProgram?.id});
        },
    },
    methods: {
        pretty,
        prettyRound,
        getDate: getDateAmerican,
        getTimeDistance: (value) => getTimeDistance(value, true, {roundingMethod: 'round'}),
        fetchLatestBlock() {
            return getBlock('latest')
                .then((block) => {
                    this.latestBlockHeight = block.height;
                });
        },
        clearForm() {
            this.form.publicKey = '';
            this.form.stake = '';
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
        <TxForm
            v-if="stakingProgram"
            :txData="txData"
            :$txData="$v.form"
            :txType="$options.TX_TYPE.LOCK"
            :payload="payload"
            :before-post-tx="fetchLatestBlock"
            @clear-form="clearForm()"
        >
            <template v-slot:panel-header>
                <div class="card__action-head">
                    <img class="card__action-logo" alt="" :src="$store.getters['explorer/getCoinIcon'](params.coin)">
                    <div class="card__action-title">
                        <div class="card__action-title-type">
                            {{ action.title || $td('Stake & Earn', 'action.title-stake-by-lock') }}
                        </div>
                        <div class="card__action-title-value">{{ params.coin }}</div>
                    </div>
                    <div class="card__action-stats">
                        <div class="card__action-stats-caption">APR</div>
                        <div class="card__action-stats-value">{{ prettyRound(apr) }}%</div>
                    </div>
                </div>
<!--                <h1 class="u-h3 u-mb-10">-->
<!--                    {{ action.title || $td('Stake & Earn', 'action.title-stake-by-lock') }}-->
<!--                </h1>-->
                <!--
                <p class="panel__header-description">
                    {{ $td('You can delegate your tokens to validators and receive related payments in accordance with the terms of participation.', 'form.delegate-description') }}
                </p>
                -->
            </template>

            <template v-slot:default="{fee}">
                <div class="form-row">
                    <FieldCombined
                        :coin.sync="form.coin"
                        :$coin="$v.form.coin"
                        :fallback-to-full-list="false"
                        :amount.sync="form.value"
                        :$amount="$v.form.value"
                        :useBalanceForMaxValue="true"
                        :fee="fee"
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
                        unit=" year"
                        :pluralize-unit="true"
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
                    <h3 class="estimation__title">{{ $td('You will earn', 'stake-by-lock.estimation-earn') }}</h3>
                    <div class="estimation__item">
                        <div class="estimation__coin">
                            <img class="estimation__coin-icon" :src="$store.getters['explorer/getCoinIcon'](stakingProgram.rewardCoin.symbol)" width="20" height="20" alt="" role="presentation">
                            <div class="estimation__coin-symbol">{{ stakingProgram.rewardCoin.symbol }}</div>
                        </div>
                        <div class="estimation__value">
                            ≈<template v-if="totalYieldAmount">{{ pretty(totalYieldAmount) }}</template>
                            (+{{ pretty(totalYieldPercent) }}%)
                        </div>
                    </div>

                    <h3 class="estimation__title">{{ $td('Your stake will unlock in', 'stake-by-lock.estimation-unlock') }}</h3>
                    <div class="estimation__item">
                        <div>
                            {{ getTimeDistance(unlockTime) }}
                        </div>
                        <div class="estimation__value">≈ On {{ getDate(unlockTime) }}</div>
                    </div>
                </div>
        </template>

            <template v-slot:submit-title>
                {{ $td('Confirm', `form.submit-confirm-button`) }}
            </template>

            <template v-slot:confirm-modal-header>
                <h2 class="u-h3 u-mb-10">
                    <!--                <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-delegate.svg`" alt="" role="presentation" width="40" height="40">-->
                    {{ $td('Stake & Earn', 'action.title-stake-by-lock') }}
                </h2>
            </template>

            <template v-slot:confirm-modal-body>
                <div class="estimation form-row">
                    <h3 class="estimation__title">{{ $td('You will earn', 'stake-by-lock.estimation-earn') }}</h3>
                    <div class="estimation__item">
                        <div class="estimation__coin">
                            <img class="estimation__coin-icon" :src="$store.getters['explorer/getCoinIcon'](stakingProgram.rewardCoin.symbol)" width="20" height="20" alt="" role="presentation">
                            <div class="estimation__coin-symbol">{{ stakingProgram.rewardCoin.symbol }}</div>
                        </div>
                        <div class="estimation__value">
                            ≈<template v-if="totalYieldAmount">{{ pretty(totalYieldAmount) }}</template>
                            (+{{ pretty(totalYieldPercent) }}%)
                        </div>
                    </div>

                    <h3 class="estimation__title">{{ $td('Your stake will unlock in', 'stake-by-lock.estimation-unlock') }}</h3>
                    <div class="estimation__item">
                        <div>
                            {{ getTimeDistance(unlockTime) }}
                        </div>
                        <div class="estimation__value">≈ On {{ getDate(unlockTime) }}</div>
                    </div>
                </div>
            </template>

            <template v-slot:confirm-modal-footer>
                <div class="form-row u-text-small u-text-muted u-text-center" v-html="$td('', 'form.delegation-delegate-confirm-note')"></div>
            </template>
        </TxForm>
        <div v-else-if="$fetchState.pending">{{ $td('Loading…', 'index.loading') }}</div>
        <div v-else>{{ $td('Can\'t load staking program', 'stake-by-lock.error-not-found') }}</div>
    </div>
</template>
