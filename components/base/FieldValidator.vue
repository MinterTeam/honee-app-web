<script>
import {shortHashFilter} from '~/assets/utils.js';
import checkEmpty from '~/assets/v-check-empty.js';
import FieldCombinedBaseDropdown from '~/components/base/FieldCombinedBaseDropdown.vue';

export default {
    components: {
        FieldCombinedBaseDropdown,
    },
    directives: {
        checkEmpty,
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
        suggestionList: {
            type: Array,
            default: () => [],
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        label: {
            type: String,
            default: 'Validator',
        },
    },
    emits: [
        'input',
        'select-suggestion',
    ],
    data() {
        return {
            isSelectVisible: false,
            selectedSuggestion: undefined,
            hasCamera: false,
        };
    },
    computed: {
        isSelectDisabled() {
            // 0 and >1 are OK (enabled)
            return this.list.length === 1;
        },
        list() {
            const validatorList = this.suggestionList.length ? this.suggestionList : this.$store.state.validatorMetaList;
            return validatorList.map((item) => {
                return {
                    iconUrl: item.iconUrl,
                    name: item.name || '',
                    publicKey: item.publicKey,
                };
            });
        },
        displayValue() {
            return this.selectedSuggestion?.name || this.selectedSuggestion?.publicKey || this.value;
        },
    },
    mounted() {
        if (this.isSelectDisabled) {
            this.handleSelect(this.list[0]);
        }
    },
    methods: {
        shortHashFilter,
        getIconUrl(suggestion) {
            return suggestion?.iconUrl ? suggestion.iconUrl : '/img/logo-minter.svg';
        },
        openDropdown() {
            if (this.isSelectDisabled) {
                return;
            }
            this.isSelectVisible = true;
        },
        handleSelect(item) {
            this.$emit('input', item.publicKey || item);
        },
        handleQrScanned(result) {
            this.handleSelect(result);
            // this.$value.$touch();
        },
    },
};
</script>

<template>
    <div class="h-field">
        <div class="h-field__content">
            <div class="h-field__title">{{ label }}</div>
            <button class="h-field__select-button u-semantic-button" type="button" @click="openDropdown()" :disabled="isSelectDisabled">
                <img class="h-field__select-icon" :src="getIconUrl(selectedSuggestion)" width="24" height="24" alt="" role="presentation" v-if="value">
                <span class="h-field__select-value">{{ displayValue || $td('Select validator', 'form.select-validator') }}</span>
                <img class="h-field__select-icon-arrow" src="/img/icon-dropdown.svg" alt="" role="presentation" width="24" height="24" v-if="!isSelectDisabled">
            </button>
        </div>

        <FieldCombinedBaseDropdown
            :list="list"
            value-attribute="publicKey"
            display-attribute="name"
            :max-suggestions="64"
            :is-open.sync="isSelectVisible"
            :input-uppercase="false"
            :selected-value="value"
            @select="handleSelect($event)"
            @select-suggestion="selectedSuggestion = $event; $emit('select-suggestion', $event)"
        >
            <template v-slot:suggestion-item="{suggestion}">
                <img class="h-field__suggestion-icon" :src="getIconUrl(suggestion)" width="24" height="24" alt="" role="presentation">
                <span class="u-fw-600" v-if="suggestion.name">{{ suggestion.name }}</span>
                <span v-else class="u-ovh u-text-wrap">{{ suggestion.publicKey }}</span>
                <span v-if="suggestion.delegatedAmount">({{ suggestion.delegatedAmount }})</span>
            </template>
        </FieldCombinedBaseDropdown>
    </div>
</template>
