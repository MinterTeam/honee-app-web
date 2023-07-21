<script>
import InlineSvg from 'vue-inline-svg';
import {createBuyOrder} from '~/api/telegram.js';
import {TELEGRAM_BUY_LINKS, PRODUCT_ADDRESS_TYPE} from '~/components/TopupCoinOptions.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';

export default {
    components: {
        BaseLoader,
        InlineSvg,
    },
    props: {
        coin: {
            type: String,
            required: true,
        },
        settings: {
            type: Object,
            required: true,
        },
    },
    async fetch() {
        if (!this.$store.getters.isMegachain || !this.settings.bot) {
            return;
        }
        let address = this.$store.getters.address;
        if (this.settings.bot?.addressType === PRODUCT_ADDRESS_TYPE.SMART_WALLET) {
            address = this.$store.getters.smartWalletAddress;
        }
        if (typeof this.settings.bot?.addressType === 'function') {
            address = await this.settings.bot.addressType();
        }
        if (!address) {
            return;
        }
        return createBuyOrder( address, this.coin)
            .then((orderId) => {
                this.telegramOrderId = orderId;
            });
    },
    data() {
        return {
            telegramOrderId: undefined,
        };
    },
    computed: {
        telegramBotUrl() {
            if (this.$store.getters.isMegachain) {
                return this.telegramOrderId ? `https://t.me/metagardenbot?start=order-${this.telegramOrderId}` : '';
            } else {
                return TELEGRAM_BUY_LINKS[this.coin];
            }
        },
    },
    methods: {
    },
};
</script>

<template>
    <component
        :is="$fetchState.pending ? 'div' : 'a'"
        :class="{'is-loading': $fetchState.pending}"
        :href="telegramBotUrl"
        target="_blank"
        v-if="settings.bot && (telegramBotUrl || $fetchState.pending)"
    >
        <span class="button__content">
            <slot>
                <InlineSvg class="button__icon" src="/img/icon-social-telegram.svg" width="24" height="24" alt="" role="presentation"/>
                {{ $td('Telegram bot', 'topup.buy-via-telegram') }}
            </slot>
        </span>
        <BaseLoader class="button__loader" :isLoading="true"/>
    </component>
</template>
