<script>
export default {
    data() {
        return {
            showBanner: false, // don't init value here because of https://github.com/nuxt/nuxt.js/issues/1552
        };
    },
    beforeMount() {
        this.showBanner = !window.localStorage.getItem('honee-alpha-banner-accepted');
    },
    methods: {
        close() {
            window.localStorage.setItem('honee-alpha-banner-accepted', 'accepted');
            this.showBanner = false;
        },
    },
};
</script>

<template>
    <div class="alpha-banner" v-if="showBanner">
        <div class="alpha-banner__container u-container u-container--wide">
            <div class="alpha-banner__placeholder u-hidden-medium-down"></div>
            <div class="alpha-banner__content">
                <img class="alpha-banner__icon" src="/img/icon-alpha-banner.svg" alt="" role="presentation">
                <div class="alpha-banner__text">{{ $td('Honee\'s in alpha. <a class="link--default u-display-ib" href="https://minter.link/HoneeTests" target="_blank">Join testing and get crypto for feedback.</a>', 'index.alpha-banner') }}</div>
            </div>
            <button class="alpha-banner__close u-semantic-button link--opacity" type="button" @click="close()">
                <span class="alpha-banner__close-icon">{{ $td('Close', 'common.close') }}</span>
            </button>
        </div>
    </div>
</template>

<style lang="less">
.alpha-banner { padding: 12px 0; background: #4c596b; color: #fff;}
.alpha-banner__container {display: flex; align-items: center; justify-content: space-between;}
.alpha-banner__content {display: flex; align-items: center;}
.alpha-banner__icon {margin-right: 16px; flex-shrink: 0;}
.alpha-banner__text {font-size: 16px; font-weight: 600;}
.alpha-banner__placeholder {width: 24px; margin-right: 16px;}
.alpha-banner__close {width: 24px; height: 24px; margin-left: 16px; font-size: 0; position: relative;}
.alpha-banner__close-icon {
    &::before, &::after {content: ''; position: absolute; height: 2px; width: 20px; left: 50%; top: 50%; margin-left: -10px; margin-top: -1px; background: currentColor;}
    &::before {transform: rotate(45deg);}
    &::after {transform: rotate(-45deg);}
}
</style>

