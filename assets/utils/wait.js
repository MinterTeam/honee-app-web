/**
 * @param {number} time
 * @return {Promise<void>}
 */
export function wait(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
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
