<script>
import Snackbar from '~/components/base/Snackbar.vue';

export default {
    components: {
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
    <div class="splash-layout__container u-container u-container--small">
        <div class="splash-layout__inner">
            <nuxt/>
        </div>

        <Snackbar/>
    </div>
</template>
