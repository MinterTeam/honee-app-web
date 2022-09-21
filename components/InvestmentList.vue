<script>
import {getAddressLockList} from '~/api/staking.js';
import {fillCardWithCoin, flatCardList} from '~/content/card-list.js';
import {getErrorText} from '~/assets/server-error.js';
import {pretty} from '~/assets/utils.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import Card from '~/components/Card.vue';
import PortfolioListItem, {PORTFOLIO_LIST_TYPE} from '~/components/PortfolioListItem.vue';

export default {
    PORTFOLIO_LIST_TYPE,
    components: {
        BaseLoader,
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
                const coinSymbol = lockItem.program.lockCoin.symbol;
                if (!result[coinSymbol]) {
                    result[coinSymbol] = fillCardWithCoin({
                        amount: 0,
                        coin: coinSymbol,
                        programId: lockItem.program.id,
                        // dummy action to fill correct actionType
                        action: '/stake/0',
                        caption: 'Stake & Earn',
                        stats: {
                            caption: 'Total staked',
                            value: 0,
                        },
                        ru: {
                            caption: 'Стейкинг',
                            stats: {
                                caption: 'Всего',
                            },
                        },
                    });
                    // get latest actual staking program from card-data
                    const cardData = flatCardList.find((card) => card.coin === coinSymbol && card.actionType === 'stake');
                    if (cardData) {
                        result[coinSymbol].action = cardData.action;
                        result[coinSymbol].description = cardData.description;
                        result[coinSymbol].ru = cardData.ru;
                    }
                }
                result[coinSymbol].amount += Number(lockItem.amount);
                // use latest program to ensure it is actual (it is fallback if nothing found in card-data)
                result[coinSymbol].programId = Math.max(lockItem.program.id, result[coinSymbol].programId);
            });
            return Object.values(result)
                .map((item) => {
                    item.stats.value = pretty(item.amount);
                    if (item.action === '/stake/0') {
                        item.action = `/stake/${item.programId}`;
                    }
                    return item;
                });
        },
    },
    watch: {
    },
    methods: {
        getErrorText,
    },
};
</script>

<template>
    <div>
        <h2 class="u-h1 u-mb-15">
            {{ $td('Investments', `index.investments-title`) }}
        </h2>
        <div v-if="$fetchState.pending" class="u-text-center">
            <BaseLoader class="" :is-loading="true"/>
        </div>
        <div v-else-if="$fetchState.error">
            Can't get investments list <br>
            {{ getErrorText($fetchState.error) }}
        </div>
        <div v-else-if="portfolioList.length === 0 && lockList.length === 0">{{ $td('You don\'t have any investments yet', 'index.investments-list-empty') }}</div>
        <div class="u-grid u-grid--vertical-margin" v-else-if="portfolioList.length || lockList.length">
            <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="portfolio in portfolioList" :key="portfolio.id">
                <PortfolioListItem :portfolio="portfolio" :type="$options.PORTFOLIO_LIST_TYPE.COPIED"/>
            </div>
            <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="coinLockItem in coinLockList" :key="coinLockItem.coin">
                <Card :card="coinLockItem" :button-label="$td('Stake more', 'index.stake-more')"/>
            </div>
        </div>
    </div>
</template>
