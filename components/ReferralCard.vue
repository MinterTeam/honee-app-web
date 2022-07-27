<script>
import {setupReferralProgram} from '~/api/referral.js';
import BaseLoader from '~/components/base/BaseLoader.vue';

export default {
    components: {
        BaseLoader,
    },
    data() {
        return {
            isLoading: false,
        };
    },
    methods: {
        activate(enable = true) {
            if (this.isLoading || !this.$store.state.referral.isActiveOffer) {
                return;
            }
            this.isLoading = true;
            setupReferralProgram(this.$store.getters.privateKey, enable)
                .then((refId) => {
                    this.$store.commit('referral/setRefId', enable ? refId : false);
                    this.isLoading = false;
                })
                .catch((error) => {
                    this.isLoading = false;
                });
        },
    },
};
</script>

<template>
    <div class="card card__content">
        <h2 class="u-h3 u-mb-10">{{ $td('Share and earn', 'referral.title') }}</h2>
        <p class="u-mb-10">
            <template v-if="!$store.state.referral.refId">
                {{ $td('Invite friends and get 10% of their BEE staking. You just need to activate special referral links for your wallet.', 'referral.description') }}
            </template>
            <template v-else>
                {{ $td('Invite friends and get 10% of their BEE staking. You have activated special referral links for your wallet. You can deactivate them any time', 'referral.description-activated') }}
            </template>
        </p>
        <div class="button-group">
            <button
                type="button"
                class="button button--main"
                :class="{'is-loading': isLoading}"
                @click="activate(!$store.state.referral.refId)"
            >
                <span class="button__content">
                    <template v-if="!$store.state.referral.refId">
                        {{ $td('Activate referral links', 'referral.activate-button') }}
                    </template>
                    <template v-else>
                        {{ $td('Deactivate referral links', 'referral.deactivate-button') }}
                    </template>
                </span>
                <BaseLoader class="button__loader" :isLoading="true"/>
            </button>
            <button
                v-if="$store.state.referral.isActiveOffer"
                type="button"
                class="button button--ghost"
                @click="$store.commit('referral/setIsActiveOffer', false)"
            >
                <template v-if="!$store.state.referral.refId">
                    {{ $td('I\'ll do it later', 'referral.postpone-offer') }}
                </template>
                <template v-else>
                    {{ $td('Hide', 'referral.hide-offer') }}
                </template>
            </button>
        </div>
    </div>
</template>
