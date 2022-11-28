/**
 * @template {any} T
 * @param {number} time
 * @param {T} result - result of resolved promise
 * @return {Promise<T>}
 */
export function wait(time, result) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(result), time);
    });
}


/**
 * @param {function: boolean} conditionFn
 * @param {number} [delay=100]
 * @return {Promise<void>}
 */
export function waitCondition(conditionFn, delay = 100) {
    return new Promise((resolve) => {
        const timer = setInterval(() => {
            if (conditionFn()) {
                clearInterval(timer);
                resolve();
            }
        }, delay);
    });
}
