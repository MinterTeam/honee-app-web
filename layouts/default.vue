<script>
import {DASHBOARD_URL_METAGARDEN} from '~/assets/variables.js';
import HeaderBanner from '~/layouts/_header-banner.vue';
import TheHeader from '~/layouts/_header.vue';
import TheHeaderMetagarden from '~/layouts/_header-metagarden.vue';
import TheFooter from '~/layouts/_footer.vue';
import FooterGarden from '~/components/layout/FooterGarden.vue';
import BackButtonFull from '~/components/layout/BackButtonFull.vue';
import ConnectionNotice from '~/components/layout/ConnectionNotice.vue';
import Snackbar from '~/components/layout/Snackbar.vue';

export default {
    components: {
        HeaderBanner,
        TheHeader,
        TheHeaderMetagarden,
        TheFooter,
        FooterGarden,
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
        isHonee() {
            return !this.isMetagarden;
        },
        htmlClass() {
            if (this.isMetagarden) {
                return 'metagarden-layout theme--metagarden';
            }
            return '';
        },
        bodyClass() {
            if (this.isMetagarden) {
                return '';
            }
            return 'default-layout';
        },
    },
};
</script>

<template>
    <div>
        <HeaderBanner/>
        <TheHeaderMetagarden v-if="isMetagarden"/>
        <TheHeader v-else :show-language="false"/>

        <BackButtonFull v-if="isHonee"/>

        <nuxt class="u-section u-container" data-nuxt-page/>

        <TheFooter/>
        <FooterGarden v-if="isHonee"/>

        <ConnectionNotice/>
        <Snackbar/>
    </div>
</template>
