<script>
import {suggestionValidatorFilter, suggestionValidatorContent} from "~/assets/utils.js";
import FieldQr from '~/components/base/FieldQr.vue';

/**
 * @readonly
 * @enum {string}
 */
const VALUE_TYPE = {
    ADDRESS: 'address',
    PUBLIC_KEY: 'publicKey',
};

export default {
    VALUE_TYPE,
    components: {
        FieldQr,
    },
    inheritAttrs: false,
    suggestionValidatorFilter,
    suggestionValidatorContent,
    props: {
        // self
        /** @type VALUE_TYPE */
        valueType: {
            type: String,
            required: true,
        },
        // nested
        value: {
            type: [String, Number],
            required: true,
        },
        $value: {
            type: Object,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        // self
        help: {
            type: String,
            default: '',
        },
        suggestionList: {
            type: Array,
            default: undefined,
        },
        suggestionDisabled: {
            type: Boolean,
            default: false,
        },
        suggestionMinInputLength: {
            type: Number,
            default: undefined,
        },

    },
    computed: {
        /**
         * @return {Array<SuggestionValidatorListItem>|undefined}
         */
        validatorList() {
            if (this.valueType !== VALUE_TYPE.PUBLIC_KEY) {
                return;
            }

            return this.$store.state.validatorMetaList.map((item) => {
                return {name: item.name || '', value: item.publicKey};
            });
        },
    },
    methods: {
        handleInput(inputValue) {
            inputValue = inputValue.trim();
            this.$emit('input', inputValue);
        },
    },
};
</script>

<template>
    <div>
        <FieldQr
            v-bind="$attrs"
            :value="value"
            @input="handleInput"
            :$value="$value"
            :label="label"
            :suggestionList="suggestionDisabled ? [] : (suggestionList || validatorList)"
            :suggestionMinInputLength="suggestionMinInputLength"
            :suggestionContent="$options.suggestionValidatorContent"
            :suggestionFilter="$options.suggestionValidatorFilter"
        />

        <template v-if="valueType === $options.VALUE_TYPE.ADDRESS && !$value.$pending">
            <span class="form-field__error" v-if="$value.$dirty && !$value.required">
                {{ $td('Enter address', 'form.wallet-send-address-error-required') }}
            </span>
            <span class="form-field__error" v-else-if="$value.$dirty && !$value.validAddress">
                {{ $td('Address is invalid', 'form.wallet-send-address-error-invalid') }}
            </span>
        </template>

        <template v-if="valueType === $options.VALUE_TYPE.PUBLIC_KEY && !$value.$pending">
            <span class="form-field__error" v-if="$value.$dirty && !$value.required">
                {{ $td('Enter public key', 'form.masternode-public-error-required') }}
            </span>
            <span class="form-field__error" v-else-if="$value.$dirty && !$value.validPublicKey">
                {{ $td('Public key is invalid', 'form.masternode-public-error-invalid') }}
            </span>
        </template>

        <div class="form-field__help" v-if="help">{{ help }}</div>
    </div>
</template>

