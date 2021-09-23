<script>
import VueSimpleSuggest from 'vue-simple-suggest/lib/vue-simple-suggest.vue';
import checkEmpty from '~/assets/v-check-empty.js';
import QrScan from '~/components/base/QrScan.vue';
import Loader from '~/components/base/BaseLoader.vue';

const MAX_ITEM_COUNT = 5;

export default {
    ideFix: null,
    MAX_ITEM_COUNT,
    components: {
        VueSimpleSuggest,
        QrScan,
        Loader,
    },
    directives: {
        checkEmpty,
    },
    inheritAttrs: false,
    props: {
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
        suggestionList: {
            type: Array,
            default: () => [],
        },
        suggestionFilter: {
            type: Function,
            default: undefined,
        },
        suggestionContent: {
            type: Function,
            default: undefined,
        },
        suggestionMinInputLength: {
            type: Number,
            default: 1,
        },
    },
    data() {
        return {
            hasCamera: false,
        };
    },
    methods: {
        handleQrScanned(result) {
            this.$emit('input', result);
            this.$value.$touch();
        },
        handleSuggestionClick(item, e) {
            // prevent reopen suggestion list by parent label click
            e.preventDefault();
        },
    },
};
</script>

<template>
    <label class="form-field form-field--qr" :class="{'is-error': $value.$error, 'form-field--with-icon': hasCamera}">
        <VueSimpleSuggest
            v-bind="$attrs"
            :value="value"
            :list="suggestionList.slice(0)"
            :max-suggestions="$options.MAX_ITEM_COUNT"
            :min-length="suggestionMinInputLength"
            :filter-by-query="true"
            :filter="suggestionFilter"
            :destyled="true"
            :controls="{showList: [38, 40]}"
            :value-attribute="'value'"
            :display-attribute="'value'"
            @input="$emit('input', $event)"
            @blur="$value.$touch(); $emit('blur', $event)"
            @suggestion-click="handleSuggestionClick"
            v-if="suggestionList && suggestionList.length"
        >
            <!--@select="(item) => $emit('input', item.value)"-->
            <input
                class="form-field__input" type="text" spellcheck="false" v-check-empty
                v-bind="$attrs"
                :value="value"
            >
            <span class="form-field__label">{{ label }}</span>

            <template v-slot:suggestion-item="slotScope" v-if="suggestionContent">
                <span v-html="suggestionContent(slotScope)"></span>
            </template>
        </VueSimpleSuggest>
        <template v-else>
            <input class="form-field__input" type="text" autocapitalize="off" spellcheck="false" v-check-empty
                   v-bind="$attrs"
                   :value="value"
                   @input="$emit('input', $event.target.value)"
                   @blur="$value.$touch(); $emit('blur', $event)"
            >
            <span class="form-field__label">{{ label }}</span>
        </template>
        <Loader class="form-field__icon form-field__icon--loader form-field__icon--second" :isLoading="$value.$pending"/>
        <QrScan @qr-scanned="handleQrScanned" :qrVisible.sync="hasCamera"/>
    </label>
</template>

