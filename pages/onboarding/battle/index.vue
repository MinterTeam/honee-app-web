<script>
import TelegramAuth from '~/components/TelegramAuth.vue';

export default {
    layout: 'splash',
    components: {
        TelegramAuth,
    },
    head() {
        return {
            htmlAttrs: {
                class: 'splash-layout splash-layout--battle',
            },
        };
    },
    methods: {
    },
};
</script>

<template>
    <div class="u-section u-relative u-container u-container--small">
        <div class="card card__content card--light-grey u-text-center">
            <img class="u-mb-05" src="/img/battle-begin.png" srcset="/img/battle-begin@2x.png 2x" alt="" role="presentation">
            <h1 class="u-h3 u-mb-05">{{ $td('Let the Battle Begin!', 'battle.begin-title') }}</h1>
            <p>{{ $td('You’ve registered for the tournament. Now log in with Telegram and create your&nbsp;portfolio.', 'battle.begin-description') }}</p>

            <TelegramAuth class="u-mt-10 u-mb-10"/>

            <component
                :is="$store.getters['telegram/isAuthorized'] ? 'nuxt-link' : 'div'"
                class="button button--main button--full"
                :class="{'is-disabled': !$store.getters['telegram/isAuthorized']}"
                :to="$i18nGetPreferredPath('/onboarding/battle/create-portfolio')"
            >
                {{ $td('Create portfolio', 'portfolio.create-new-link') }}
            </component>
        </div>
    </div>
</template>

