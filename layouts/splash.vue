<script>
import HeaderBanner from '~/layouts/_header-banner.vue';
import Language from '~/components/layout/Language.vue';
import Snackbar from '~/components/layout/Snackbar.vue';

export default {
    components: {
        HeaderBanner,
        Language,
        Snackbar,
    },
    head: {
        bodyAttrs: {
            class: 'splash-layout',
        },
    },
};
</script>

<template>
    <div class="splash-layout__wrap">
        <HeaderBanner/>
        <div class="u-container u-container--wide header__language-container">
            <Language/>
        </div>

        <nuxt class="u-container"/>

        <Snackbar/>
    </div>
</template>
