<script>
import {getAddressLockList} from '~/api/staking.js';
import {fillCardWithCoin, flatCardList} from '~/content/card-list.js';
import {getErrorText} from '~/assets/server-error.js';
import {pretty} from '~/assets/utils.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import BaseTabs from '~/components/base/BaseTabs.vue';
import Card from '~/components/Card.vue';
import PortfolioListItem, {PORTFOLIO_LIST_TYPE} from '~/components/PortfolioListItem.vue';

const FILTERS = {
    ALL: 0,
    PORTFOLIO: 'portfolio',
    STAKE: 'stake',
};

export default {
    PORTFOLIO_LIST_TYPE,
    FILTERS,
    components: {
        BaseLoader,
        BaseTabs,
        Card,
        PortfolioListItem,
    },
    fetch() {
        const portfolioListPromise = this.$store.dispatch('portfolio/fetchConsumerPortfolioList')
            .then((portfolioInfo) => {
                this.portfolioList = Object.freeze(portfolioInfo.list) || [];
            });

        const lockListPromise =  getAddressLockList(this.$store.getters.address)
            .then((lockList) => {
                this.lockList = Object.freeze(lockList);
            });

        return Promise.all([portfolioListPromise, lockListPromise]);
    },
    data() {
        return {
            selectedFilter: FILTERS.ALL,
            /** @type {Array<ConsumerPortfolio>} */
            portfolioList: [],
            /** @type {Array<StakingProgramAddressLock>} */
            lockList: [],
        };
    },
    computed: {
        coinLockList() {
            const result = {};
            this.lockList.forEach((lockItem) => {
                const PREMIUM_ID = 23;
                const isPremium = lockItem.program.id === PREMIUM_ID;
                const coinSymbol = isPremium ? PREMIUM_ID : lockItem.program.lockCoin.symbol;
                if (!result[coinSymbol]) {
                    result[coinSymbol] = isPremium ? this.getEmptyPremiumCard(coinSymbol, lockItem) : this.getEmptyStakeCard(coinSymbol, lockItem);
                }
                result[coinSymbol].amount += Number(lockItem.amount);
                if (isPremium) {
                    result[coinSymbol].title = 'LEVEL ' + getPremiumLevel(result[coinSymbol].amount);
                } else {
                    // use latest program to ensure it is actual (it is fallback if nothing found in card-data)
                    result[coinSymbol].programId = Math.max(lockItem.program.id, result[coinSymbol].programId);
                    result[coinSymbol].action = `/stake/${result[coinSymbol].programId}`;
                }
            });
            return Object.values(result);
        },
        coinDelegationList() {
            const result = {};
            this.$store.state.stakeList.forEach((delegationItem) => {
                const coinSymbol = delegationItem.coin.symbol;
                if (!result[coinSymbol]) {
                    result[coinSymbol] = this.getEmptyDelegationCard(coinSymbol);
                }
                result[coinSymbol].amount += Number(delegationItem.value);
            });
            return Object.values(result);
        },
        stakeCardList() {
            return [].concat(this.coinLockList, this.coinDelegationList)
                .map((item) => {
                    item.stats.value = pretty(item.amount);
                    // get latest actual staking program from card-data
                    const cardData = flatCardList.find((data) => data.coin === item.coin && data.actionType === item.actionType);
                    if (cardData) {
                        // overwrite action to ensure latest actual
                        item.action = cardData.action;
                        item.description = cardData.description;
                        item.ru = cardData.ru;
                    }
                    return item;
                });
        },
        filterTabs() {
            return Object.values(FILTERS).map((filterValue) => {
                return {
                    value: filterValue,
                    label: this.$t(`index.investments-tabs-label-${filterValue}`),
                };
            });
        },
    },
    watch: {
    },
    methods: {
        getErrorText,
        getEmptyStakeCard(coinSymbol, lockItem) {
            return fillCardWithCoin({
                amount: 0,
                coin: coinSymbol,
                // store previous item programId to compare it later
                programId: lockItem.program.id,
                // dummy action to fill correct actionType
                action: `/stake/${lockItem.program.id}`,
                caption: 'Stake & Earn',
                stats: {
                    caption: 'Total staked',
                    value: 0,
                },
                ru: {
                    caption: 'Стейкинг',
                    stats: {
                        caption: 'Общий стейк',
                    },
                },
                buttonLabel: this.$td('Stake more', 'index.stake-more'),
            });
        },
        getEmptyPremiumCard(coinSymbol, lockItem) {
            return {
                ...this.getEmptyStakeCard(coinSymbol, lockItem),
                caption: 'Premium',
                title: 'LEVEL 0',
                icon: '/img/icon-premium.svg',
                action: `/premium`,
                buttonLabel: this.$td('Update your level', 'premium.card-update-button'),
            };
        },
        getEmptyDelegationCard(coinSymbol) {
            return fillCardWithCoin({
                amount: 0,
                coin: coinSymbol,
                // dummy action to fill correct actionType
                action: `/delegate/${coinSymbol}`,
                caption: 'Delegate',
                stats: {
                    caption: 'Total delegated',
                    value: 0,
                },
                ru: {
                    caption: 'Делегирование',
                    stats: {
                        caption: 'Всего',
                    },
                },
                buttonLabel: this.$td('Delegate more', 'index.delegate-more'),
            });
        },
    },
};

function getPremiumLevel(amount) {
    if (amount >= 1000000) {
        return 4;
    }
    if (amount >= 100000) {
        return 3;
    }
    if (amount >= 10000) {
        return 2;
    }
    if (amount >= 1000) {
        return 1;
    }
    return 0;
}
</script>

<template>
    <div>
        <h2 class="u-h1 u-mb-15">
            {{ $td('My investments', `index.investments-title`) }}
        </h2>
        <div v-if="$fetchState.pending" class="u-text-center">
            <BaseLoader class="" :is-loading="true"/>
        </div>
        <div v-else-if="$fetchState.error">
            Can't get investments list <br>
            {{ getErrorText($fetchState.error) }}
        </div>
        <div v-else-if="portfolioList.length === 0 && stakeCardList.length === 0">{{ $td('You don\'t have any investments yet', 'index.investments-list-empty') }}</div>
        <template v-else>
            <BaseTabs
                class="u-mb-15"
                v-model="selectedFilter"
                :tabs="filterTabs"
            />
            <div class="u-grid u-grid--vertical-margin">
                <template v-if="!selectedFilter || selectedFilter === $options.FILTERS.PORTFOLIO">
                    <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="portfolio in portfolioList" :key="portfolio.id">
                        <PortfolioListItem :portfolio="portfolio" :type="$options.PORTFOLIO_LIST_TYPE.COPIED"/>
                    </div>
                </template>
                <template v-if="!selectedFilter || selectedFilter === $options.FILTERS.STAKE">
                    <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="stakeCard in stakeCardList" :key="stakeCard.action">
                        <Card :card="stakeCard"/>
                    </div>
                </template>
            </div>
        </template>
    </div>
</template>
