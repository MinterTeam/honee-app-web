<script>
import tooltip from 'v-tooltip/src/directives/v-tooltip.js';
import InlineSvg from 'vue-inline-svg';

export default {
    name: 'BaseTooltip',
    components: {
        InlineSvg,
    },
    directives: {
        tooltip,
    },
    props: {
        content: {
            type: String,
        },
    },
    computed: {
        tooltipOptions() {
            return {
                content: this.content,
                trigger: 'click hover focus',
            };
        },
    },
};
</script>

<template>
    <button
        v-if="content"
        type="button"
        class="u-semantic-button u-flex-item--no-shrink u-ml-10"
        aria-label="More info"
        v-tooltip="tooltipOptions"
    >
        <InlineSvg class="u-image u-text-main" src="/img/icon-info.svg" alt="" fill="currentColor"/>
    </button>
</template>
