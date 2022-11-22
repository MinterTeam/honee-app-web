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
                class: 'splash-layout',
            },
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card--invert card--battle">
            <div class="card__content card__content--medium">
                <h1 class="card__action-title-value">{{ $td('Create portfolio', 'portfolio.manage-create-title') }}</h1>
                <p class="card__action-description u-mt-05">
                    {{ $td('Choose from 2 to 10 tokens and specify the allocation percentage.', 'battle.create-description-1') }}
                </p>
            </div>

            <PortfolioManageForm/>
        </div>
    </div>
</template>
