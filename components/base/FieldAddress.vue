<script>
import autosize from 'v-autosize';
import QrScan from '~/components/base/QrScan.vue';

export default {
    components: {
        QrScan,
    },
    directives: {
        autosize,
    },
    props: {
        value: {
            type: String,
            default: '',
        },
        $value: {
            type: Object,
            default: () => {
                return {$touch: () => {}};
            },
        },
        label: {
            type: String,
            default: 'Address',
        },
        placeholder: {
            type: String,
            default: 'Mx…',
        },
    },
    emits: [
        'input',
    ],
    data() {
        return {
        };
    },
    computed: {
    },
    mounted() {

    },
    methods: {

    },
};
</script>

<template>
    <div class="h-field">
        <div class="h-field__content">
            <div class="h-field__title">{{ label }}</div>
            <textarea
                class="h-field__input" rows="1" spellcheck="false" :placeholder="placeholder"
                v-autosize
                :value="value"
                @input="$emit('input', $event.target.value); $value.$touch()"
            ></textarea>
        </div>
        <QrScan class="h-field__aside" @qr-scanned="$emit('input', $event);"/>
    </div>
</template>
