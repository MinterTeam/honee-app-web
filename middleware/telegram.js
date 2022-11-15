export default function({store}) {
    if (process.server || !store.state.onLine) {
        return Promise.resolve();
    }

    // don't wait
    store.dispatch('telegram/fetchAuth')
        .then(() => {
            // don't wait
            store.dispatch('telegram/fetchUserPortfolioNotificationList')
                .catch((e) => {
                    console.log(e);
                });
        })
        .catch((e) => {
            console.log(e);
        });

    return Promise.resolve();
}
