<script>
import {SPOT_DATA} from '~/assets/variables.js';
import ActionMetagardenBuySpot from '~/components/ActionMetagardenBuySpot.vue';

export const SPOT_PRICE_USD = SPOT_DATA.FARMER.priceUsd;
export const SPOT_MIN_AMOUNT = SPOT_DATA.FARMER.minAmount;

export default {
    SPOT_PRICE_USD,
    SPOT_MIN_AMOUNT,
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
                <h1 class="card__action-title-value">{{ $td('Buy Farmers', 'meganet.buy-farmer-title') }}</h1>
                <p class="card__action-description u-mt-05">
                    {{ $td(`The cost of 1 Farmer is $${$options.SPOT_PRICE_USD}. You can buy from ${$options.SPOT_MIN_AMOUNT} Farmer.`, 'meganet.buy-farmers-description', {priceUsd: $options.SPOT_PRICE_USD}) }}
                </p>
            </div>

            <ActionMetagardenBuySpot
                type="FARMER"
                class="card card--pop card--light-grey"
                @success-modal-close="$router.push($getDashboardUrl())"
            />


            <!--                <div class="card__content card__content&#45;&#45;medium u-text-medium">
                                <h3 class="u-h5 u-mb-05">Terms & Conditions</h3>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus. Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>
                            </div>-->
        </div>
    </div>
</template>
