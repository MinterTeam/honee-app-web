<script>
import SplashLayout from '~/layouts/_splash.vue';

export default {
    components: {
        SplashLayout,
    },
};
</script>

<template>
    <SplashLayout>
        <nuxt
            class="splash-layout__inner"
            :class="{'splash-layout__inner': !isIosWebView}"
            :style="isIosWebView ? 'padding-bottom: 400px' : ''"
        />
    </SplashLayout>
</template>
