import {followReferrer} from '~/api/referral.js';

export default ({ app, store }) => {
    store.subscribe((mutation) => {
        if (mutation.type === 'LOGOUT') {
            // remove old data on logout
            store.commit('referral/reset');
        }
    });

    // Every time the route changes (fired on initialization too)
    app.router.beforeEach(async (to, from, next) => {
        await store.dispatch('referral/fetchRefId');

        const foreignRefId = queryHasForeignRefId(to, store) ? to.query.refId : store.state.referral.foreignRefId;
        if (foreignRefId) {
            if (store.getters.isAuthorized) {
                // no need to await it, follow in the background
                followReferrer(foreignRefId, store.getters.privateKey)
                    .then(() => {
                        store.commit('referral/setForeignRefId', undefined);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else {
                store.commit('referral/setForeignRefId', foreignRefId);
                return overwriteQuery(next, to, foreignRefId);
            }
        }

        // if user has refId, but it is not in query yet
        if (store.state.referral.refId && to.query.refId !== store.state.referral.refId) {
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
    if (to.query.refId !== refId) {
        to.query.refId = refId;
        next({ path: to.path, query: to.query });
    } else {
        next();
    }

}

function queryHasForeignRefId(route, store) {
    return route.query.refId && route.query.refId !== store.state.referral.refId;
}
