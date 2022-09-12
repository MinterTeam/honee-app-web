<script>
import PortfolioSellForm from '~/components/PortfolioSellForm.vue';

export default {
    components: {
        PortfolioSellForm,
    },
    asyncData({route, store, error}) {
        if (!route.params.id || !/^\d+$/.test(route.params.id)) {
            return error({status: 404, message: 'Page not found'});
        }
        return store.dispatch('portfolio/fetchConsumerPortfolio', route.params.id)
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
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card--invert">
            <div class="card__content card__content--medium">
                <h1 class="card__action-title-value">{{ $td('Sell portfolio', 'portfolio.sell-title') }}</h1>
            </div>

            <div class="card card--pop card--light-grey">
                <PortfolioSellForm
                    class="card__content card__content--medium"
                    :portfolio="portfolio"
                    @success-modal-close="$router.push(getDashboardUrl())"
                />


<!--                <div class="card__content card__content&#45;&#45;medium u-text-medium">
                    <h3 class="u-h5 u-mb-05">Terms & Conditions</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus. Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>
                </div>-->
            </div>
        </div>
    </div>
</template>
