<script>
import {setupReferralProgram, getReferralList} from '~/api/referral.js';
import {REF_ID_QUERY} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import BaseButtonCopyIcon from '~/components/base/BaseButtonCopyIcon.vue';
import Modal from '~/components/base/Modal.vue';

export default {
    components: {
        BaseLoader,
        BaseButtonCopyIcon,
        Modal,
    },
    props: {
        buttonClass: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            serverError: '',
            isLoading: false,
            isConfirmModalVisible: false,
            isSuccessModalVisible: false,
            referralList: null,
        };
    },
    computed: {
        refUrl() {
            return window.location.origin + this.$route.fullPath;
        },
    },
    watch: {
        isConfirmModalVisible: {
            handler(newVal) {
                if (newVal) {
                    this.fetchReferralList();
                }
            },
        },
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
        fetchReferralList() {
            getReferralList(this.$store.getters.address)
                .then((list) => {
                    this.referralList = list;
                });
        },
    },
};
</script>

<template>
    <div>
        <button
            type="button"
            class=""
            :class="buttonClass"
            @click="isConfirmModalVisible = true"
        >
            <img class="u-mr-05" src="/img/icon-share-earn.svg" alt="" role="presentation" width="24" height="24">
            {{ $td('Share & Earn', 'referral.invite-friend') }}
        </button>

        <Modal class="u-text-center u-text-medium" :isOpen.sync="isConfirmModalVisible">
            <img class="u-image u-mb-10" src="/img/icon-share.svg" alt="" role="presentation" width="96" height="96">
            <h2 class="u-h3 u-mb-10">{{ $td('Earn with Honee', 'referral.title') }}</h2>
            <p class="u-mb-10">
                <template v-if="!$store.state.referral.refId">
                    <template v-if="$i18n.locale === 'en'">
                        Invite friends and get <strong>instant rewards</strong> when they stake cryptos in the wallet. You just need to activate a special referral link for your wallet. <a href="https://honee.app/referral-program" class="link--default" target="_blank">Learn more about the referral program</a>.
                    </template>
                    <template v-if="$i18n.locale === 'ru'">
                        Приглашайте друзей в Honee и <strong>получайте награды</strong> от сумм их стейкинга! Для этого просто активируйте специальную реферальную ссылку для своего кошелька. <a href="https://honee.app/ru/referral-program" class="link--default" target="_blank">Подробнее о реферальной программе</a>.
                    </template>
                </template>
                <template v-else>
                    <template v-if="$i18n.locale === 'en'">
                        Invite friends and get instant rewards when they stake cryptos in the wallet (<a href="https://honee.app/referral-program" class="link--default" target="_blank">details</a>). To share, just copy the link below or from the address bar in your browser on any page of Honee.
                    </template>
                    <template v-if="$i18n.locale === 'ru'">
                        Приглашайте друзей в Honee и получайте награды от сумм их стейкинга (<a href="https://honee.app/ru/referral-program" class="link--default" target="_blank">подробнее</a>). Скопируйте ссылку ниже или из адресной строки вашего браузера на любой странице Honee и поделитесь ею с друзьями.
                    </template>
                </template>
            </p>

            <div class="h-field u-mt-15" v-if="$store.state.referral.refId">
                <div class="h-field__content">
                    <div class="h-field__input h-field__input--medium is-not-empty">{{ refUrl }}</div>
                </div>
                <div class="h-field__aside h-field__aside--with-icon">
                    <BaseButtonCopyIcon class="" :copy-text="refUrl"/>
                </div>
            </div>

            <p class="u-text-medium u-mt-10" v-if="$store.state.referral.refId && referralList">
                {{ $td(`You currently invited ${referralList.length} friends`, 'referral.invited-list') }}
            </p>

            <div class="form__error u-mt-15" v-if="serverError">{{ serverError }}</div>

            <button
                type="button"
                class="button button--full"
                :class="[
                    isLoading ? 'is-loading' : '',
                    $store.state.referral.refId ? 'button--ghost-main' : 'button--main',
                    serverError ? 'u-mt-10' : 'u-mt-15',
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
                <p class="u-mb-15">{{ $td('To share, just copy the link from the address bar in your browser on any page of Honee.', 'referral.success-description') }}</p>
            </template>
            <template v-else>
                <h2 class="u-h3 u-mb-05">{{ $td('Referral link deactivated', 'referral.success-deactivate-title') }}</h2>
                <p class="u-mb-15">{{ $td('The referral link has been removed from the address bar in your browser. You can reactivate it at any time.', 'referral.success-deactivate-description') }}</p>
            </template>

            <div class="h-field u-mb-10" v-if="$store.state.referral.refId">
                <div class="h-field__content">
                    <div class="h-field__input h-field__input--medium is-not-empty">{{ refUrl }}</div>
                </div>
                <div class="h-field__aside h-field__aside--with-icon">
                    <BaseButtonCopyIcon class="" :copy-text="refUrl"/>
                </div>
            </div>

            <button class="button button--ghost button--full" type="button" @click="isSuccessModalVisible = false">
                {{ $td('Close', 'form.success-close-button') }}
            </button>
        </Modal>
    </div>
</template>
