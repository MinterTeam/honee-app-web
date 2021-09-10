<script>
import Language from '~/components/base/Language.vue';
import Snackbar from '~/components/base/Snackbar.vue';

export default {
    components: {
        Language,
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
        <div class="u-container u-container--wide header__language-container">
            <Language/>
        </div>

        <nuxt/>

        <Snackbar/>
    </div>
</template>
