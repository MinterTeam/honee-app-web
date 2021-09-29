<script>
import Footer from '~/layouts/_footer.vue';
import Language from '~/components/base/Language.vue';
import Snackbar from '~/components/base/Snackbar.vue';

export default {
    components: {
        Footer,
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
    <div class="wrapper page-landing">
        <div class="u-container u-container--wide header__language-container">
            <Language/>
        </div>

        <nuxt/>

        <Footer/>
        <Snackbar/>
    </div>
</template>
