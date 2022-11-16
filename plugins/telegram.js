export default ({ app, store }) => {
    store.subscribe((mutation) => {
        if (mutation.type === 'LOGOUT') {
            // remove old data on logout
            store.dispatch('telegram/reset');
        }
    });

    // Every time the route changes (fired on initialization too)
    app.router.beforeEach((to, from, next) => {
        if (process.server || !store.state.onLine) {
            return next();
        }

        // if can't log in to tg or if already logged in to tg
        if (!store.getters.isAuthorized || store.getters['telegram/isAuthorized']) {
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
