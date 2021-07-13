<script>
    import {IMaskDirective} from 'vue-imask';

    export default {
        directives: {
            imask: IMaskDirective,
        },
        props: {
            initialValue: {
                type: String,
                default: '',
            },
        },
        data() {
            return {
                imaskPhoneOptions: {
                    mask: /^\+[0-9 ()\-./]*$/,
                    prepare: (char, masked) => {
                        if (char && char !== '+' && !masked._value.length) {
                            return '+' + char;
                        } else {
                            return char;
                        }
                    },
                },
                // phoneMasked: this.initialValue,
            };
        },
        mounted() {
            this.updateMaskState(this.initialValue);
        },
        methods: {
            updateMaskState(value) {
                this.$refs.maskInput.maskRef.typedValue = value;
                const maskedValue = this.$refs.maskInput.maskRef._value;
                const cursorPos = maskedValue.length;
                this.$refs.maskInput.maskRef._selection = {start: cursorPos, end: cursorPos};
            },
            onAcceptPhone(e) {
                e.detail._unmaskedValue = '+' + e.detail._value.replace(/\D/g, '');
                this.$emit('accept', e);
            },
        },
    };
</script>

<template>
    <input type="tel" ref="maskInput" v-imask="imaskPhoneOptions" @accept="onAcceptPhone"/>
</template>
