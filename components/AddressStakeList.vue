<script>
import {getDateAmerican, getTimeDistance, pretty, prettyRound} from '~/assets/utils.js';
import {getErrorText} from '~/assets/server-error.js';
import {getAddressLockList} from '~/api/staking.js';
import BaseCoinSymbol from '~/components/base/BaseCoinSymbol.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';

export default {
    fetch() {
        return getAddressLockList(this.$store.getters.address)
            .then((lockList) => {
                this.lockList = lockList;
            });
    },
    components: {
        BaseCoinSymbol,
        BaseLoader,
    },
    data() {
        return {
            /** @type {Array<StakingProgramAddressLock>} */
            lockList: [],
        };
    },
    computed: {
    },
    methods: {
        pretty,
        prettyRound,
        getErrorText,
        getDate(value) {
            return getDateAmerican(value, {locale: this.$i18n.locale});
        },
        getTimeDistance(value) {
            return getTimeDistance(value, true, {
                unit: 'month',
                locale: this.$i18n.locale,
            });
        },
        getCoinIconUrl(coin) {
            return this.$store.getters['explorer/getCoinIcon'](coin);
        },
        getAmountUsd(bipAmount) {
            return (bipAmount || 0) * this.$store.getters['explorer/bipPriceUsd'];
        },
        /**
         * @param {StakingProgramAddressLock} lockItem
         * @return {number}
         */
        getApr(lockItem) {
            const dailyYieldPercent = lockItem.program.options[lockItem.option];
            return dailyYieldPercent * 365;
        },
        /**
         * @param {StakingProgramAddressLock} lockItem
         * @return {number}
         */
        getUnlockTime(lockItem) {
            if (!this.$store.state.explorer.status || this.$store.state.explorer.status.latestBlockHeight <= 0) {
                return Date.now();
            }
            const latestBlockTimestamp = new Date(this.$store.state.explorer.status.latestBlockTime).getTime();
            const lockedBlockCount = lockItem.dueBlock - this.$store.state.explorer.status.latestBlockHeight;
            return latestBlockTimestamp + lockedBlockCount * 5 * 1000;
        },
    },
};
</script>

<template>
    <div>
        <div v-if="$fetchState.pending" class="u-text-center">
            <BaseLoader class="" :is-loading="true"/>
        </div>
        <div v-else-if="$fetchState.error">
            {{ $td('Can\'t get stake list', 'index.error-stake-list') }} <br>
            {{ getErrorText($fetchState.error) }}
        </div>
        <div v-else-if="lockList.length === 0">{{ $td('No stakes yet', 'index.nostakes') }}</div>
        <div class="table-wrap" v-else-if="lockList.length">
            <table class="u-hidden-medium-down">
                <thead>
                <tr>
                    <th>{{ $td('Token', 'common.token') }}</th>
                    <th>{{ $td('Unlocks in', 'index.assets-stakes-table-unlock') }}</th>
                    <th>{{ $td('APR', 'common.apr') }}</th>
                    <th>{{ $td('Amount', 'index.assets-stakes-table-amount') }}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="lockItem in lockList" :key="lockItem.key">
                    <td>
                        <img class="wallet__coin-icon" :src="getCoinIconUrl(lockItem.program.lockCoin.symbol)" width="24" height="24" alt="" role="presentation">
                        <BaseCoinSymbol class="wallet__coin-name">{{ lockItem.program.lockCoin.symbol }}</BaseCoinSymbol>
                    </td>
                    <td>
                        <template v-if="$store.state.explorer.status?.latestBlockHeight > 0">
                            <div class="u-fw-600">
                                {{ getTimeDistance(getUnlockTime(lockItem)) }}
                            </div>
                            <div class="u-text-small u-text-muted u-fw-600">
                                ≈ {{ getDate(getUnlockTime(lockItem)) }}
                            </div>
                        </template>
                        <template v-else>—</template>
                    </td>
                    <td class="u-fw-600">{{ prettyRound(getApr(lockItem)) }}%</td>
                    <td>
                        <div class="u-fw-600">{{ pretty(lockItem.amount) }}</div>
                    </td>
                </tr>
                </tbody>
            </table>
            <div class="u-hidden-medium-up">
                <div class="wallet__stake-item" v-for="lockItem in lockList" :key="`${lockItem.dueBlock}-${lockItem.option}-${lockItem.program.id}`">
                    <div class="wallet__stake-row">
                        <div class="wallet__coin">
                            <img class="wallet__coin-icon" :src="getCoinIconUrl(lockItem.program.lockCoin.symbol)" width="24" height="24" alt="" role="presentation">
                            <BaseCoinSymbol class="wallet__coin-name">{{ lockItem.program.lockCoin.symbol }}</BaseCoinSymbol>
                        </div>
                        <div class="wallet__coin-balance">
                            {{ pretty(lockItem.amount) }}
                        </div>
                    </div>
                    <div class="wallet__stake-row">
                        <div>
                            <div class="u-h--uppercase wallet__stake-row-title">
                                {{ $td('Unlocks on', 'index.assets-stakes-table-unlock-on') }}
                            </div>
                            <div class="u-text-medium u-fw-600">
                                ≈ {{ getDate(getUnlockTime(lockItem)) }}
                            </div>
                        </div>
                        <div class="u-text-right">
                            <div class="u-h--uppercase wallet__stake-row-title">
                                {{ $td('APR', 'common.apr') }}
                            </div>
                            <div class="u-text-medium u-fw-600">{{ prettyRound(getApr(lockItem)) }}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
