<script>
import ActionMetagardenBuySpot from '~/components/ActionMetagardenBuySpot.vue';

export default {
    components: {
        ActionMetagardenBuySpot,
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
                <h1 class="card__action-title-value">{{ $td('Buy metagarden mining spots', 'metagarden.title') }}</h1>
                <p class="card__action-description u-mt-05">
                    {{ $td('One spot costs $80 or 1000 METAGARDEN tokens', 'metagarden.description') }}
                </p>
            </div>

            <div class="card card--pop card--light-grey">
                <ActionMetagardenBuySpot
                    class="card__content card__content--medium"
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
