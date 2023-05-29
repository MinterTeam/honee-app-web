<script>
export default {
};
</script>

<template>
    <a class="link--opacity footer-support" href="https://t.me/HoneeSupportBot" target="_blank" v-if="$store.getters.isMegachain || $store.getters.isMegagamer">
        <img class="u-image-center u-mb-025" src="/img/icon-support.png" srcset="/img/icon-support@2x.png" width="32" height="32" alt="">
        {{ $td('Support', 'index.support-button') }}
    </a>
</template>

<style>
.footer-support {
    position: fixed;
    bottom: 16px;
    right: 16px;
    text-align: center;
    font-weight: 700;
    font-size: 12px;
}
</style>

