export default function({from, store, route}) {
    // check `from` !== `route` because on initial page load it uses `route` as `from`
    if (process.server || !from || from.fullPath === route.fullPath) {
        return;
    }

    let storeHistory = store.state.history;

    if (storeHistory.length && storeHistory[storeHistory.length - 1].key === window.history.state.key) {
        // произведен history.back(), откатываем состояние
        store.commit('POP_HISTORY');
    } else {
        store.commit('PUSH_HISTORY', {
            // url странцы, с которой производится переход
            url: from.fullPath,
            // ключ страницы с которой производится переход
            // при popstate (например Назад), history будет содержать состоянии страницы, куда произодится переход
            // т.к. история меняется быстрее, чем отрабатывает эта функция,
            key: window.history.state.key,
        });
    }
}
