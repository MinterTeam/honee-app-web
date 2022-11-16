export default function({store}) {
    if (process.server || !store.state.onLine) {
        return Promise.resolve();
    }

    // if can't log in to tg or if already logged in to tg
    if (!store.getters.isAuthorized || store.getters['telegram/isAuthorized']) {
        return Promise.resolve();
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

    return Promise.resolve();
}
