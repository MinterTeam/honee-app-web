<script>
import getTitle from '~/assets/get-title.js';
import Topup, {TOP_UP_NETWORK} from '~/components/Topup.vue';

export default {
    layout: 'splash',
    components: {
        Topup,
    },
    asyncData({route, error}) {
        const networkSlug = route.params.name;
        const network = TOP_UP_NETWORK[route.params.name];
        if (!network) {
            return error({status: 404, message: 'Page not found'});
        } else {
            return {
                network,
                networkSlug,
            };
        }
    },
    head() {
        const title = getTitle(this.$td('Top up with', 'topup-network.title') + ' ' + this.network.coin);

        return {
            title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
            ],
        };
    },
    data() {
        return {
            /** @type {TopUpNetwork|null} */
            network: null,
            /** @type {HUB_CHAIN_ID|''} */
            networkSlug: '',
        };
    },
    methods: {
        handleTopup(balance) {
            //@TODO success window not showed here
            if (this.$store.state.authRedirectPath) {
                this.$router.push(this.$i18nGetPreferredPath(this.$store.state.authRedirectPath));
                this.$store.commit('SET_AUTH_REDIRECT_PATH', '');
            } else {
                this.$router.push(this.$i18nGetPreferredPath('/onboarding') + getTopupFinishQuery(balance.coinSymbol, balance.amount));
            }
        },
    },
};

export function getTopupFinishQuery(coinSymbol, amount) {
    return `?topupAmount=${amount}&topupCoin=${coinSymbol}`;
}
</script>

<template>
    <div class="u-section topup__vertical-container u-container u-container--small">
        <Topup
            class="card card__content topup__vertical-center"
            v-if="networkSlug"
            :network-slug="networkSlug"
            :back-url="$i18nGetPreferredPath('/onboarding/topup')"
            :show-wait-indicator="true"
            @topup="handleTopup($event)"
        />
    </div>
</template>
