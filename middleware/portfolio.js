export default function({store}) {
    if (process.server || !store.state.onLine) {
        return Promise.resolve();
    }

    // don't wait
    store.dispatch('portfolio/fetchCoinList')
        .catch((e) => {
            console.log(e);
        });

    return Promise.resolve();
}
