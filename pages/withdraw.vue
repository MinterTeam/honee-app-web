<script>
import {HUB_CHAIN_DATA} from '~/assets/variables.js';
import HubWithdrawForm from '~/components/HubWithdrawForm.vue';
import HubWithdrawTxList from '~/components/HubWithdrawTxList.vue';

export default {
    layout(context) {
        return context.store.state.isMetagarden ? 'metagarden' : 'default';
    },
    components: {
        HubWithdrawForm,
        HubWithdrawTxList,
    },
    data() {
        return {
        };
    },
    computed: {
        networkName() {
            return HUB_CHAIN_DATA[this.$route.query.network]?.name;
        },
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card--invert">
            <div class="card__content card__content--medium">
                <h1 class="card__action-title-value">{{ $td('Withdraw', 'hub.withdraw-title') }}</h1>
                <p class="card__action-description u-mt-05">
                    <template v-if="networkName">
                        {{ $td(`Send coins to ${networkName}`, 'hub.withdraw-description-network', {network: networkName}) }}
                    </template>
                    <template v-else>{{ $td('Send coins to another network', 'hub.withdraw-description') }}</template>
                </p>
            </div>

            <div class="card card--pop card--light-grey">
                <HubWithdrawForm
                    class="card__content card__content--medium"
                    @success-modal-close="$router.push(getDashboardUrl())"
                />
                <HubWithdrawTxList class="card__content card__content--medium"/>


                <!--                <div class="card__content card__content&#45;&#45;medium u-text-medium">
                                    <h3 class="u-h5 u-mb-05">Terms & Conditions</h3>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus. Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>
                                </div>-->
            </div>
        </div>
    </div>
</template>
