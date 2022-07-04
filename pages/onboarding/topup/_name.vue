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
            networkSlug: '',
        };
    },
};
</script>

<template>
    <div class="u-section topup__vertical-container">
        <Topup
            class="card card__content card__content--small topup__vertical-center"
            v-if="networkSlug"
            :network-slug="networkSlug"
            :back-url="$i18nGetPreferredPath('/onboarding/topup')"
        />
    </div>
</template>
