export default function({from, store, route, app}) {
    // check `from` !== `route` because on initial page load it uses `route` as `from`
    if (process.server || !from || from.fullPath === route.fullPath) {
        return;
    }
    // console.log(from.fullPath, route.fullPath, app.router.history.getCurrentLocation());

    let storeHistory = store.state.history;

    //@TODO обновление страницы при наличии history и нажатие back приведёт к ошибке (нужно вынести в plugin и следить за текущим history.state, чтобы понимать, что произошёл history.popstate
    // при history go(-1) ил go(+1), history.state будет содержать key будущей страницы
    // при нажатиях на ссылку history.state будет содержать key старой страницы
    if (storeHistory.length && storeHistory[storeHistory.length - 1]?.key === window.history.state?.key) {
        // произведен history.back(), откатываем состояние
        store.commit('POP_HISTORY');
    } else {
        store.commit('PUSH_HISTORY', {
            // url страницы, с которой производится переход
            url: from.fullPath,
            // ключ страницы с которой производится переход
            // при popstate (например Назад), history будет содержать состоянии страницы, куда производится переход
            // т.к. история меняется быстрее, чем отрабатывает эта функция,
            key: window.history.state?.key,
        });
    }
}
