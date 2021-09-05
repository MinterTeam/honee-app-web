<script>
import Snackbar from '~/components/base/Snackbar.vue';

export default {
    components: {
        Snackbar,
    },
    head: {
        htmlAttrs: {
            class: 'simple-layout',
        },
    },
};
</script>

<template>
    <div class="">
        <nuxt/>

        <Snackbar/>
    </div>
</template>
