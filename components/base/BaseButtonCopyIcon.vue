<script>
import InlineSvg from 'vue-inline-svg';
import ButtonCopy from '~/components/base/BaseButtonCopy.vue';

export default {
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

<template>
    <ButtonCopy class="u-icon u-semantic-button link--opacity" aria-label="Copy" :copy-text="copyText">
        <img v-if="!isInline" :src="`${BASE_URL_PREFIX}/img/icon-copy.svg`" alt=""/>
        <InlineSvg v-else :src="`${BASE_URL_PREFIX}/img/icon-copy.svg`"/>
    </ButtonCopy>
</template>
