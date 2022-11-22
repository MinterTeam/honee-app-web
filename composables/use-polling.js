import PollingSubscriber from '~/assets/utils/polling-subscriber.js';
import {onUnmounted} from '@vue/composition-api';

const pollList = {};

/**
 * Keep one active subscription
 * @param [key]
 * @param [fn]
 * @param [timeout]
 * @return {{updatePolling: updatePolling}}
 */
export default function usePolling(key, fn, timeout) {
    let currentKey;
    if (key && fn) {
        start(key, fn, timeout);
    }

    function start(key, fn, timeout) {
        currentKey = key;
        if (!pollList[key]) {
            pollList[key] = PollingSubscriber(fn, timeout);
        }
        pollList[key].subscribe();
    }

    function updatePolling(oldKey, newKey, fn, timeout) {
        if (pollList[oldKey]) {
            pollList[oldKey].unsubscribe();
        }
        start(newKey, fn, timeout);
    }

    onUnmounted(() => pollList[currentKey]?.unsubscribe());

    return {
        updatePolling,
    };
}
