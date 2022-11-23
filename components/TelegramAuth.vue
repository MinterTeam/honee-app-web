<script>
import {getAuthString} from '~/api/telegram.js';
import useNow from '~/composables/use-now.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';

let timer;

export default {
    components: {
        BaseLoader,
        Modal,
    },
    props: {
        label: String,
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
            return getAuthString(this.timestamp, this.$store.getters.privateKey);
        },
        loginUrl() {
            return `https://premium-bot.honee.app/login?timestamp=${this.timestamp}&auth=${this.authString}&reason=${this.reason}`;
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
                // @TODO
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
</script>

<template>
    <div>
        <a
            class="button button--telegram button--full" target="_blank"
            v-show="!$fetchState.pending"
            :href="loginUrl"
            @click="login($event)"
        >
            <img class="button__icon" src="/img/icon-social-telegram.svg" alt="" role="presentation">
            <template v-if="!$store.getters['telegram/isAuthorized']">
                {{ label || $td('Login with Telegram', 'battle.telegram-login-button') }}
            </template>
            <template v-else>Logged as @{{ $store.state.telegram.auth.user.username }}</template>
        </a>

        <Modal :isOpen.sync="isModalVisible" :disable-outside-click="true" :hide-close-button="true">
            <h2 class="u-h3 u-mb-10">{{ $td('Login with Telegram', 'battle.telegram-login-button') }}</h2>
            <p class="u-mb-10">{{ $td('Click Start in the HoneePremiumBot', 'battle.telegram-login-description') }}</p>

            <BaseLoader :is-loading="true"/>
        </Modal>
    </div>
</template>
