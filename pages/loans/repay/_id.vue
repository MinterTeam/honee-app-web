<script>
import LoansRepayForm from '~/components/LoansRepayForm.vue';

export default {
    layout(context) {
        return context.store.state.isMetagarden ? 'metagarden' : 'default';
    },
    components: {
        LoansRepayForm,
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
                <h1 class="card__action-title-value">{{ $td('Repay', 'todo') }}</h1>
            </div>

            <div class="card card--pop card--light-grey">
                <LoansRepayForm
                    :id="$route.params.id"
                    class="card__content card__content--medium"
                    @success-modal-close="$router.push($i18nGetPreferredPath('/loans'))"
                />


<!--                <div class="card__content card__content&#45;&#45;medium u-text-medium">
                    <h3 class="u-h5 u-mb-05">Terms & Conditions</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus. Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>
                </div>-->
            </div>
        </div>
    </div>
</template>
