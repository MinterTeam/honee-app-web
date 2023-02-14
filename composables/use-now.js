import Vue from 'vue';
import {VueNowMixinFactory} from 'vue-now';
import { toRef } from 'vue';

export default function useNow(period) {
    const instance = new Vue(VueNowMixinFactory(period));
    /**
     * Number of milliseconds
     * @type {Ref<number>}
     */
    const now = toRef(instance, '$now');

    return {
        now,
    };
}
