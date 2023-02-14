<script>
import {ref} from 'vue';
import { useIntervalFn } from '@vueuse/core';
import BackButton from '~/components/layout/BackButton.vue';

export default {
    components: {
        BackButton,
    },

    setup(props, context) {
        const pageContainerClass = ref('');
        useIntervalFn(() => {
            const pageEl = document.querySelector('[data-nuxt-page]');
            if (!pageEl || !pageEl.classList) {
                return;
            }
            const containerClassList = Array.from(pageEl.classList).filter((item) => item.indexOf('u-container--') === 0);
            pageContainerClass.value = containerClassList.join(' ');
        }, 100);

        return {
            pageContainerClass,
        };
    },
};
</script>

<template>
    <BackButton class="u-section--top u-container" :class="pageContainerClass"/>
</template>
