<script>
import {getPortfolio} from '~/api/portfolio.js';
import {shortHashFilter} from '~/assets/utils.js';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import AuthButtons from '~/components/layout/AuthButtons.vue';
import PortfolioHead from '~/components/PortfolioHead.vue';

export default {
    layout(context) {
        return context.store.getters.isAuthorized ? 'default' : 'splash-index';
    },
    components: {
        BaseAmountEstimation,
        AuthButtons,
        PortfolioHead,
    },
    asyncData({route, store, error}) {
        if (!route.params.id || !/^\d+$/.test(route.params.id)) {
            return error({status: 404, message: 'Page not found'});
        }

        store.dispatch('portfolio/fetchConsumerPortfolioList');

        return getPortfolio(route.params.id)
            .then((portfolio) => {
                return {
                    portfolio,
                };
            })
            .catch((resError) => error(resError));
    },
    data() {
        return {
            portfolio: null,
        };
    },
    computed: {
        coinList() {
            return this.portfolio.coins.map((item) => {
                return {
                    ...item,
                    symbol: this.$store.state.explorer.coinMapId[item.id]?.symbol,
                };
            });
        },
        isOwn() {
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
    <div class="u-section--only u-container u-container--small">
        <div class="card card--invert" v-if="portfolio">
            <div class="card__content card__content--medium">
                <PortfolioHead :portfolio="portfolio"/>
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
                                :amount="coin.allocation"
                                unit="%"
                                format="exact"
                            />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="u-grid u-grid--vertical-margin" v-if="$store.getters.isAuthorized">
                            <div class="u-cell">
                                <nuxt-link class="button button--main button--full" :to="$i18nGetPreferredPath(`/portfolio/${portfolio.id}/buy`)">
                                    {{ $td('Buy', 'portfolio.buy-button') }}
                                </nuxt-link>
                            </div>
                            <div class="u-cell u-cell--auto-grow" v-if="isOwn">
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
                        <AuthButtons v-else button-class="button--main"/>
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
