<script>
import InlineSvg from 'vue-inline-svg';
import ButtonCopy from '~/components/base/BaseButtonCopy.vue';
import {BASE_URL_PREFIX} from '~/assets/variables.js';

export default {
    BASE_URL_PREFIX,
    components: {
        InlineSvg,
        ButtonCopy,
    },
    props: {
        copyText: {
            type: String,
            required: true,
        },
        isInline: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<template functional>
    <component
        :is="$options.components.ButtonCopy"
        class="u-icon u-semantic-button link--opacity" aria-label="Copy"
        :class="[data.staticClass, data.class]"
        v-bind="data.attrs"
        :copy-text="props.copyText"
    >
        <img v-if="!props.isInline" :src="`${$options.BASE_URL_PREFIX}/img/icon-copy.svg`" alt=""/>
        <component v-else :is="$options.components.InlineSvg" :src="`${$options.BASE_URL_PREFIX}/img/icon-copy.svg`"/>
    </component>
</template>
