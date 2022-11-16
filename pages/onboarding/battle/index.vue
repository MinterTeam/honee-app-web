<script>
import {getPortfolioList} from '~/api/portfolio.js';
import BaseLoader from '~/components/base/BaseLoader.vue';
import TelegramAuth from '~/components/TelegramAuth.vue';

export default {
    layout: 'splash',
    components: {
        BaseLoader,
        TelegramAuth,
    },
    fetch() {
        return getPortfolioList({owner: this.$store.getters.address})
            .then((result) => {
                this.portfolio = result.list[0];
            });
    },
    head() {
        return {
            htmlAttrs: {
                class: 'splash-layout splash-layout--battle',
            },
        };
    },
    data() {
        return {
            portfolio: undefined,
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

            <div v-if="$fetchState.pending" class="u-text-center u-mt-10">
                <BaseLoader class="" :is-loading="true"/>
            </div>

            <template v-else-if="!portfolio">
                <p>{{ $td('You’ve registered for the tournament. Now you need to login via Telegram and create your portfolio.', 'battle.begin-description') }}</p>

                <TelegramAuth class="u-mt-10 u-mb-10" reason="battle"/>

                <component
                    :is="$store.getters['telegram/isAuthorized'] ? 'nuxt-link' : 'div'"
                    class="button button--main button--full"
                    :class="{'is-disabled': !$store.getters['telegram/isAuthorized']}"
                    :to="$i18nGetPreferredPath('/onboarding/battle/create-portfolio')"
                >
                    {{ $td('Create portfolio', 'portfolio.create-new-link') }}
                </component>
            </template>

            <template v-else>
                <p>{{ $td('You’ve registered for the tournament. You already have a portfolio.', 'battle.begin-description-already-created') }}</p>

                <nuxt-link
                    class="button button--main button--full u-mt-10"
                    :to="$i18nGetPreferredPath(`/portfolio/${portfolio.id}`)"
                >
                    {{ $td('View portfolio', 'portfolio.view-button') }}
                </nuxt-link>
            </template>
        </div>
    </div>
</template>

