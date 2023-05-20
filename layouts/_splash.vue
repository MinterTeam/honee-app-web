<script>
import HeaderBanner from '~/layouts/_header-banner.vue';
import TheHeader from '~/layouts/_header.vue';
import FooterSupport from '~/layouts/_footer-support.vue';
import Snackbar from '~/components/layout/Snackbar.vue';

export default {
    components: {
        HeaderBanner,
        TheHeader,
        FooterSupport,
        Snackbar,
    },
    head() {
        return {
            htmlAttrs: {
                class: 'splash-layout' + ' ' + this.htmlClass,
            },
        };
    },
    computed: {
        htmlClass() {
            if (this.$store.getters.isMetagarden) {
                return 'theme--metagarden';
            }
            if (this.$store.getters.isMegachain) {
                return 'theme--megachain';
            }
            return '';
        },
    },
};
</script>

<template>
    <div class="splash-layout__wrap">
        <HeaderBanner v-if="!$store.getters.isMegachain"/>
        <TheHeader :simple="false" :show-language="true"/>

        <slot></slot>

        <FooterSupport/>
        <Snackbar/>
    </div>
</template>
