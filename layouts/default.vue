<script>
import {ref} from '@vue/composition-api';
import { useIntervalFn } from '@vueuse/core';
import TheHeader from '~/layouts/_header.vue';
import TheFooter from '~/layouts/_footer.vue';
import BackButton from '~/components/layout/BackButton.vue';
import ConnectionNotice from '~/components/layout/ConnectionNotice.vue';
import Snackbar from '~/components/layout/Snackbar.vue';

export default {
    components: {
        TheHeader,
        TheFooter,
        BackButton,
        ConnectionNotice,
        Snackbar,
    },
    head: {
        bodyAttrs: {
            class: 'default-layout',
        },
    },
    setup(props, context) {
        const pageContainerClass = ref('');
        useIntervalFn(() => {
            const pageEl = context.refs.nuxtPage?.$el;
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
    methods: {
        logout() {
            this.$store.commit('LOGOUT');
            this.$router.push('/auth');
        },
    },
};
</script>

<template>
    <div>
        <TheHeader/>

        <BackButton class="u-section--top u-container" :class="pageContainerClass"/>

        <nuxt class="u-section u-container" ref="nuxtPage"/>

        <TheFooter/>

        <ConnectionNotice/>
        <Snackbar/>
    </div>
</template>
