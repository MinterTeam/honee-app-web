<script>
import {DASHBOARD_URL_METAGARDEN} from '~/assets/variables.js';
import HeaderBanner from '~/layouts/_header-banner.vue';
import TheHeader from '~/layouts/_header.vue';
import TheHeaderMetagarden from '~/layouts/_header-metagarden.vue';
import TheHeaderMegachain from '~/layouts/_header-megachain.vue';
import TheFooter from '~/layouts/_footer.vue';
import FooterGarden from '~/components/layout/FooterGarden.vue';
import FooterSupport from '~/layouts/_footer-support.vue';
import BackButtonFull from '~/components/layout/BackButtonFull.vue';
import ConnectionNotice from '~/components/layout/ConnectionNotice.vue';
import Snackbar from '~/components/layout/Snackbar.vue';

export default {
    components: {
        HeaderBanner,
        TheHeader,
        TheHeaderMetagarden,
        TheHeaderMegachain,
        TheFooter,
        FooterGarden,
        FooterSupport,
        BackButtonFull,
        ConnectionNotice,
        Snackbar,
    },
    head() {
        return {
            htmlAttrs: {
                class: this.htmlClass,
            },
            bodyAttrs: {
                class: this.bodyClass,
            },
        };
    },
    fetch() {
        // if (this.$store.getters.isMetagarden) {
        //     return this.$router.replace(this.$i18nGetPreferredPath(DASHBOARD_URL_METAGARDEN));
        // }
    },
    computed: {
        isMetagarden() {
            return this.$options.subapp === 'metagarden' || this.$store.getters.isMetagarden;
        },
        isMegachain() {
            return this.$store.getters.isMegachain;
        },
        isHonee() {
            return !this.isMetagarden && !this.isMegachain;
        },
        htmlClass() {
            if (this.isMetagarden) {
                return 'metagarden-layout theme--metagarden';
            }
            if (this.isMegachain) {
                return 'megachain-layout theme--megachain';
            }
            return '';
        },
        bodyClass() {
            if (this.isMetagarden || this.isMegachain) {
                return '';
            }
            return 'default-layout';
        },
    },
};
</script>

<template>
    <div>
        <HeaderBanner v-if="!isMegachain"/>
        <TheHeaderMetagarden v-if="isMetagarden"/>
        <TheHeaderMegachain v-else-if="isMegachain"/>
        <TheHeader v-else :show-language="false"/>

        <BackButtonFull v-if="isHonee"/>

        <nuxt class="u-section u-container" data-nuxt-page/>

        <TheFooter/>
        <FooterGarden v-if="isHonee"/>
        <FooterSupport/>

        <ConnectionNotice/>
        <Snackbar/>
    </div>
</template>
