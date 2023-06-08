<script>
import SplashLayout from '~/layouts/_splash.vue';

export default {
    components: {
        SplashLayout,
    },
    head() {
        return {
            bodyAttrs: {
                class: 'auth__body layout--hide-header-logo layout--transparent-header',
            },
        };
    },
    computed: {
        fixIosWebView() {
            return this.$store.getters.isIosWebView && !this.$store.getters.isMegagamer;
        },
    },
};
</script>

<template>
    <SplashLayout>
        <!-- workaround for Telegram Web App in iOS web view: opened keyboard covers input field -->
        <div
            class="u-section"
            :class="{'splash-layout__inner': !fixIosWebView}"
            :style="fixIosWebView ? 'padding-bottom: 400px' : ''"
        >
            <div class="u-relative u-container u-container--mini">
                <template v-if="$store.getters.isHonee">
                    <img class="auth__logo u-mb-15" src="/img/logo-honee.svg" alt="Honee" width="280" height="56">
                    <h3 class="auth__subtitle u-mb-25">{{ $td('Crypto wallet that helps you earn', 'index.sign-up-subtitle') }}</h3>
                </template>
                <template v-if="$store.getters.isMegachain">
                    <img class="auth__logo u-mb-20" src="/img/logo-megachain-center.svg" alt="Metagarden Chain" width="193" height="180">
                    <h3 class="auth__subtitle-2">{{ $td('Metagarden Chain Wallet', 'index.megachain-sign-up-subtitle') }}</h3>
                    <p class="auth__p u-mb-15">{{ $td('Get +100% bonus & airdrops from games', 'index.megachain-sign-up-p') }}</p>
                </template>
                <template v-if="$store.getters.isMegagamer">
                    <img class="auth__logo u-mb-20" src="/img/logo-megachain-center.svg" alt="Metagarden Chain" width="193" height="180">
                    <h3 class="auth__subtitle-2 u-mb-05">{{ $td('Get your GamerID', 'index.megagamer-sign-up-subtitle') }}</h3>
                    <p class="auth__p u-mb-15">{{ $td('Please get verified with your Telegram account. Other verification methods may become available later.', 'index.megagamer-sign-up-p') }}</p>
                </template>
            </div>

            <nuxt/>

        </div>
    </SplashLayout>
</template>


