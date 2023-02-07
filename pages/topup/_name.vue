<script>
import getTitle from '~/assets/get-title.js';
import Topup, {TOP_UP_NETWORK} from '~/components/Topup.vue';

export default {
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
                {hid: 'og-title', name: 'og:title', content: title},
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
};
</script>

<template>
    <div class="u-section u-container u-container--small u-text-center">
        <Topup class="card card__content" v-if="networkSlug" :network-slug="networkSlug"/>
    </div>
</template>
