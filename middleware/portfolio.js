export default function({store}) {
    if (process.server) {
        return Promise.resolve();
    }

    if (!store.state.onLine) {
        return;
    }

    // don't wait
    store.dispatch('portfolio/fetchCoinList')
        .catch((e) => {
            console.log(e);
        });

    return Promise.resolve();
}
