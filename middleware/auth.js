import {DASHBOARD_URL} from '~/assets/variables.js';

export default function({store, route, redirect, error}) {
    if (process.server) {
        return;
    }
    console.log('CHECK AUTH');
    console.log('-- route', route);
    console.log('-- path', route.path);

    const urlRequiresNonAuth = /^\/auth(\/|$)/.test(route.path);
    const urlRequiresAuth = /^\/dashboard(\/|$)/.test(route.path);

    if (!store.getters.isAuthorized && urlRequiresAuth) {
        console.log('-- restricted: redirect to auth');
        store.commit('SET_AUTH_REDIRECT_PATH', route.fullPath);
        return redirect('/auth');
    }
    if (store.getters.isAuthorized && urlRequiresNonAuth) {
        console.log('-- restricted: redirect to index');
        return redirect(DASHBOARD_URL);
    }

    console.log('-- not restricted');
    return Promise.resolve();
}
