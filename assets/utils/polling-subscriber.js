/**
 * @param {function|{value: function}} fn
 * @param {number} timeout - interval milliseconds
 * @return {{subscribe: subscribe, unsubscribe: unsubscribe}}
 */
export default function PollingSubscriber(fn, timeout) {
    let timer;
    let subscribeCount = 0;

    function execute() {
        if (typeof fn === 'function') {
            return fn();
        } else {
            return fn.value();
        }
    }

    function subscribe() {
        if (subscribeCount < 0) {
            subscribeCount = 0;
        }
        subscribeCount++;
        if (subscribeCount === 1) {
            timer = setInterval(execute, timeout);
        }
    }

    function unsubscribe() {
        subscribeCount--;
        if (subscribeCount === 0) {
            clearInterval(timer);
        }
    }

    return {subscribe, unsubscribe};
}
