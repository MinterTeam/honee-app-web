<script>
import {HUB_NETWORK_SLUG} from '~/assets/variables.js';
import getTitle from '~/assets/get-title.js';
import {getCard2MinterUrl} from '~/assets/utils.js';
import FieldCombined from '~/components/base/FieldCombined.vue';

export default {
    HUB_NETWORK_SLUG,
    CARD_COIN_LIST: [
        // 'USDTBSC',
        'BEE',
        'BIP',
        'HUB',
        'METAGARDEN',
        'WONDER',
        'SNATCH',
        'LAUNCHER',
    ],
    layout(context) {
        return context.store.getters.isMetagarden ? 'metagarden' : 'default';
    },
    components: {
        FieldCombined,
    },
    head() {
        const title = getTitle(this.$td('Top-up with card', 'deposit-p2p.title'));

        return {
            title,
            meta: [
                {hid: 'og-title', name: 'og:title', content: title},
            ],
        };
    },
    data() {
        const queryCoin = this.$route.query.coin;
        const isQueryCoinValid = this.$options.CARD_COIN_LIST.includes(queryCoin);

        return {
            form: {
                coin: isQueryCoinValid ? queryCoin : this.$options.CARD_COIN_LIST[0],
            },
        };
    },
    computed: {
        card2MinterUrl() {
            const params = {
                address: this.$store.getters.address,
                coin: this.form.coin,

            };
            if (this.$options.isOnboarding) {
                return getCard2MinterUrl({
                    ...params,
                    returnUrl: window.location.origin + this.$i18nGetPreferredPath('/onboarding/topup'),
                    finishUrl: window.location.origin + this.$i18nGetPreferredPath('/onboarding/topup/finish-card2minter'),
                });
            } else {
                return getCard2MinterUrl({
                    ...params,
                    returnUrl: window.location.origin + this.$i18nGetPreferredPath('/topup'),
                    finishUrl: window.location.origin,
                });
            }
        },
    },
    methods: {
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card--invert">
            <div class="card__content card__content--medium">
                <h1 class="u-h3 u-mb-025">
                    {{ $td('Top-up with card', 'deposit-p2p.title') }}
                </h1>
                <p class="u-text-medium">
                    {{ $td('Choose token you want to buy', 'deposit-p2p.description') }}
                </p>
            </div>
            <div class="card card--light-grey">
                <div class="card__content card__content--medium">
                    <FieldCombined
                        :coin.sync="form.coin"
                        :label="$td('Token', 'common.token')"
                        :coin-list="$options.CARD_COIN_LIST"
                        :fallback-to-full-list="false"
                        :amount="false"
                    />
                    <!--:$coin="$v.form.coin"-->

                    <a class="button button--main button--full u-mt-10" :href="card2MinterUrl" target="_blank">{{ $td('Continue', 'common.continue') }}</a>

                </div>
            </div>
        </div>




        <!--
        <nuxt-link class="button button&#45;&#45;ghost button&#45;&#45;full u-mt-10" :to="backUrl || $i18nGetPreferredPath('/topup')">
            {{ $td('Cancel', 'topup.back') }}
        </nuxt-link>
        -->


    </div>
</template>
