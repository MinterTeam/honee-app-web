<script>
import {getCurrentInstance} from 'vue';
import {getAddressLockList, getPremiumLevel} from '~/api/staking.js';
import {fillCardWithCoin, flatCardList} from '~/data/cards.js';
import {getErrorText} from '~/assets/server-error.js';
import {PREMIUM_STAKE_PROGRAM_ID} from '~/assets/variables.js';
import {pretty} from '~/assets/utils.js';
import {deepMerge} from '~/assets/utils/collection.js';
import useStakeByLockList from '~/composables/use-stake-by-lock-list.js';
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
    setup() {
        const vm = getCurrentInstance()?.proxy;
        const {
            lockListPromise,
            lockList,
            coinLockList,
            prepareStakeCardList,
        } = useStakeByLockList({
            initFetchAddress: vm.$store.getters.address,
        });

        return {
            lockListPromise,
            lockList,
            coinLockList,
            prepareStakeCardList,
        };
    },
    fetch() {
        const portfolioListPromise = this.$store.dispatch('portfolio/fetchConsumerPortfolioList')
            .then((portfolioInfo) => {
                this.portfolioList = Object.freeze(portfolioInfo.list) || [];
            });

        return Promise.all([portfolioListPromise, this.lockListPromise]);
    },
    data() {
        return {
            selectedFilter: FILTERS.ALL,
            /** @type {Array<ConsumerPortfolio>} */
            portfolioList: [],
        };
    },
    computed: {
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
            return this.prepareStakeCardList([].concat(this.coinLockList, this.coinDelegationList));
        },
        filteredListLength() {
            if (this.selectedFilter === FILTERS.PORTFOLIO) {
                return this.portfolioList.length;
            }
            if (this.selectedFilter === FILTERS.STAKE) {
                return this.stakeCardList.length;
            }
            return this.portfolioList.length + this.stakeCardList.length;
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
        /**
         * @param {string} coinSymbol
         * @return {CardListItem}
         */
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
</script>

<template>
    <div v-if="portfolioList.length > 0 || stakeCardList.length > 0">
        <h2 class="u-h2 u-mb-15">
            {{ $td('My Investments', `index.investments-title`) }}
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
            <div class="u-grid u-grid--vertical-margin" v-if="filteredListLength > 0">
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
            <div v-else>{{ $td('Empty list', 'index.portfolio-list-empty') }}</div>
        </template>
    </div>
</template>
