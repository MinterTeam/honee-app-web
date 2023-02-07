<script>
import HeaderBanner from '~/layouts/_header-banner.vue';
import TheHeader from '~/layouts/_header.vue';
import TheFooter from '~/layouts/_footer.vue';
import FooterGarden from '~/components/layout/FooterGarden.vue';
import BackButtonFull from '~/components/layout/BackButtonFull.vue';
import ConnectionNotice from '~/components/layout/ConnectionNotice.vue';
import Snackbar from '~/components/layout/Snackbar.vue';

export default {
    components: {
        HeaderBanner,
        TheHeader,
        TheFooter,
        FooterGarden,
        // BackButtonFull,
        ConnectionNotice,
        Snackbar,
    },
    head: {
        htmlAttrs: {
            class: 'metagarden-layout theme--metagarden',
        },
        // bodyAttrs: {
        //     class: 'default-layout',
        // },
    },

};
</script>

<template>
    <div>
        <HeaderBanner/>
        <TheHeader :is-metagarden="true"/>

        <!--<BackButtonFull/>-->

        <div class="u-section u-container">
            <nuxt class=""/> <!--data-nuxt-page-->
        </div>

        <TheFooter/>
        <FooterGarden/>

        <ConnectionNotice/>
        <Snackbar/>
    </div>
</template>
