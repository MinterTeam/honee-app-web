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
            isConfirmModalVisible: false,
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
                    this.isConfirmModalVisible = false;
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
    <div>
        <button
            type="button"
            class="button button--gradient"
            @click="isConfirmModalVisible = true"
        >
            {{ $td('Invite a friend and get rewarded', 'referral.invite-friend') }}
        </button>

        <Modal class="u-text-center u-text-medium" :isOpen.sync="isConfirmModalVisible">
            <img class="u-image u-mb-10" src="/img/icon-share.svg" alt="" role="presentation" width="96" height="96">
            <h2 class="u-h3 u-mb-10">{{ $td('Earn with Honee', 'referral.title') }}</h2>
            <p class="u-mb-10">
                <template v-if="!$store.state.referral.refId">
                    <template v-if="$i18n.locale === 'en'">
                        Invite friends and get <strong>10% of their BEE</strong> staking rewards. You just need to activate special referral link for your wallet.
                    </template>
                    <template v-if="$i18n.locale === 'ru'">
                        Приглашайте друзей и <strong>получайте 10% BEE</strong> от их стейкинг наград. Для этого просто активируйте специальные реферальные ссылки для своего кошелька.
                    </template>
                </template>
                <template v-else>
                    {{ $td('Invite friends and get 10% of their BEE staking. To share just copy the link from the address bar in your browser on any page of Honee App.', 'referral.description-activated') }}
                </template>
            </p>

            <div class="form__error" v-if="serverError">{{ serverError }}</div>

            <button
                type="button"
                class="button button--full u-mt-15"
                :class="[
                    isLoading ? 'is-loading' : '',
                    $store.state.referral.refId ? 'button--ghost-main' : 'button--main',
                ]"
                @click="setup(!$store.state.referral.refId)"
            >
                <span class="button__content">
                    <template v-if="!$store.state.referral.refId">
                        {{ $td('Activate referral link', 'referral.activate-button') }}
                    </template>
                    <template v-else>
                        {{ $td('Deactivate referral link', 'referral.deactivate-button') }}
                    </template>
                </span>
                <BaseLoader class="button__loader" :isLoading="true"/>
            </button>
            <button class="button button--ghost button--full u-mt-10" type="button" @click="isConfirmModalVisible = false">
                {{ $td('Close', 'form.success-close-button') }}
            </button>
        </Modal>


        <Modal class="u-text-center u-text-medium" :isOpen.sync="isSuccessModalVisible">
            <template v-if="$store.state.referral.refId">
                <img class="u-image u-mb-10" src="/img/icon-activated.svg" alt="" role="presentation" width="96" height="96">
                <h2 class="u-h3 u-mb-05">{{ $td('Referral link activated', 'referral.success-title') }}</h2>
                <p class="u-text-medium">{{ $td('To share, just copy the link from the address bar in your browser on any page of Honee App.', 'referral.success-description') }}</p>
            </template>
            <template v-else>
                <h2 class="u-h3 u-mb-05">{{ $td('Referral link deactivated', 'referral.success-deactivate-title') }}</h2>
                <p class="">{{ $td('Referral link removed from the address bar in your browser. You can reactivate it at any time.', 'referral.success-deactivate-description') }}</p>
            </template>

            <button class="button button--ghost button--full u-mt-15" type="button" @click="isSuccessModalVisible = false">
                {{ $td('Close', 'form.success-close-button') }}
            </button>
        </Modal>
    </div>
</template>
