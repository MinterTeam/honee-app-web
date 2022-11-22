<script>
import {getTopupFinishQuery} from '~/pages/onboarding/topup/_name.vue';

export default {
    asyncData({error, redirect, query, app, store}) {
        if (!query.ctm_order_coin || !query.ctm_order_amount) {
            error({status: 404});
        }
        //@TODO state not persisted here after new page open
        if (store.state.authRedirectPath) {
            redirect(app.i18nGetPreferredPath(store.state.authRedirectPath));
            store.commit('SET_AUTH_REDIRECT_PATH', '');
        } else {
            redirect(app.i18nGetPreferredPath('/onboarding') + getTopupFinishQuery(query.ctm_order_coin, query.ctm_order_amount));
        }
    },
};
</script>

<template>
    <div>
        Loading...
    </div>
</template>
