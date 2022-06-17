import CancelError from '~/assets/utils/error-cancel.js';

/**
 * Based on https://github.com/bjoerge/debounce-promise
 */

/**
 * @param {function(T): Promise<T2>} fn
 * @param {number} wait
 * @param {object} options
 * @return {(function(T): Promise<T2>)&{flush: function}}
 * @template T, T2
 */
export default function debouncePromise(fn, wait = 0, options = {}) {
    let lastCallAt;
    let deferred;
    let timer;
    let pendingThis;
    let pendingArgs = [];
    function debounced(...args) {
        const currentWait = getWait(wait);
        const currentTime = new Date().getTime();

        const isCold = !lastCallAt || (currentTime - lastCallAt) > currentWait;

        lastCallAt = currentTime;

        if (isCold && options.leading) {
            return Promise.resolve(fn.call(this, ...args));
        }

        if (deferred) {
            clearTimeout(timer);
            // cancel previous request @TODO add option for it?
            deferred.reject(new CancelError());
            deferred = null;
        }
        if (!deferred) {
            deferred = defer();
        }

        pendingThis = this;
        pendingArgs.push(args);
        timer = setTimeout(flush, currentWait);

        return deferred.promise;
    }

    function flush() {
        const thisDeferred = deferred;
        clearTimeout(timer);

        Promise.resolve(
                fn.apply(pendingThis, pendingArgs[pendingArgs.length - 1]),
            )
            .then(thisDeferred.resolve, thisDeferred.reject);

        pendingThis = undefined;
        pendingArgs = [];
        deferred = null;

        return thisDeferred.promise;
    }

    debounced.flush = flush;
    return debounced;
}

function getWait(wait) {
    return (typeof wait === 'function') ? wait() : wait;
}

function defer() {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}

