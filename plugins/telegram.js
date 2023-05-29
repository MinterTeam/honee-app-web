import {IS_SUBAPP_MEGAGAMER} from '~/assets/variables.js';

export default ({ app, store }) => {
    store.subscribe((mutation) => {
        if (mutation.type === 'LOGOUT') {
            // remove old data on logout
            store.dispatch('telegram/reset');
        }
    });

    // Every time the route changes (fired on initialization too)
    app.router.beforeEach(async (to, from, next) => {
        if (process.server || !store.state.onLine) {
            return next();
        }

        // if can't log in to tg (megagamer can log in even without seed because it uses uuid)
        if (!IS_SUBAPP_MEGAGAMER && !store.getters.isAuthorized) {
            return next();
        }

        // if already logged in to tg
        if (store.getters['telegram/isAuthorized']) {
            return next();
        }

        if (IS_SUBAPP_MEGAGAMER) {
            await store.dispatch('telegram/fetchLegacyAuth')
                .catch((e) => {
                    console.log(e);
                });
            return next();
        }

        // don't wait
        store.dispatch('telegram/fetchAuth')
            .then(() => {
                if (store.getters['telegram/isAuthorized']) {
                    // don't wait
                    store.dispatch('telegram/fetchUserPortfolioNotificationList')
                        .catch((e) => {
                            console.log(e);
                        });
                }
            })
            .catch((e) => {
                console.log(e);
            });

        return next();
    });
};
