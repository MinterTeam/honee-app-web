<script>
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
            required: true,
        },
        placeholder: {
            type: String,
        },
    },
    emits: [
        'input',
    ],
    data() {
        return {
            isSelectVisible: false,
        };
    },
    computed: {
        isSelectDisabled() {
            // 0 and >1 are OK (enabled)
            return this.list.length === 1;
        },
        list() {
            return this.suggestionList || [];
        },
    },
    mounted() {
        if (this.isSelectDisabled) {
            this.handleSelect(this.list[0]);
        }
    },
    methods: {
        getTitle(suggestion) {
            // if passed value is suggestion object
            if (suggestion.shortName || suggestion.name) {
                return suggestion.shortName || suggestion.name;
            }
            // if passed value is string
            const foundItem = this.list.find((item) => item.value === suggestion);
            return foundItem?.shortName || foundItem?.name || suggestion;
        },
        getIconUrl(suggestion) {
            // if passed value is suggestion object
            if (suggestion.icon) {
                return suggestion.icon || '';
            }
            // if passed value is string
            if (typeof suggestion === 'string' || typeof suggestion === 'number') {
                const foundItem = this.list.find((item) => item.value === suggestion);
                return foundItem?.icon || '';
            }
            return '';
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
        suggestionFilterDefault(item, query) {
            if (!query) {
                return true;
            }
            query = query.toLowerCase();

            return item.name.toLowerCase().includes(query) || item.shortName?.toLowerCase()?.includes(query);
        },
    },
};
</script>

<template>
    <div class="h-field">
        <div class="h-field__content">
            <div class="h-field__title">{{ label }}</div>
            <button class="h-field__select-button u-semantic-button" type="button" @click="openDropdown()" :disabled="isSelectDisabled">
                <img class="h-field__select-icon" :src="getIconUrl(value)" width="24" height="24" alt="" role="presentation" v-if="getIconUrl(value)">
                <span class="h-field__select-value">{{ getTitle(value) || placeholder || $td('Select value', 'form.select-value') }}</span>
                <img class="h-field__select-icon-arrow" src="/img/icon-dropdown.svg" alt="" role="presentation" width="24" height="24" v-if="!isSelectDisabled">
            </button>
        </div>

        <FieldCombinedBaseDropdown
            :list="list"
            :is-open.sync="isSelectVisible"
            :input-uppercase="false"
            :filter="suggestionFilterDefault"
            @select="handleSelect($event)"
        >
            <template v-slot:suggestion-item="{suggestion}">
                <img class="h-field__suggestion-icon" :src="getIconUrl(suggestion)" width="24" height="24" alt="" role="presentation">
                <span class="u-fw-600" v-if="suggestion.name">{{ suggestion.name }}</span>
                <span v-else class="u-ovh u-text-wrap">{{ suggestion.value }}</span>
            </template>
        </FieldCombinedBaseDropdown>
    </div>
</template>
