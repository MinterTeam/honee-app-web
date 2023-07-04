<script>
import {getAuthString} from '~/api/telegram.js';
import {IS_SUBAPP_MEGAGAMER, TELEGRAM_AUTH_BOT_NAME, TELEGRAM_AUTH_HOST} from '~/assets/variables.js';
import useNow from '~/composables/use-now.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';

let timer;

export default {
    TELEGRAM_AUTH_BOT_NAME,
    components: {
        BaseLoader,
        Modal,
    },
    props: {
        label: String,
        labelSecondary: String,
        reason: String,
    },
    emits: [
        'success',
    ],
    setup() {
        const {now} = useNow(60 * 1000);

        return {
            now,
        };
    },
    fetch() {
        return this.$store.dispatch('telegram/fetchAuth');
    },
    data() {
        return {
            isModalVisible: false,
        };
    },
    computed: {
        timestamp() {
            return new Date(this.now).toISOString();
        },
        authString() {
            if (!this.$store.getters.privateKey) {
                return '';
            }
            return getAuthString(this.timestamp, this.$store.getters.privateKey);
        },
        loginUrl() {
            if (!this.$store.getters.privateKey) {
                return '';
            }
            return `${TELEGRAM_AUTH_HOST}/login?timestamp=${this.timestamp}&auth=${this.authString}&reason=${this.reason}`;
        },
        loginUrlLegacy() {
            return `https://t.me/${TELEGRAM_AUTH_BOT_NAME}?start=${base64UrlEncode(this.$store.state.telegram.legacySecretDeviceId)}`;
            // return `https://t.me/HoneeAuthBot?start=${this.$store.state.telegram.legacySecretDeviceId}`;
        },
        loginUrlFinal() {
            return IS_SUBAPP_MEGAGAMER ? this.loginUrlLegacy : this.loginUrl;
        },
    },
    destroyed() {
        clearInterval(timer);
    },
    methods: {
        login(event) {
            if (this.$store.getters['telegram/isAuthorized']) {
                event.preventDefault();
                return;
            }

            this.isModalVisible = true;
            timer = setInterval(() => {
                this.$store.dispatch('telegram/fetchAuth')
                    .then(() => {
                        if (this.$store.getters['telegram/isAuthorized']) {
                            clearInterval(timer);
                            this.isModalVisible = false;
                            this.$emit('success');
                        }
                    });
            }, 2000);
        },
    },
};

function base64UrlEncode(str) {
    try {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    } catch (e) {
        return '';
    }
}
</script>

<template>
    <div>
        <a
            class="button button--telegram button--full" target="_blank"
            v-show="!$fetchState.pending"
            :href="loginUrlFinal"
            @click="login($event)"
        >
            <img class="button__icon" src="/img/icon-social-telegram.svg" alt="" role="presentation">
            <template v-if="!$store.getters['telegram/isAuthorized']">
                {{ label || $td('Login with Telegram', 'battle.telegram-login-button') }}
            </template>
            <template v-else>Logged as @{{ $store.getters['telegram/username'] }}</template>
        </a>
        <a
            class="link link--underline u-fw-700 u-mt-10 u-display-ib" target="_blank"
            v-if="labelSecondary && !$store.getters['telegram/isAuthorized']"
            v-show="!$fetchState.pending"
            :href="loginUrlFinal"
            @click="login($event)"
        >
            {{ labelSecondary }}
        </a>

        <Modal class="u-text-center" :isOpen.sync="isModalVisible" :disable-outside-click="true" :hide-close-button="true">
            <h2 class="u-h3 u-mb-10">{{ $td('Login with Telegram', 'battle.telegram-login-button') }}</h2>
            <p class="u-mb-10">
                {{ $td('Click Start in the', 'battle.telegram-login-description') }}
                {{ $options.TELEGRAM_AUTH_BOT_NAME }}
            </p>

            <BaseLoader :is-loading="true"/>
        </Modal>
    </div>
</template>
