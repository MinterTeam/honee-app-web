<script>
import {getPortfolio} from '~/api/portfolio.js';
import {shortHashFilter} from '~/assets/utils.js';
import PortfolioBuyForm from '~/components/PortfolioBuyForm.vue';

export default {
    components: {
        PortfolioBuyForm,
    },
    asyncData({route, error}) {
        if (!route.params.id || !/^\d+$/.test(route.params.id)) {
            return error({status: 404, message: 'Page not found'});
        }
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
                <div class="card__action-title-type">#{{ portfolio.id }}</div>
                <h1 class="card__action-title-value">{{ $td('Buy portfolio', 'portfolio.buy-title') }}</h1>
            </div>

            <div class="card card--pop card--light-grey">
                <PortfolioBuyForm
                    class="card__content card__content--medium"
                    :portfolio="portfolio"
                    @success-modal-close="$router.push(getDashboardUrl())"
                />


                <div class="card__content card__content--medium u-text-medium">
                    <h3 class="u-h5 u-mb-05">{{ $td('Terms', 'common.terms') }}</h3>
                    <template v-if="$i18n.locale === 'en'">
                        <p>Selling portfolio will cause deducting 1% premium fee and 10-40% success fee on gained profit</p>
                    </template>
                    <template v-if="$i18n.locale === 'ru'">
                        <p>При продаже портфеля будет взиматься 1% Premium fee и 10-40% Success fee от полученной прибыли</p>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
