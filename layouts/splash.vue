<script>
import AlphaBanner from '~/layouts/_alpha-banner.vue';
import Language from '~/components/base/Language.vue';
import Snackbar from '~/components/base/Snackbar.vue';

export default {
    components: {
        AlphaBanner,
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
        <AlphaBanner/>
        <div class="u-container u-container--wide header__language-container">
            <Language/>
        </div>

        <nuxt class="u-container u-container--mini"/>

        <Snackbar/>
    </div>
</template>
