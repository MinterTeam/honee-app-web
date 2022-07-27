<script>
import cardList from '~/content/card-list.js';
import Card from '~/components/Card.vue';
import AddressAssets from '~/components/AddressAssets.vue';
import ReferralCard from '~/components/ReferralCard.vue';

const BASE_CARD = {
    DELEGATION: 'delegation',
    LIQUIDITY: 'liquidity',
    // FARM: 'farm',
    // LOTTERY: 'lottery',
};

export default {
    BASE_CARD,
    cardList,
    components: {
        Card,
        AddressAssets,
        ReferralCard,
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
    <div>
        <AddressAssets/>

        <ReferralCard v-if="$store.state.referral.isActiveOffer" class="u-mt-25"/>

        <div class="u-mt-25" v-for="(categoryCards, categorySlug) in cardList" :key="categorySlug">
            <h2 class="dashboard__category-title u-mb-15">
                <img class="dashboard__category-icon" :src="`/img/icon-category-${categorySlug}.svg`" alt="" role="presentation">
                <span>{{ $td(capitalize($options.cardList[categorySlug].title || categorySlug), `action.category-${categorySlug.toLowerCase()}`) }}</span>
            </h2>
            <div class="u-grid u-grid--vertical-margin">
                <div class="u-cell u-cell--medium--1-2 card-wrap-cell" v-for="card in categoryCards" :key="card.action || card">
                    <Card :card="card" v-if="card.action"/>

                    <!--<div class="card card__content--small" v-if="card === $options.BASE_CARD.DELEGATION">
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
                    </div>-->

                    <!--<div class="card card__content--small" v-if="card === $options.BASE_CARD.LIQUIDITY">
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
                    </div>-->
                </div>
            </div>
        </div>

        <ReferralCard v-if="!$store.state.referral.isActiveOffer" class="u-mt-25"/>

        <nuxt-child/>
    </div>
</template>
