<script>
import PortfolioManageForm from '~/components/PortfolioManageForm.vue';

export default {
    layout: 'splash',
    components: {
        PortfolioManageForm,
    },
    head() {
        return {
            htmlAttrs: {
                class: 'splash-layout splash-layout--battle',
            },
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card--invert card--transparent">
            <div class="card__content card__content--medium">
                <h1 class="card__action-title-value">{{ $td('Create portfolio', 'portfolio.manage-create-title') }}</h1>
                <p class="card__action-description u-mt-05">
                    {{ $td('Choose from 2 to 10 tokens and specify the allocation percentage.', 'battle.create-description-1') }}
                </p>
                <p class="card__action-description">
                    <strong>{{ $td('Remember:', 'battle.create-remember') }}</strong>
                    {{ $td('you can create only one portfolio and edit it once a day.', 'battle.create-description21') }}
                </p>
            </div>

            <PortfolioManageForm/>
        </div>
    </div>
</template>
