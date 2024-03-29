<script>
import {getPortfolio} from '~/api/portfolio.js';
import {shortHashFilter} from '~/assets/utils.js';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import PortfolioHead from '~/components/PortfolioHead.vue';
import usePortfolioWallet from '~/composables/use-portfolio-wallet.js';
import {getBalance} from '~/api/explorer.js';

export default {
    components: {
        BaseAmountEstimation,
        PortfolioHead,
    },
    async asyncData({route, store, error}) {
        if (!route.params.id || !/^\d+$/.test(route.params.id)) {
            return error({status: 404, message: 'Page not found'});
        }
        try {
            const portfolio = await store.dispatch('portfolio/fetchConsumerPortfolio', route.params.id);
            const {getWallet} = usePortfolioWallet(store.getters.mnemonic);
            const portfolioWallet = getWallet(portfolio.id);
            const balanceResult = await getBalance(portfolioWallet.address);
            const balanceList = balanceResult.data.balances.filter((item) => item.amount > 0);

            return {
                portfolio,
                portfolioWallet,
                balanceList,
            };
        } catch (resError) {
            error(resError);
        }
    },
    data() {
        return {
            portfolio: null,
            portfolioWallet: null,
            balanceList: [],
        };
    },
    computed: {
        coinList() {
            return this.balanceList
                // .filter((item) => item.coin.symbol.indexOf('LP-') !== 0)
                .map((item) => {
                    return {
                        amount: item.amount,
                        id: item.coin.id,
                        symbol: item.coin.symbol,
                    };
                });
        },
        isOwnManaged() {
            return this.portfolio.owner === this.$store.getters.address;
        },
        consumerPortfolio() {
            return this.$store.getters['portfolio/consumerPortfolioMap'][this.portfolio?.id];
        },
    },
    methods: {
        shortHashFilter,
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card--invert">
            <div class="card__content card__content--medium">
                <PortfolioHead :portfolio="portfolio" :is-single-view="true"/>
                <p class="card__action-description u-text-break" v-if="portfolio.description">{{ portfolio.description }}</p>
            </div>

            <div class="card card--pop card--light-grey">
                <div class="card__content card__content--medium">
                    <div class="form-row">
                        <div class="information information--field">
                            <h3 class="information__title">{{ $td('Tokens', 'portfolio.manage-token-list-title') }}</h3>
                            <BaseAmountEstimation
                                v-for="coin in coinList"
                                :key="coin.symbol"
                                :coin="coin.symbol"
                                :amount="coin.amount"
                                format="pretty"
                            />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="u-grid u-grid--vertical-margin">
                            <div class="u-cell">
                                <nuxt-link class="button button--main button--full" :to="$i18nGetPreferredPath(`/portfolio/${portfolio.id}/buy`)">
                                    {{ $td('Buy more', 'portfolio.buy-more-button') }}
                                </nuxt-link>
                            </div>
                            <div class="u-cell u-cell--auto-grow" v-if="isOwnManaged">
                                <nuxt-link class="button button--ghost-main button--full" :to="$i18nGetPreferredPath(`/portfolio/${portfolio.id}/edit`)">
                                    {{ $td('Edit', 'portfolio.manage-edit-button') }}
                                </nuxt-link>
                            </div>
                            <div class="u-cell u-cell--auto-grow" v-if="consumerPortfolio">
                                <nuxt-link class="button button--ghost-main button--full" :to="$i18nGetPreferredPath(`/portfolio/${portfolio.id}/sell`)">
                                    {{ $td('Sell', 'portfolio.sell-button') }}
                                </nuxt-link>
                            </div>
                        </div>
                    </div>
                </div>


                <!--
                <div class="card__content card__content&#45;&#45;medium u-text-medium">
                    <h3 class="u-h5 u-mb-05">Terms & Conditions</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus. Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>
                </div>
                -->
            </div>
        </div>
    </div>
</template>
