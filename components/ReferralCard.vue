<script>
import {setupReferralProgram, getReferralList} from '~/api/referral.js';
import {REF_ID_QUERY, SUBAPP, IS_SUBAPP_MEGACHAIN} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {pretty} from '~/assets/utils.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import BaseButtonCopyIcon from '~/components/base/BaseButtonCopyIcon.vue';
import Modal from '~/components/base/Modal.vue';

export default {
    SUBAPP,
    IS_SUBAPP_MEGACHAIN,
    components: {
        BaseLoader,
        BaseButtonCopyIcon,
        Modal,
    },
    props: {
        isModalButton: {
            type: Boolean,
            default: true,
        },
        buttonClass: {
            type: String,
            default: '',
        },
    },
    async fetch() {
        if (!this.isModalButton) {
            this.fetchReferralList();
        }
        if (IS_SUBAPP_MEGACHAIN) {
            if (!this.$store.state.referral.refId) {
                await this.setup(true);
            }
            // return this.fetchReferralBonus();
        }
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
        referralCount() {
            // megachain program is multilevel and invites from all levels needed
            return IS_SUBAPP_MEGACHAIN
                ? this.$store.state.referral.referralInviteCount
                : (this.referralList?.length || 0);
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
        pretty,
        setup(enable = true) {
            if (this.isLoading) {
                return;
            }
            this.isLoading = true;
            this.serverError = '';
            return setupReferralProgram(this.$store.getters.privateKey, enable)
                .then((refId) => {
                    this.$store.commit('referral/setRefId', enable ? refId : false);
                    this.isLoading = false;
                    this.isConfirmModalVisible = false;
                    if (!IS_SUBAPP_MEGACHAIN) {
                        this.isSuccessModalVisible = true;
                    }
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
            if (IS_SUBAPP_MEGACHAIN) {
                return;
            }
            return getReferralList(this.$store.getters.address)
                .then((list) => {
                    this.referralList = list;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
    },
};
</script>

<template>
    <div>
        <button
            v-if="isModalButton"
            type="button"
            class=""
            :class="buttonClass"
            @click="isConfirmModalVisible = true"
        >
            <img class="u-mr-05" src="/img/icon-share-earn.svg" alt="" role="presentation" width="24" height="24">
            {{ $td('Share & Earn', 'referral.invite-friend') }}
        </button>

        <component :is="isModalButton ? $options.components.Modal : 'div'" class="u-text-center u-text-medium" :isOpen.sync="isConfirmModalVisible">
            <template v-if="$options.IS_SUBAPP_MEGACHAIN">
                <div class="u-flex u-flex--align-center u-mb-10">
                    <img class="u-image u-image--round u-mr-05" alt="" src="/img/icon-ref.png" width="24" height="24">
                    <div class="u-h--uppercase-solid">
                        {{ $td('Referral program', 'meganet.referral-program-title') }}
                    </div>
                </div>
                <p class="u-mb-10 u-text-left">
                    <template v-if="!$store.state.referral.refId">
                        Loading…
                    </template>
                    <template v-else>
                        <template v-if="$i18n.locale === 'en'">
                            Invite friends to the Metagarden platform and get rewards up to 50% when they buy LAUNCHER tokens (<a href="https://metagarden.io/referral-program" target="_blank" class="link link--underline">see details</a>).
                        </template>
                        <template v-if="$i18n.locale === 'ru'">
                            Приглашайте друзей на платформу Metagarden и получайте вознаграждение до 50% за их покупки токенов LAUNCHER (<a href="https://metagarden.io/ru/referral-program" target="_blank" class="link link--underline">подробности</a>).
                        </template>
                    </template>
                </p>
            </template>
            <template v-else>
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
            </template>

            <div class="h-field u-mt-15" v-if="$store.state.referral.refId">
                <div class="h-field__content">
                    <div class="h-field__title" v-if="$options.IS_SUBAPP_MEGACHAIN">{{ $td('Share this link', 'meganet.referral-program-share-title') }}</div>
                    <div class="h-field__input is-not-empty">{{ refUrl }}</div>
                </div>
                <div class="h-field__aside h-field__aside--with-icon">
                    <BaseButtonCopyIcon class="" :copy-text="refUrl"/>
                </div>
            </div>

            <p class="u-text-medium u-mt-10" v-if="$store.state.referral.refId && !$options.IS_SUBAPP_MEGACHAIN">
                {{ $td(`You currently invited ${referralCount} friends`, 'referral.invited-list') }}
            </p>
            <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10" v-if="$store.state.referral.refId && $options.IS_SUBAPP_MEGACHAIN">
                <div class="u-flex u-flex--align-center u-mr-10">
                    <div class="u-h--uppercase u-text-mega-muted">{{ $td('Total invites accepted', 'meganet.referral-program-total-invites') }}</div>
                </div>

                <div class="u-h u-h4">{{ referralCount }}</div>
            </div>
            <div class="u-flex u-flex--justify-between u-flex--align-center u-mt-10" v-if="$options.IS_SUBAPP_MEGACHAIN">
                <div class="u-flex u-flex--align-center u-mr-10">
                    <div class="u-h--uppercase u-text-mega-muted">{{ $td('Total referral rewards', 'meganet.referral-program-total-rewards') }}</div>
                </div>

                <div class="u-h u-h4">{{ pretty($store.state.referral.referralBonus) }}</div>
            </div>

            <div class="form__error u-mt-15" v-if="serverError">{{ serverError }}</div>

            <button
                v-if="!$options.IS_SUBAPP_MEGACHAIN"
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
            <button v-if="isModalButton" class="button button--ghost button--full u-mt-10" type="button" @click="isConfirmModalVisible = false">
                {{ $td('Close', 'form.success-close-button') }}
            </button>
        </component>


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
                    <div class="h-field__input is-not-empty">{{ refUrl }}</div>
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
