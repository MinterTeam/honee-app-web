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
    ],
    data() {
        return {
            isSelectVisible: false,
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
                    value: item.publicKey,
                };
            });
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
            return suggestion.iconUrl ? suggestion.iconUrl : '/img/logo-minter.svg';
        },
        openDropdown() {
            if (this.isSelectDisabled) {
                return;
            }
            this.isSelectVisible = true;
        },
        handleSelect(item) {
            this.$emit('input', item.value || item);
        },
        handleQrScanned(result) {
            this.handleSelect(result);
            // this.$value.$touch();
        },
        suggestionFilterDefault(item, query) {
            if (!query) {
                return true;
            }

            const visibleTitle = item.name || item.publicKey;
            return visibleTitle.toLowerCase().indexOf(query.toLowerCase()) >= 0;
        },
    },
};
</script>

<template>
    <div class="h-field">
        <div class="h-field__content">
            <div class="h-field__title">{{ label }}</div>
            <button class="h-field__select-button u-semantic-button" type="button" @click="openDropdown()" :disabled="isSelectDisabled">
                <img class="h-field__select-icon" :src="getIconUrl(value)" width="24" height="24" alt="" role="presentation" v-if="value">
                <span class="h-field__select-value">{{ value || $td('Select validator', 'form.select-validator') }}</span>
                <img class="h-field__select-icon-arrow" src="/img/icon-dropdown.svg" alt="" role="presentation" width="24" height="24" v-if="!isSelectDisabled">
            </button>
        </div>

        <FieldCombinedBaseDropdown
            :list="list"
            :max-suggestions="64"
            :is-open.sync="isSelectVisible"
            :input-uppercase="false"
            :filter="suggestionFilterDefault"
            @select="handleSelect($event)"
        >
            <template v-slot:suggestion-item="{suggestion}">
                <img class="h-field__suggestion-icon" :src="getIconUrl(suggestion)" width="24" height="24" alt="" role="presentation">
                <span class="u-fw-600" v-if="suggestion.name">{{ suggestion.name }}</span>
                <span v-else class="u-ovh u-text-wrap">{{ suggestion.value }}</span>
                <span v-if="suggestion.delegatedAmount">({{ suggestion.delegatedAmount }})</span>
            </template>
        </FieldCombinedBaseDropdown>
    </div>
</template>
