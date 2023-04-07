<script>
import _get from 'lodash-es/get.js';
import checkEmpty from '~/assets/v-check-empty.js';
import InputUppercase from '@/components/base/InputUppercase.vue';

const MAX_ITEM_COUNT = 6;

export default {
    components: {
        InputUppercase,
    },
    directives: {
        checkEmpty,
    },
    inheritAttrs: false,
    props: {
        isOpen: {
            type: Boolean,
            required: true,
        },
        list: {
            type: Array,
            default: () => [],
        },
        maxSuggestions: {
            type: Number,
            default: MAX_ITEM_COUNT,
        },
        filter: {
            type: Function,
        },
        valueAttribute: {
            type: String,
            default: 'value',
        },
        displayAttribute: {
            type: String,
        },
        inputUppercase: {
            type: Boolean,
            default: true,
        },
        inputPlaceholder: {
            type: String,
        },
        selectedValue: {
            type: String,
        },
    },
    emits: [
        'update:isOpen',
        'select',
        'select-suggestion',
        'blur',
        'focus',
    ],
    data() {
        return {
            value: '',
            disableOutsideClick: false,
        };
    },
    computed: {
        suggestionListFinal() {
            const suggestionFilter = typeof this.filter === 'function' ? this.filter : this.suggestionFilterDefault;

            return this.list
                .filter((item) => suggestionFilter(item, this.value))
                .sort((a, b) => {
                    // set coin from query on first position
                    if (a === this.value) {
                        return -1;
                    } else if (b === this.value) {
                        return 1;
                    } else {
                        return 0;
                    }
                })
                .slice(0, this.maxSuggestions);
        },
        selectedSuggestion() {
            return this.list.find((suggestion) => {
                if (typeof suggestion !== 'object') {
                    return;
                }
                const value = _get(suggestion, this.valueAttribute);
                return this.selectedValue === value;
            });
        },
    },
    watch: {
        isOpen(newVal) {
            if (newVal) {
                setTimeout(() => {
                    // depends on if $refs.input is VueComponent or HtmlElement
                    const inputEl = this.$refs.input.$el || this.$refs.input;
                    inputEl.focus();
                }, 50);
                // prevent immediate close after opening
                this.disableOutsideClick = true;
                setTimeout(() => {
                    this.disableOutsideClick = false;
                }, 500);
            }
        },
        selectedSuggestion: {
            handler() {
                this.$emit('select-suggestion', this.selectedSuggestion);
            },
        },
    },
    created() {
        window.document.documentElement.addEventListener('click', this.handleOutsideClick);
        window.document.documentElement.addEventListener('keydown', this.handleEscape);
    },
    beforeDestroy() {
        window.document.documentElement.removeEventListener('click', this.handleOutsideClick);
        window.document.documentElement.removeEventListener('keydown', this.handleEscape);
    },
    methods: {
        suggestionFilterDefault(item, query) {
            if (!query) {
                return true;
            }
            query = query.toLowerCase();
            const value = this.getSuggestionValue(item).toLowerCase();
            const display = this.getSuggestionDisplay(item).toLowerCase();
            // keep only values started with query (e.g. remove "WALLET" for "LET" query)
            return value.indexOf(query) === 0 || display.indexOf(query) === 0;
        },
        handleSuggestionClick(value) {
            if (value) {
                this.$emit('select', this.getSuggestionValue(value));
            } else {
                // this.$emit('cancel');
            }
            this.close();
        },
        handleOutsideClick(e) {
            if (!this.isOpen) {
                return;
            }
            if (this.disableOutsideClick) {
                return;
            }
            // outside click
            if (this.$refs.suggestionPanel && e.target !== this.$refs.suggestionPanel && !this.$refs.suggestionPanel.contains(e.target)) {
                this.close();
            }
        },
        handleEscape(e) {
            if (!this.isOpen) {
                return;
            }
            if (e.code === 'Escape' || e.keyCode === 27) {
                e.preventDefault();
                this.close();
            }
        },
        close() {
            this.$emit('update:isOpen', false);
            this.value = '';
        },
        getSuggestionValue(suggestion) {
            if (!this.valueAttribute || typeof suggestion !== 'object') {
                return suggestion;
            }
            return _get(suggestion, this.valueAttribute);
        },
        getSuggestionDisplay(suggestion) {
            if (!this.displayAttribute || typeof suggestion !== 'object') {
                return '';
            }
            return _get(suggestion, this.displayAttribute);
        },
    },
};
</script>

<template>
    <div class="h-field__dropdown" ref="suggestionPanel" v-show="isOpen">
        <div class="h-field__dropdown-field">
            <InputUppercase
                v-if="inputUppercase"
                ref="input"
                class="h-field__dropdown-input" type="text"
                :placeholder="inputPlaceholder || $td('Search…', 'common.search')"
                v-bind="$attrs"
                v-model="value"
                @keyup.enter="handleSuggestionClick(value)"
            />
            <input
                v-else
                ref="input"
                class="h-field__dropdown-input" type="text"
                :placeholder="inputPlaceholder || $td('Search…', 'common.search')"
                v-bind="$attrs"
                v-model="value"
                @keyup.enter="handleSuggestionClick(value)"
                @blur="$emit('blur', $event)"
                @focus="$emit('focus', $event)"
            >
            <img class="h-field__dropdown-field-icon" src="/img/icon-search.svg" alt="" role="presentation">
        </div>

        <!-- @TODO keyboard support -->
        <div class="h-field__suggestion-list">
            <button
                class="h-field__suggestion-item u-semantic-button" type="button"
                v-for="suggestion in suggestionListFinal"
                :key="getSuggestionValue(suggestion)"
                @click="handleSuggestionClick(suggestion)"
            >
                <slot
                    name="suggestion-item"
                    :suggestion="suggestion"
                >
                    <span>{{ getSuggestionValue(suggestion) }}</span>
                </slot>
            </button>
        </div>
    </div>
</template>
