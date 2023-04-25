import {DASHBOARD_URL} from '~/assets/variables.js';

export default function({app, store, route, redirect, error}) {
    if (process.server) {
        return;
    }
    console.log('CHECK AUTH');
    console.log('-- route', route);
    console.log('-- path', route.path);

    const urlPublic = [
        /^(\/ru)?\/embed(\/|$)/,
        /^(\/ru)?\/go(\/)/,
    ].some((pathRegex) => {
        return pathRegex.test(route.path);
    });
    const urlHasPreview = [
        /^(\/ru)?\/portfolio\/?$/,
        /^(\/ru)?\/portfolio\/leaderboard\/?$/,
        /^(\/ru)?\/portfolio\/battle\/?$/,
        /^(\/ru)?\/portfolio\/battle\/\d+\/?$/,
        /^(\/ru)?\/portfolio\/\d+\/?$/,
    ].some((pathRegex) => {
        return pathRegex.test(route.path);
    });
    const urlRequiresNonAuth = /^(\/ru)?\/auth(\/|$)/.test(route.path);
    // const urlRequiresAuth = /^(\/ru)?\/dashboard(\/|$)/.test(route.path);
    const urlAuthBattle = /^(\/ru)?\/auth\/battle(\/|$)/.test(route.path);

    if (urlPublic) {
        console.log('-- allow: embed');
        return Promise.resolve();
    }
    if (urlHasPreview) {
        console.log('-- allow: has preview');
        if (!store.getters.isAuthorized) {
            store.commit('SET_AUTH_REDIRECT_PATH', route.fullPath);
        }
        return Promise.resolve();
    }
    if (!store.getters.isAuthorized && !urlRequiresNonAuth) {
        console.log('-- restricted: redirect to auth');
        store.commit('SET_AUTH_REDIRECT_PATH', route.fullPath);
        return redirect(app.i18nGetPreferredPath({path: '/auth'}));
    }
    if (store.getters.isAuthorized && urlAuthBattle) {
        console.log('-- restricted: redirect to battle onboarding');
        return redirect(app.i18nGetPreferredPath({path: '/onboarding/battle'}));
    }
    if (store.getters.isAuthorized && urlRequiresNonAuth) {
        console.log('-- restricted: redirect to index');
        return redirect(app.i18nGetPreferredPath({path: DASHBOARD_URL}));
    }

    console.log('-- not restricted');
    return Promise.resolve();
}
