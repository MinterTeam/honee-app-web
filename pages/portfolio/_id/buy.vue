<script>
import {getPortfolio} from '~/api/portfolio.js';
import {shortHashFilter} from '~/assets/utils.js';
import PortfolioBuyForm from '~/components/PortfolioBuyForm.vue';

export default {
    components: {
        PortfolioBuyForm,
    },
    asyncData({route, error}) {
        if (!route.params.id) {
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
                <PortfolioBuyForm :portfolio="portfolio" class="card__content card__content--medium"/>


<!--                <div class="card__content card__content&#45;&#45;medium u-text-medium">
                    <h3 class="u-h5 u-mb-05">Terms & Conditions</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus. Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>
                </div>-->
            </div>
        </div>
    </div>
</template>
