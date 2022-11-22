<script>
import {getPortfolio} from '~/api/portfolio.js';
import {shortHashFilter} from '~/assets/utils.js';
import ModalButton from '~/components/base/ModalButton.vue';
import PortfolioBuyForm from '~/components/PortfolioBuyForm.vue';

export default {
    components: {
        ModalButton,
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
                        <p>Selling a portfolio will cause a deduction of 1% (Premium fee) and 10-40% (Success fee) on the profit gained. If no profit was made, then no Success fee is charged.</p>
                        <ModalButton class="u-mt-05">
                            <p>When selling a portfolio, a 1% Premium fee is charged from its total value, this commission remains with a user in the form of BEE locked in their Premium account.</p>
                            <p>The user is charged a Success fee from 10 to 40%, depending on the amount of profit received. If&nbsp;instead of profit, there is a loss, then the Success fee is not charged.</p>
                            <p>Success fee:</p>
                            <ul class="list-simple list-simple--small">
                                <li>10% (with profit up to 10%)</li>
                                <li>20% (with profit from 10% to 20%)</li>
                                <li>30% (with profit from 20% to 40%)</li>
                                <li>40% (if profit is more than 40%)</li>
                            </ul>
                        </ModalButton>
                    </template>
                    <template v-if="$i18n.locale === 'ru'">
                        <p>При продаже портфеля будет взиматься 1% Premium fee от общей суммы и 10-40% Success fee от полученной прибыли, в зависимости от ее размера. Если вместо прибыли был получен убыток, то Success fee не взимается.</p>
                        <ModalButton class="u-mt-05">
                            <p>При продаже портфеля взимается 1% Premium fee от его общей стоимости, эта комиссия остается у пользователя в виде BEE, заблокированного в его Premium-аккаунт.</p>
                            <p>С пользователя взимается Success fee от 10 до 40%, в зависимости от размера полученной прибыли. Если вместо прибыли, получен убыток, то Success fee не взимается.</p>
                            <p>Размер Success fee:</p>
                            <ul class="list-simple list-simple--small">
                                <li>10% (при прибыли до 10%)</li>
                                <li>20% (при прибыли от 10% до 20%)</li>
                                <li>30% (при прибыли от 20% до 40%)</li>
                                <li>40% (если прибыль больше 40%)</li>
                            </ul>
                        </ModalButton>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
