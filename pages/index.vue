<script>
import {pretty} from "~/assets/utils.js";
import {DASHBOARD_URL} from '~/assets/variables.js';
import cardList from '~/assets/data-card-list.js';
import Card from '~/components/Card.vue';
import CoinList from '~/components/CoinList.vue';

const BALANCE_DISPLAY_BIP = 1;
const BALANCE_DISPLAY_TOTAL = 2;
const BALANCE_DISPLAY_TOTAL_USD = 3;
const BASE_CARD = {
    DELEGATION: 'delegation',
    LIQUIDITY: 'liquidity',
    // FARM: 'farm',
    // LOTTERY: 'lottery',
};

export default {
    BALANCE_DISPLAY_BIP,
    BALANCE_DISPLAY_TOTAL,
    BALANCE_DISPLAY_TOTAL_USD,
    BASE_CARD,
    cardList,
    components: {
        Card,
        CoinList,
    },
    filters: {
        pretty,
        uppercase: (value) => value.toUpperCase(),
    },
    fetch() {
        return Promise.all([
            this.$store.dispatch('FETCH_STAKE_LIST'),
            this.$store.dispatch('FETCH_LIQUIDITY_LIST'),
        ]);
    },
    props: {

    },
    data() {
        return {

        };
    },
    computed: {
        cardList() {
            let result = {};
            // transform cards
            for (const categorySlug in this.$options.cardList) {
                result[categorySlug] = this.$options.cardList[categorySlug].map((card) => {
                    return {
                        ...card,
                        category: categorySlug,
                        actionType: card.action.replace(/\?.*/, '').split('/').filter((item) => !!item)[0],
                    };
                });
            }
            // add base cards
            result.earn.push(BASE_CARD.DELEGATION);
            result.earn.push(BASE_CARD.LIQUIDITY);
            // result.earn.push(BASE_CARD.FARM);
            // result.win.push(BASE_CARD.LOTTERY);

            return result;
        },
    },
    watch: {
        // update tx list on balance updated
        // "$store.state.balance": function() {
        //     this.$store.dispatch('FETCH_TRANSACTION_LIST');
        // },
    },
    methods: {
        pretty,
        capitalize(value) {
            return value[0].toUpperCase() + value.substring(1);
        },
        pageUrl(page = '') {
            // remove first slash
            page = page.replace(/^\//, '');
            return this.$i18nGetPreferredPath(DASHBOARD_URL + page);
        },
    },
};
</script>


<template>
    <div>
        <div class="card">
            <div class="card__content">
                <h2 class="u-h--uppercase">{{ $td('Total balance', 'index.total-balance') }}</h2>
                <div class="wallet__balance-wrap">
                    <div class="wallet__balance">
                        <div class="wallet__balance-value">
                            ${{ pretty($store.state.totalBalanceSumUsd) }}
                        </div>
                    </div>
                    <div class="wallet__balance-links">
                        <nuxt-link class="button button--yellow-light button--full-mobile" :to="pageUrl('buy')">
                            <img class="button__icon" src="/img/icon-category-buy.svg" width="24" height="24" alt="" role="presentation">
                            {{ $td('Buy BIP, HUB, & BEE', 'index.wallet-balance-links') }}
                        </nuxt-link>
                    </div>
                </div>
            </div>
            <div class="card__content">
                <div class="button-group button-group--center">
                    <nuxt-link class="button button--main button--full-mobile" :to="pageUrl('deposit')">
                        <img class="button__icon" src="/img/icon-white-deposit.svg" width="24" height="24" alt="" role="presentation">
                        {{ $td('Deposit', 'index.deposit') }}
                    </nuxt-link>
                    <nuxt-link class="button button--main button--full-mobile" :to="pageUrl('swap')">
                        <img class="button__icon" src="/img/icon-white-swap.svg" width="24" height="24" alt="" role="presentation">
                        {{ $td('Swap', 'index.swap') }}
                    </nuxt-link>
                    <nuxt-link class="button button--main button--full-mobile" :to="pageUrl('send')">
                        <img class="button__icon" src="/img/icon-white-send.svg" width="24" height="24" alt="" role="presentation">
                        {{ $td('Send', 'index.send') }}
                    </nuxt-link>
                </div>
            </div>
            <CoinList class="card__content"/>
        </div>

        <div class="u-mt-25" v-for="(categoryCards, categorySlug) in cardList" :key="categorySlug">
            <h2 class="dashboard__category-title u-mb-15">
                <img class="dashboard__category-icon" :src="`/img/icon-category-${categorySlug}.svg`" alt="" role="presentation">
                <span>{{ capitalize(categorySlug) }}</span>
            </h2>
            <div class="u-grid u-grid--vertical-margin">
                <div class="u-cell u-cell--medium--1-2" v-for="card in categoryCards" :key="card.action || card">
                    <Card :card="card" v-if="card.action"/>

                    <div class="card card__content--small" v-if="card === $options.BASE_CARD.DELEGATION">
                        <h3 class="card__action-title">Delegation</h3>
                        <p class="">Bonding your BIP or custom coins to a network validator and getting rewards (block rewards + portion of transaction fees). The returns are shared among all delegators proportionally to their stake, minus validator's fee.</p>

                        <nuxt-link class="button button--main button--full u-mt-10" :to="pageUrl('delegate')">
                            Delegate
                        </nuxt-link>
                        <nuxt-link class="button button--main button--full u-mt-05" :to="pageUrl('unbond')">
                            Unbond
                        </nuxt-link>
                        <a class="button button--ghost-main button--full u-mt-05" href="https://chainik.io/validators" target="_blank">
                            Validators
                        </a>
                    </div>

                    <div class="card card__content--small" v-if="card === $options.BASE_CARD.LIQUIDITY">
                        <h3 class="card__action-title">Providing liquidity</h3>
                        <p class="">
                            <template v-if="$i18n.locale === 'en'">
                                Liquidity providers deposit a pair coins and in return they collect <a class="link--default" href="https://www.minter.network/earn/lp-fees" target="_blank">fee rewards</a> paid by users who use that pool to swap between coins. On top of this fee some pools may have additional incentive programs: <a class="link--default" href="https://www.minter.network/earn/farm" target="_blank">farming</a> and  <a class="link--default" href="https://www.minter.network/earn/giveaway" target="_blank">giveaways</a>.
                            </template>
                            <template v-if="$i18n.locale === 'ru'">
                                todo ru text
                            </template>
                        </p>

                        <nuxt-link class="button button--main button--full u-mt-10" :to="pageUrl('add-liquidity')">
                            Provide liquidity
                        </nuxt-link>
                        <nuxt-link class="button button--main button--full u-mt-05" :to="pageUrl('remove-liquidity')">
                            Withdraw liquidity
                        </nuxt-link>
                        <a class="button button--ghost-main button--full u-mt-05" href="https://explorer.minter.network/pools" target="_blank">
                            Liquidity pools
                        </a>
                        <a class="button button--ghost-main button--full u-mt-05" href="https://explorer.minter.network/farming" target="_blank">
                            Farming programs
                        </a>
                        <a class="button button--ghost-main button--full u-mt-05" href="https://chainik.io/lottery/" target="_blank">
                            Giveaway programs
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <nuxt-child/>
    </div>
</template>
