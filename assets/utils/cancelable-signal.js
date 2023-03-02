import CancelError from '~/assets/utils/error-cancel.js';

/**
 * @typedef {object} CancelableSignal
 * @property {boolean} isCanceled
 * @property {function(): void} cancel
 * @property {Promise['catch']} onCancel
 */

/**
 * Inspired on https://medium.com/@masnun/creating-cancellable-promises-33bf4b9da39c
 * @return {CancelableSignal}
 */
export function createCancelableSignal() {
    const signal = {
        isCanceled: false,
    };
    const promise = new Promise((resolve, reject) => {
        signal.cancel = () => {
            reject(new CancelError());
            signal.isCanceled = true;
        };
    });

    signal.onCancel = promise.catch;

    return signal;
}
