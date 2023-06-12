import {followReferrer} from '~/api/referral.js';
import {REF_ID_QUERY} from '~/assets/variables.js';

export default ({ app, route, store }) => {
    // always init regardless of presence of query ref id (it will fallback to web storage)
    store.commit('referral/initForeignRefId', route.query[REF_ID_QUERY]);

    store.subscribe((mutation) => {
        if (mutation.type === 'LOGOUT') {
            // remove old data on logout
            store.commit('referral/reset');
        }
    });

    // Every time the route changes (fired on initialization too)
    app.router.beforeEach(async (to, from, next) => {
        await store.dispatch('referral/fetchRefId');

        const foreignRefId = store.state.referral.foreignRefId;
        if (foreignRefId && store.getters.isPKAuthorized) {
            if (foreignRefId !== store.state.referral.refId) {
                // don't return because no need to await it, follow in the background
                followReferrer(foreignRefId, store.getters.privateKey)
                    .catch((error) => {
                        // address not eligible to follow
                        if (error.response.data.code === 'NEW_ADDRESS_ERROR') {
                            store.commit('referral/clearForeignRefId');
                        } else {
                            console.log(error);
                        }
                    });
            }
            // always clear after first authorization
            store.commit('referral/clearForeignRefId');
        }

        // if user has refId, but it is not in query yet
        if (store.state.referral.refId && to.query[REF_ID_QUERY] !== store.state.referral.refId) {
            return overwriteQuery(next, to, store.state.referral.refId);
        }
        next();
    });
};

/**
 * @param {function} next
 * @param to
 * @param {string} refId
 */
function overwriteQuery(next, to, refId) {
    if (to.query[REF_ID_QUERY] !== refId) {
        to.query[REF_ID_QUERY] = refId;
        next({ path: to.path, query: to.query });
    } else {
        next();
    }

}
