<script>
import PortfolioBattleTable from '~/components/PortfolioBattleTable.vue';

export default {
    layout: 'embed',
    components: {
        PortfolioBattleTable,
    },
    mounted() {
        this.$refs.embedBattleTable.$el.addEventListener('click', this.handleClick, true);
    },
    beforeDestroy() {
        this.$refs.embedBattleTable.$el.removeEventListener('click', this.handleClick, true);
    },
    methods: {
        /**
         *
         * @param {Event} event
         */
        handleClick(event) {
            if (event.target.nodeName === 'A') {
                event.preventDefault();
                event.stopImmediatePropagation();
                const url = window.location.origin + this.$i18nGetPreferredPath('/auth/battle');
                window.open(url, '_blank');
            }
        },
    },
};
</script>

<template>
    <PortfolioBattleTable ref="embedBattleTable" :limit="10"/>
</template>
