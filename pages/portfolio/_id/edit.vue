<script>
import {getPortfolio} from '~/api/portfolio.js';
import PortfolioManageForm from '~/components/PortfolioManageForm.vue';

export default {
    components: {
        PortfolioManageForm,
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
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card--invert">
            <div class="card__content card__content--medium">
                <h1 class="card__action-title-value">{{ $td('Edit portfolio', 'portfolio.manage-edit-title') }}</h1>
                <p class="card__action-description u-mt-05">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus.</p>
            </div>

            <div class="card card--pop card--light-grey">
                <PortfolioManageForm :portfolio="portfolio" class="card__content card__content--medium"/>

                <div class="card__content card__content--medium u-text-medium">
                    <h3 class="u-h5 u-mb-05">Terms & Conditions</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus. Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>
                </div>
            </div>
        </div>
    </div>
</template>
