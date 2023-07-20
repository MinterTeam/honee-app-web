<script>
import {NETWORK, MAINNET, SPOT_DATA} from '~/assets/variables.js';
import InlineSvg from 'vue-inline-svg';
import {createBuyOrder} from '~/api/telegram.js';
import {getCard2MinterUrl} from '~/assets/utils.js';

export const TELEGRAM_BUY_LINKS = {
    BEE: 'https://t.me/honeepremiumbot?start=buy-bee',
    MEGANET: 'https://t.me/metagardenbot?start=meganet',
    LAUNCHER: 'https://t.me/metagardenbot?start=launcher',
    FARMER: 'https://t.me/metagardenbot?start=farmer-cryptobot',
};

const PRODUCT_ADDRESS_TYPE = {
    MINTER: 'minter',
    SMART_WALLET: 'smart-wallet',
    EXTERNAL: 'external',
};

const BUY_PRODUCTS = {
    // карта, Minter
    MGMINER: {
        isMiner: true,
    },
    // карта, Криптобот, Minter
    FARMER: {
        isMiner: true,
        finishUrl: '/farming',
    },
    // карта, Криптобот, Minter
    LAUNCHER: {
    },
    // Криптобот 0x
    MEGA: {
        card2Card: false,
        minter: false,
        // it should be external addresss
        bot: {
            addressType: PRODUCT_ADDRESS_TYPE.SMART_WALLET,
        },
    },
    // карта, Криптобот, Minter
    METAGARDEN: {
    },
    // карта, Криптобот, Minter
    SNATCH: {},
    // карта, Криптобот 0х, Minter
    WONDER: {
        // it should be external addresss
        bot: false,
    },
    // карта, Криптобот, Minter
    BIP: {
    },
    // карта, Криптобот, Minter
    BEE: {
    },
    // карта, Криптобот, Minter
    HUB: {
    },
};

export default {
    TELEGRAM_BUY_LINKS,
    components: {
        InlineSvg,
    },
    props: {
        coin: {
            type: String,
            required: true,
        },
        buttonClass: {
            type: String,
            default: '',
        },
    },
    fetch() {
        if (!this.$store.getters.isMegachain || !this.settings.bot) {
            return;
        }
        let address = this.$store.getters.address;
        if (this.settings.bot?.addressType === PRODUCT_ADDRESS_TYPE.SMART_WALLET) {
            address = this.$store.getters.smartWalletAddress;
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
        isMainnet() {
            return NETWORK === MAINNET;
        },
        settings() {
            const settings = BUY_PRODUCTS[this.coin];
            return settings ? {
                card2Card: true,
                minter: true,
                bot: true,
                ...settings,
            } : {
                card2Card: true,
                minter: true,
                bot: false,
            };
        },
        card2MinterUrl() {
            const card2CardToken = SPOT_DATA[this.coin] ? SPOT_DATA[this.coin].card2CardToken : this.coin;
            return getCard2MinterUrl({
                address: this.$store.getters.address,
                coin: card2CardToken,
                returnUrl: window.location.href,
                finishUrl: window.location.origin + (this.settings.finishUrl ? this.$i18nGetPreferredPath(this.settings.finishUrl) : ''),
            });
        },
        telegramBotUrl() {
            if (this.$store.getters.isMegachain) {
                return this.telegramOrderId ? `https://t.me/metagardenbot?start=order-${this.telegramOrderId}` : '';
            } else {
                return TELEGRAM_BUY_LINKS[this.coin];
            }
        },
        minterSwapUrl() {
            return this.settings.isMiner ? `/buy/${this.coin}/minter` : `/swap/${this.coin}`;
        },
    },
    methods: {
    },
};
</script>

<template>
    <div class="card card__content card__content--small card--light-grey topup__vertical-center">
        <h1 class="u-h3 u-mb-025">
            {{ $td('Buy', 'index.swap') }} {{ coin }}
        </h1>
        <p>{{ $td('Choose one of these options', 'topup.description') }}</p>

        <a class="button button--full u-mt-10" :class="buttonClass" :href="card2MinterUrl" v-if="settings.card2Card">
            <InlineSvg class="button__icon" src="/img/icon-topup-card.svg" width="24" height="24" alt="" role="presentation"/>
            {{ $td('Card', 'topup.top-up-with-card2card') }}
        </a>
        <!--
        <nuxt-link class="button button--full u-mt-10" :class="buttonClass" :to="$i18nGetPreferredPath('/topup/crypto')">
            <InlineSvg class="button__icon" src="/img/icon-blockchain.svg" width="24" height="24" alt="" role="presentation"/>
            {{ $td('Crypto', 'topup.buy-with-crypto') }}
        </nuxt-link>
        -->

        <a class="button button--full u-mt-10" :class="buttonClass" :href="telegramBotUrl" target="_blank" v-if="settings.bot && telegramBotUrl">
            <InlineSvg class="button__icon" src="/img/icon-social-telegram.svg" width="24" height="24" alt="" role="presentation"/>
            {{ $td('Telegram bot', 'topup.buy-via-telegram') }}
        </a>

        <nuxt-link class="button button--full u-mt-10" :class="buttonClass" :to="$i18nGetPreferredPath(minterSwapUrl)" v-if="settings.minter">
            <InlineSvg class="button__icon" src="/img/icon-swap.svg" width="24" height="24" alt="" role="presentation"/>
            <template v-if="$store.getters.isHonee">
                {{ $td('Swap in Honee', 'topup.buy-in-honee') }}
            </template>
            <template v-else>
                {{ $td('Swap in Minter', 'topup.buy-in-minter') }}
            </template>
        </nuxt-link>

        <!--<nuxt-link class="button button--ghost button--full u-mt-10" :to="$i18nGetPreferredPath('/topup/coin/' + coin)">
            {{ $td('Cancel', 'topup.cancel') }}
        </nuxt-link>-->
    </div>
</template>
