<script>
import axios from 'axios';
import {NETWORK, MAINNET, SPOT_DATA} from '~/assets/variables.js';
import InlineSvg from 'vue-inline-svg';
import {getCard2MinterUrl} from '~/assets/utils.js';
import TopupCoinOptionsTelegram from '~/components/TopupCoinOptionsTelegram.vue';

export const TELEGRAM_BUY_LINKS = {
    BEE: 'https://t.me/honeepremiumbot?start=buy-bee',
    MEGANET: 'https://t.me/metagardenbot?start=meganet',
    LAUNCHER: 'https://t.me/metagardenbot?start=launcher',
    FARMER: 'https://t.me/metagardenbot?start=farmer-cryptobot',
};

export const PRODUCT_ADDRESS_TYPE = {
    MINTER: 'minter',
    SMART_WALLET: 'smart-wallet',
};

export const BUY_PRODUCTS = {
    // карта, Minter
    MGMINER: {
        isMiner: true,
        bot: false,
    },
    // карта, Криптобот, Minter
    FARMER: {
        isMiner: true,
        finishUrl: '/farming',
    },
    // карта, Криптобот, Minter
    LAUNCHER: {
    },
    // карта, Minter
    METAGARDEN: {
        bot: false,
    },
    // карта, Криптобот, Minter
    SNATCH: {},
    // карта, Криптобот 0х, Minter
    WONDER: {
        bot: {
            addressType: PRODUCT_ADDRESS_TYPE.SMART_WALLET,
        },
    },
    // Криптобот 0x
    MEGA: {
        card2Card: false,
        minter: false,
        bot: {
            addressType: function() {
                // @TODO authorized tg user id can be used if not in TWA
                return window.getTelegramWebApp?.()
                    .then((WebApp) => {
                        if (!WebApp.initDataUnsafe?.hash) {
                            throw new Error('No data from Telegram Bot');
                        }
                        const urlSearchParams = new URLSearchParams();
                        urlSearchParams.append("req_data", WebApp.initData);

                        return axios.get('https://heist-bsc-api.dl-dev.ru/me', {
                            params: urlSearchParams,
                        });
                        /*
                        const userId = WebApp.initDataUnsafe?.user?.id;
                        if (!userId) {
                            throw new Error('No data from Telegram Bot');
                        }
                        return axios.get(`https://heist-bsc-api.dl-dev.ru/address?id=${userId}`);
                        */
                    })
                    .then((response) => {
                        return response.data.address;
                    });

            },
        },
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

export function getProductSettings(coin) {
    const settings = BUY_PRODUCTS[coin];
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
}

export default {
    components: {
        InlineSvg,
        TopupCoinOptionsTelegram,
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
    data() {
        return {
        };
    },
    computed: {
        isMainnet() {
            return NETWORK === MAINNET;
        },
        settings() {
            return getProductSettings(this.coin);
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
        cryptoUrl() {
            if (!this.settings.minter) {
                return '';
            }
            const coinQuery = this.settings.isMiner ? '' : `?coinToGet=${this.coin}`;
            return '/topup/crypto' + coinQuery;
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

        <nuxt-link class="button button--full u-mt-10" :class="buttonClass" :to="$i18nGetPreferredPath(cryptoUrl)" v-if="cryptoUrl">
            <InlineSvg class="button__icon" src="/img/icon-blockchain.svg" width="24" height="24" alt="" role="presentation"/>
            {{ $td('Crypto', 'topup.buy-with-crypto') }}
        </nuxt-link>

        <nuxt-link class="button button--full u-mt-10" :class="buttonClass" :to="$i18nGetPreferredPath(minterSwapUrl)" v-if="settings.minter">
            <InlineSvg class="button__icon" src="/img/icon-swap.svg" width="24" height="24" alt="" role="presentation"/>
            <template v-if="$store.getters.isHonee">
                {{ $td('Swap in Honee', 'topup.buy-in-honee') }}
            </template>
            <template v-else>
                {{ $td('Swap in Minter', 'topup.buy-in-minter') }}
            </template>
        </nuxt-link>

        <TopupCoinOptionsTelegram class="button button--full u-mt-10" :class="buttonClass" :coin="coin" :settings="settings" :button-class="buttonClass"/>

        <a class="button button--full u-mt-10" :class="buttonClass" :href="card2MinterUrl" v-if="settings.card2Card">
            <InlineSvg class="button__icon" src="/img/icon-topup-card.svg" width="24" height="24" alt="" role="presentation"/>
            {{ $td('Card', 'topup.top-up-with-card2card') }}
        </a>

        <!--<nuxt-link class="button button--ghost button--full u-mt-10" :to="$i18nGetPreferredPath('/topup/coin/' + coin)">
            {{ $td('Cancel', 'topup.cancel') }}
        </nuxt-link>-->
    </div>
</template>
