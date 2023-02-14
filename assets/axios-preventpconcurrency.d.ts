declare module 'axios' {
    interface AxiosRequestConfig {
        idPreventConcurrency?: string|number;
    }
}

export {}

