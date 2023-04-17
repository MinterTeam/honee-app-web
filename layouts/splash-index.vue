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
};
</script>

<template>
    <SplashLayout>
        <!-- workaround for Telegram Web App in iOS web view: opened keyboard covers input field -->
        <div class="u-section" :class="{'splash-layout__inner': !isIosWebView}">
            <div class="u-relative u-container u-container--mini">
                <img class="auth__logo" src="/img/logo-honee.svg" alt="Honee" width="280" height="56">
                <h3 class="auth__subtitle">{{ $td('Crypto wallet that helps you earn', 'index.sign-up-subtitle') }}</h3>
            </div>

            <nuxt/>

        </div>
    </SplashLayout>
</template>


