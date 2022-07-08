<script>
import * as clipboard from 'clipbrd';

export default {
    props: {
        copyText: {
            type: String,
            required: true,
        },
    },
    computed: {
        isClipboardSupported() {
            return clipboard.isSupported();
        },
    },
    methods: {
        copy(str) {
            const isCopied = clipboard.copy(str.toString());
            if (isCopied) {
                // show snackbar
                this.$store.commit('SET_SNACKBAR_ACTIVE');
            }
        },
    },
};
</script>

<template>
    <button v-if="isClipboardSupported" @click="copy(copyText)" type="button">
        <slot/>
    </button>
</template>
