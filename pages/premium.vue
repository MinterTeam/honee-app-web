<script>
import StakeByLock from '~/components/StakeByLock.vue';

export default {
    components: {
        StakeByLock,
    },
    data() {
        return {
        };
    },
    computed: {
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card--invert">
            <div class="card__content card__content--medium">
                <h1 class="card__action-title-value">🌟 {{ $t('premium.activate-title') }}</h1>
                <p class="card__action-description u-mt-05">
                    {{ $td('To activate a premium account, lock at least 1000 BEE. The lockup period is 5 years. Once over, you will be able to use your coins again.', 'premium.activate-description') }}
                </p>
            </div>

            <div class="card card--pop card--light-grey">
                <StakeByLock
                    class="card__content card__content--medium"
                    :params="{id: 23}"
                    :action="{title: $t('premium.activate-title')}"
                    @success-modal-close="$router.push(getDashboardUrl())"
                />


                <div class="card__content card__content--medium u-text-medium">
                    <h3 class="u-h5 u-mb-05">{{ $td('Premium levels', 'premium.levels-title') }} (<a :href="$td('https://honee.app/bee', 'premium.levels-more-url')" class="link--hover link--main" target="_blank">{{ $td('learn more', 'premium.levels-more') }}</a>)</h3>
                    <ul v-if="$i18n.locale === 'en'" class="list-simple">
                        <li>LEVEL 1 - from 1 000 BEE</li>
                        <li>LEVEL 2 - from 10 000 BEE</li>
                        <li>LEVEL 3 - from 100 000 BEE</li>
                    </ul>
                    <ul v-if="$i18n.locale === 'ru'" class="list-simple">
                        <li>LEVEL 1 - от 1 000 BEE</li>
                        <li>LEVEL 2 - от 10 000 BEE</li>
                        <li>LEVEL 3 - от 100 000 BEE</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
