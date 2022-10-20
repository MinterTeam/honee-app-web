<script>
import HeaderBanner from '~/layouts/_header-banner.vue';
import TheHeader from '~/layouts/_header.vue';
import Snackbar from '~/components/layout/Snackbar.vue';

export default {
    components: {
        HeaderBanner,
        TheHeader,
        Snackbar,
    },
    head: {
        htmlAttrs: {
            class: 'splash-layout',
        },
    },
};
</script>

<template>
    <div class="splash-layout__wrap">
        <HeaderBanner/>
        <TheHeader :simple="true"/>

        <nuxt class="splash-layout__inner"/>

        <Snackbar/>
    </div>
</template>
