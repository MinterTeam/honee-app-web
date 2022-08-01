<script>
import {setupReferralProgram} from '~/api/referral.js';
import {REF_ID_QUERY} from '~/assets/variables.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';
import {getErrorText} from '~/assets/server-error.js';

export default {
    components: {
        BaseLoader,
        Modal,
    },
    data() {
        return {
            serverError: '',
            isLoading: false,
            isSuccessModalVisible: false,
        };
    },
    methods: {
        setup(enable = true) {
            if (this.isLoading) {
                return;
            }
            this.isLoading = true;
            this.serverError = '';
            setupReferralProgram(this.$store.getters.privateKey, enable)
                .then((refId) => {
                    this.$store.commit('referral/setRefId', enable ? refId : false);
                    this.isLoading = false;
                    this.isSuccessModalVisible = true;
                    const query = JSON.parse(JSON.stringify(this.$route.query));
                    if (enable) {
                        query[REF_ID_QUERY] = refId;
                    } else {
                        delete query[REF_ID_QUERY];
                    }
                    this.$router.replace({
                        path: this.$route.path,
                        query,
                    });
                })
                .catch((error) => {
                    this.serverError = getErrorText(error);
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
                class="button"
                :class="[
                    isLoading ? 'is-loading' : '',
                    $store.state.referral.refId ? 'button--ghost-main' : 'button--main',
                ]"
                @click="setup(!$store.state.referral.refId)"
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
        <div class="form__error" v-if="serverError">{{ serverError }}</div>

        <Modal class="u-text-center" :isOpen.sync="isSuccessModalVisible">
            <template v-if="$store.state.referral.refId">
                <img class="u-image u-mb-10" src="/img/icon-activated.svg" alt="" role="presentation" width="96" height="96">
                <h2 class="u-h3 u-mb-05">{{ $td('Link activated', 'referral.success-title') }}</h2>
                <p class="u-text-medium">{{ $td('To share just copy the link from the address bar in your browser on any page of Honee App.', 'referral.success-description') }}</p>
            </template>
            <template v-else>
                <h2 class="u-h3 u-mb-05">{{ $td('Link deactivated', 'referral.success-deactivate-title') }}</h2>
                <p class="u-text-medium">{{ $td('Link removed from the address bar in your browser. You can reactivate it any time later', 'referral.success-deactivate-description') }}</p>
            </template>

            <button class="button button--ghost button--full u-mt-15" type="button" @click="isSuccessModalVisible = false">
                {{ $td('Close', 'form.success-close-button') }}
            </button>
        </Modal>
    </div>
</template>
