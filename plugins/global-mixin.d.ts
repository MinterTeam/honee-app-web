import {RawLocation} from "vue-router";

declare module 'vue/types/vue' {
    interface Vue {
        BASE_URL_PREFIX: string
        DASHBOARD_URL: string

        $i18nGetPreferredPath(route: RawLocation, locale?: string): string
        $getDashboardUrl(page?: string, baseUrl?: string): string
    }
}

declare module '@nuxt/types' {
    interface Context {
        i18nGetPreferredPath(route: RawLocation, locale?: string): string
    }
}

export { }
