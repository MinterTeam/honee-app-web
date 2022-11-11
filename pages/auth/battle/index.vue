<script>
import getTitle from '~/assets/get-title.js';

export default {
    layout: 'splash',
    components: {
    },
    head() {
        return {
            title: getTitle(this.$td('Portfolio battle', 'portfolio.battle-title')),
            meta: [
                { hid: 'og-title', name: 'og:title', content: getTitle(this.$td('Portfolio battle', 'portfolio.battle-title')) },
            ],
            htmlAttrs: {
                class: 'splash-layout splash-layout--battle layout--transparent-header',
            },
            bodyAttrs: {
                class: 'battle__body',
            },
        };
    },
    methods: {

    },
};
</script>

<template>
    <div class="u-section u-relative u-container u-container--mini u-container--mini--always">
        <img class="battle__splash-top-image" src="/img/battle-coin-top.png" srcset="/img/battle-coin-top@2x.png 2x" alt="" role="presentation" width="50" height="59">
        <img class="battle__splash-title" :src="`/img/battle-title-${$i18n.locale}.svg`" :alt="$td('Portfolio battle', 'portfolio.battle-title')" height="106">

        <nuxt-link class="button button--white button--full button--large" :to="$i18nGetPreferredPath('/auth/sign-up?battle=true')">
            {{ $td('Sign up', 'index.sign-up') }}
        </nuxt-link>

        <div class="u-text-center u-mt-15">
            <nuxt-link class="link link--underline u-fw-700" :to="$i18nGetPreferredPath('/auth/sign-in?battle=true')">
                {{ $td('Sign in', 'index.sign-in') }}
            </nuxt-link>
        </div>

        <img class="battle__splash-bottom-image" src="/img/battle-portfolio-bottom.png" srcset="/img/battle-portfolio-bottom@2x.png 2x" alt="" role="presentation" width="398" height="315">
    </div>
</template>

