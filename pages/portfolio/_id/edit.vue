<script>
import {getPortfolio} from '~/api/portfolio.js';
import PortfolioManageForm from '~/components/PortfolioManageForm.vue';

export default {
    components: {
        PortfolioManageForm,
    },
    asyncData({route, store, error}) {
        if (!route.params.id || !/^\d+$/.test(route.params.id)) {
            return error({status: 404, message: 'Page not found'});
        }
        return getPortfolio(route.params.id)
            .then((portfolio) => {
                if (portfolio.owner !== store.getters.address) {
                    return error({
                        status: 403,
                        message: `You are not an owner of portfolio #${route.params.id}`,
                    });
                }
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
                <div class="card__action-title-type">#{{ portfolio.id }}</div>
                <h1 class="card__action-title-value">{{ $td('Edit portfolio', 'portfolio.manage-edit-title') }}</h1>
            </div>

            <PortfolioManageForm :portfolio="portfolio"/>
        </div>
    </div>
</template>
