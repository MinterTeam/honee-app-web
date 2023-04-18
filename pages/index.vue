<script>
import cardList from '~/data/cards.js';
import Card from '~/components/Card.vue';
import CardPremium from '~/components/CardPremium.vue';
import CardSwHold from '~/components/CardSwHold.vue';
import AddressAssets from '~/components/AddressAssets.vue';
import InvestmentList from '~/components/InvestmentList.vue';
import PortfolioLeaderboard from '~/components/PortfolioLeaderboard.vue';
import PortfolioList from '~/components/PortfolioList.vue';

const BASE_CARD = {
    DELEGATION: 'delegation',
    LIQUIDITY: 'liquidity',
    // FARM: 'farm',
    // LOTTERY: 'lottery',
};

const BEE_CARD_LIST = [
    '/swap/BEE',
    '/stake/19',
    '/farm/BEE/USDTE',
    '/farm/BEE/USDTBSC',
];

/** @type {CardListItemRaw} */
const TWITTER_CARD_HEAD = {
    icon: '/img/logo-twitter.svg',
    caption: 'Share to earn',
    title: 'BEE',
    stats: {
        caption: 'Per action',
        value: '1-500 BEE',
    },
    ru: {
        stats: {
            caption: 'За действие',
        },
    },
};

export default {
    BASE_CARD,
    TWITTER_CARD_HEAD,
    cardList,
    components: {
        Card,
        CardPremium,
        CardSwHold,
        AddressAssets,
        InvestmentList,
        PortfolioLeaderboard,
        PortfolioList,
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
            portfolioListCopied: [],
            portfolioListManaged: [],
            isShowOtherEarnOptions: false,
        };
    },
    computed: {
        earnBeeList() {
            return this.$options.cardList.earn.cards.filter((card) => {
                return BEE_CARD_LIST.includes(card.action);
            });
        },
        earnOtherList() {
            return this.$options.cardList.earn.cards.filter((card) => {
                const isBee = this.earnBeeList.some((beeCard) => {
                    return beeCard.action === card.action;
                });
                return !isBee;
            });
        },
        cardList() {
            let result = {};
            // transform cards
            for (const categorySlug in this.$options.cardList) {
                result[categorySlug] = this.$options.cardList[categorySlug].cards;
            }
            // add base cards
            // result.earn.push(BASE_CARD.DELEGATION);
            // result.earn.push(BASE_CARD.LIQUIDITY);
            // result.earn.push(BASE_CARD.FARM);
            // result.win.push(BASE_CARD.LOTTERY);

            return result;
        },
    },
    methods: {
        capitalize(value) {
            return value[0].toUpperCase() + value.substring(1);
        },
    },
};
</script>


<template>
    <div class="u-container--large">
        <AddressAssets/>

        <!-- BEE earning options -->
        <div class="u-mt-25">
            <h2 class="u-h2 u-mb-15">
                {{ $td('Earn with BEE', `action.category-bee`) }}
            </h2>
            <div class="u-grid u-grid--vertical-margin">
                <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell">
                    <CardPremium/>
                </div>
                <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell">
                    <CardSwHold class="card--extended-card card--bee-hold" coin="BEE" :is-small="true"/>
                </div>
                <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="card in earnBeeList" :key="card.action">
                    <Card :card="card" v-if="card.action"/>
                </div>
                <!--<div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell">
                    <div class="card card--action card--invert card--twitter card__content--small">
                        <CardHead :card="$options.TWITTER_CARD_HEAD"/>
                        <p class="card__action-description">{{ $td('Earn BEE by retweeting and liking on Twitter! Proceed to Telegram-bot for further instructions.', 'index.card-twitter-description') }}</p>
                        <a class="button button--full u-mt-10" href="https://t.me/MinterContestBot" target="_blank">{{ $td('Share to earn', 'index.card-twitter-button') }}</a>
                    </div>
                </div>-->
            </div>
        </div>

        <InvestmentList
            class="u-mt-25"
        />

        <button v-if="!isShowOtherEarnOptions" type="button" class="button button--ghost-main button--full u-mt-25" @click="isShowOtherEarnOptions = true">
            {{ $td('Show other options', 'index.show-all-earn-options-link') }}
        </button>

        <!-- Other -->
        <template v-if="isShowOtherEarnOptions">
            <!-- earning options -->
            <div class="u-mt-25">
                <h2 class="u-h2 u-mb-15">
                    {{ $td($options.cardList.earn.title, `action.category-earn`) }}
                </h2>
                <div class="u-grid u-grid--vertical-margin">
                    <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell">
                        <CardSwHold coin="METAGARDEN" :is-small="true"/>
                    </div>
                    <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="card in earnOtherList" :key="card.action">
                        <Card :card="card"/>
                    </div>
                </div>
            </div>

            <PortfolioList class="u-mt-25" limit="3"/>
            <nuxt-link class="button button--ghost-main button--full u-mt-20" :to="$i18nGetPreferredPath('/portfolio')">
                {{ $td('View all portfolios', 'portfolio.view-all') }}
            </nuxt-link>
            <!--
            <nuxt-link class="button button&#45;&#45;ghost-main button&#45;&#45;full u-mt-20" v-show="portfolioListCopied.length > 3" :to="$i18nGetPreferredPath('/portfolio/copied')">
                {{ $td('View all copied portfolios', 'portfolio.view-all-copied') }}
            </nuxt-link>
            -->



        <!--<div class="u-mt-25" v-for="(categoryCards, categorySlug) in cardList" :key="categorySlug">
            <h2 class="u-h2 u-mb-15">
                {{ $td(capitalize($options.cardList[categorySlug].title || categorySlug), `action.category-${categorySlug.toLowerCase()}`) }}
            </h2>
            <div class="u-grid u-grid--vertical-margin">
                <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell" v-for="card in categoryCards" :key="card.action || card">
                    <Card :card="card" v-if="card.action"/>

                    <div class="card card__content--small" v-if="card === $options.BASE_CARD.DELEGATION">
                        <h3 class="card__action-title-value u-mb-05">{{ $td('Delegation', 'index.delegation') }}</h3>
                        <p class="">{{ $td('Bonding your BIP or custom coins to a network validator and getting rewards (portion of block rewards + transaction fees). The returns are shared among all delegators proportionally to their stake, minus validator’s fee.', 'index.delegation-desc') }}</p>

                        <nuxt-link class="button button--main button--full u-mt-10" :to="getDashboardUrl('delegate')">
                            {{ $td('Delegate', 'index.delegate') }}
                        </nuxt-link>
                        <nuxt-link class="button button--main button--full u-mt-05" :to="getDashboardUrl('unbond')">
                            {{ $td('Unbond', 'index.withdraw-unbond') }}
                        </nuxt-link>
                        <a class="button button--ghost-main button--full u-mt-05" href="https://chainik.io/validators" target="_blank">
                            {{ $td('Validators', 'index.validators') }}
                        </a>
                    </div>

                    <div class="card card__content&#45;&#45;small" v-if="card === $options.BASE_CARD.LIQUIDITY">
                        <h3 class="card__action-title-value u-mb-05">{{ $td('Providing liquidity', 'index.providing-liquidity') }}</h3>
                        <p class="">
                            <template v-if="$i18n.locale === 'en'">
                                Liquidity providers deposit both coins in a pair and in return, collect <a class="link--default" href="https://www.minter.network/earn/lp-fees" target="_blank">fee rewards</a> paid by traders who use that pool to make swaps. On top of this fee, some pools may have additional incentive programs such as <a class="link--default" href="https://www.minter.network/earn/farm" target="_blank">farming</a> and <a class="link--default" href="https://www.minter.network/earn/giveaway" target="_blank">giveaways</a>.
                            </template>
                            <template v-if="$i18n.locale === 'ru'">
                                Поставщики ликвидности размещают обе монеты в паре и взамен собирают <a class="link--default" href="https://www.minter.network/ru/earn/lp-fees" target="_blank">комиссию</a>, оплачиваемую трейдерами, которые делают обмены в этом пуле. Вдобавок в некоторых пулах могут быть дополнительные программы стимулирования, такие как <a class="link--default" href="https://www.minter.network/ru/earn/farm" target="_blank">доходное фермерство</a> и <a class="link--default" href="https://www.minter.network/ru/earn/giveaway" target="_blank">лотереи</a>.
                            </template>
                        </p>

                        <nuxt-link class="button button--main button--full u-mt-10" :to="getDashboardUrl('add-liquidity')">
                            {{ $td('Provide liquidity', 'index.provide-liquidity') }}
                        </nuxt-link>
                        <nuxt-link class="button button--main button--full u-mt-05" :to="getDashboardUrl('remove-liquidity')">
                            {{ $td('Withdraw liquidity', 'index.withdraw-liquidity') }}
                        </nuxt-link>
                        <a class="button button--ghost-main button--full u-mt-05" href="https://explorer.minter.network/pools" target="_blank">
                            {{ $td('Liquidity pools', 'index.liquidity-pools') }}
                        </a>
                        <a class="button button--ghost-main button--full u-mt-05" href="https://explorer.minter.network/farming" target="_blank">
                            {{ $td('Farming programs', 'index.farming-programs') }}
                        </a>
                        <a class="button button--ghost-main button--full u-mt-05" href="https://chainik.io/lottery/" target="_blank">
                            {{ $td('Giveaway programs', 'index.giveaway-programs') }}
                        </a>
                    </div>
                </div>

                <div class="u-cell u-cell--medium--1-2 u-cell--large--1-3 card-wrap-cell">
                    <div class="card card--action card--invert card--twitter card__content--small">
                        <CardHead :card="$options.TWITTER_CARD_HEAD"/>
                        <p class="card__action-description">{{ $td('Earn BEE by retweeting and liking on Twitter! Proceed to Telegram-bot for further instructions.', 'index.card-twitter-description') }}</p>
                        <a class="button button--full u-mt-10" href="https://t.me/MinterContestBot" target="_blank">{{ $td('Share to earn', 'index.card-twitter-button') }}</a>
                    </div>
                </div>
            </div>
        </div>-->

        <PortfolioLeaderboard class="u-mt-25" limit="5"/>

        <!--<h2 class="u-h2 u-mt-25 u-mb-15">
            {{ $td('Portfolio Battle', `portfolio.battle-title`) }}
        </h2>
        <div class="card card__content">
            <PortfolioBattleTable limit="5"/>

            <div class="u-text-right u-mt-15">
                <nuxt-link class="link--default" :to="$i18nGetPreferredPath('/portfolio/battle')">
                    {{ $td('View all', 'portfolio.leaderboard-view-all') }}
                </nuxt-link>
            </div>
        </div>-->

        <PortfolioList class="u-mt-25" type="managed" @update:portfolio-list="portfolioListManaged = $event"/>
        <nuxt-link v-if="portfolioListManaged.length === 0" class="button button--ghost-main button--full u-mt-20" :to="$i18nGetPreferredPath('/portfolio/new')">
            + {{ $td('Create portfolio', 'portfolio.create-new-link') }}
        </nuxt-link>

        </template>
    </div>
</template>
