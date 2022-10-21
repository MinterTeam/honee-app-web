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
        <div class="card card--invert">
            <div class="card__content card__content--medium">
                <h1 class="card__action-title-value">{{ $td('Create portfolio', 'portfolio.manage-create-title') }}</h1>
<!--                <p class="card__action-description u-mt-05">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus.</p>-->
            </div>

            <PortfolioManageForm/>
        </div>
    </div>
</template>
