<script>
import {portfolioNotificationSubscribe, portfolioNotificationUnsubscribe} from '~/api/telegram.js';
import InlineSvg from 'vue-inline-svg';
import Modal from '~/components/base/Modal.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';
import TelegramAuth from '~/components/TelegramAuth.vue';

export default {
    components: {
        InlineSvg,
        Modal,
        BaseLoader,
        TelegramAuth,
    },
    props: {
        portfolioId: {
            type: [Number, String],
            required: true,
        },
    },
    data() {
        return {
            isLoading: false,
            isModalVisible: false,
        };
    },
    computed: {
        isSubscribed() {
            return this.$store.state.telegram.userPortfolioNotificationMap[this.portfolioId];
        },
    },
    methods: {
        toggleNotification() {
            if (!this.$store.getters['telegram/isAuthorized']) {
                // after tg auth success it will be toggled again and continued
                this.isModalVisible = true;
                return;
            }

            if (this.isLoading) {
                return;
            }
            this.isLoading = true;
            if (this.isSubscribed) {
                portfolioNotificationUnsubscribe(this.portfolioId, this.$store.getters.privateKey)
                    .then(() => {
                        this.$store.commit('telegram/removeUserPortfolioNotification', this.portfolioId);
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            } else {
                portfolioNotificationSubscribe(this.portfolioId, this.$store.getters.privateKey)
                    .then(() => {
                        this.$store.commit('telegram/addUserPortfolioNotification', this.portfolioId);
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            }
        },
    },
};
</script>

<template>
    <div class="u-display-ib">
        <BaseLoader class="card__portfolio-notify-loader" v-if="isLoading" :is-loading="true"/>
        <button
            v-else
            class="u-semantic-button"
            type="button"
            @click="toggleNotification()"
        >
            <InlineSvg :class="{'is-active': isSubscribed}" src="/img/icon-notify.svg" width="16" height="16" alt="" role="presentation"/>
        </button>

        <Modal class="u-text-center" :isOpen.sync="isModalVisible" :disable-outside-click="true" :hide-close-button="true">
            <InlineSvg class="u-mb-10 u-image is-active" src="/img/icon-notify.svg" alt="" role="presentation" width="64" height="64"/>
            <h2 class="u-h3 u-mb-05">{{ $td('Never miss a signal', 'portfolio.subscribe-notification-title') }}</h2>
            <p class="u-mb-10">{{ $td('Get instant notifications via our Telegram Bot whenever this portfolio is updated.', 'portfolio.subscribe-notification-description') }}</p>

            <TelegramAuth @success="toggleNotification(); isModalVisible = false" :label="$td('Activate Honee Bot', 'portfolio.subscribe-notification-button')" reason="subscribe-portfolio"/>

            <button type="button" class="button button--ghost button--full u-mt-10" @click="isModalVisible = false">Cancel</button>
        </Modal>
    </div>
</template>
