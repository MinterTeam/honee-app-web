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
        BackButtonFull,
        ConnectionNotice,
        Snackbar,
    },
    head: {
        bodyAttrs: {
            class: 'default-layout',
        },
    },
    fetch() {
        if (this.$store.state.isMetagarden) {
            return this.$router.replace(this.$i18nGetPreferredPath('/metagarden/account'));
        }
    },
};
</script>

<template>
    <div>
        <HeaderBanner/>
        <TheHeader/>

        <BackButtonFull/>

        <nuxt class="u-section u-container" data-nuxt-page/>

        <TheFooter/>
        <FooterGarden/>

        <ConnectionNotice/>
        <Snackbar/>
    </div>
</template>
