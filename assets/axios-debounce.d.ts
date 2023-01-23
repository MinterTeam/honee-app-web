// import type {DebouncePromiseOptions} from '~/assets/debounce-promise.js';

declare module 'axios' {
    interface AxiosRequestConfig {
        idDebounce?: string|number;
        debounceOptions: AxiosDebounceAdapterOptions;
    }
}
/**
 * @typedef {DebouncePromiseOptions} AxiosDebounceAdapterOptions
 * @property {number} [time]
 */

declare type AxiosDebounceAdapterOptions = DebouncePromiseOptions & {
    time: number;
}
export {}

