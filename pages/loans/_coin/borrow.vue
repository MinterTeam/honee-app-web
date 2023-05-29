<script>
import LoansBorrowForm from '~/components/LoansBorrowForm.vue';

export default {
    layout(context) {
        return context.store.getters.isMetagarden ? 'metagarden' : 'default';
    },
    components: {
        LoansBorrowForm,
    },
    data() {
        return {
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
                <h1 class="card__action-title-value">{{ $td('Receive a loan', 'todo') }}</h1>
                <p class="card__action-description u-mt-05">
                    {{ $td(`This service lets you quickly get BNB by putting up your ${$route.params.coin} tokens as collateral.`, 'todo', {coin: $route.params.coin}) }}
                </p>
            </div>

            <div class="card card--pop card--light-grey">
                <LoansBorrowForm
                    class="card__content card__content--medium"
                    :collateral-coin="$route.params.coin"
                    @success-modal-close="$router.push($getDashboardUrl())"
                />


<!--                <div class="card__content card__content&#45;&#45;medium u-text-medium">
                    <h3 class="u-h5 u-mb-05">Terms & Conditions</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus. Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>
                </div>-->
            </div>
        </div>
    </div>
</template>
