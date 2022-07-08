<script>
import {getTopupFinishQuery} from '~/pages/onboarding/topup/_name.vue';

export default {
    asyncData({error, redirect, query, app}) {
        if (!query.ctm_order_coin || !query.ctm_order_amount) {
            error({status: 404});
        }
        redirect(app.i18nGetPreferredPath('/onboarding') + getTopupFinishQuery(query.ctm_order_coin, query.ctm_order_amount));
    },
};
</script>

<template>
    <div>
        Loading...
    </div>
</template>
