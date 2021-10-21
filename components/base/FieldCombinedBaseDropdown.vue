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
        inputUppercase: {
            type: Boolean,
            default: true,
        },
        inputPlaceholder: {
            type: String,
            default: 'this.$td('Search…', 'common.search')',
        },
    },
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
    },
    watch: {
        isOpen(newVal) {
            if (newVal) {
                setTimeout(() => {
                    this.$refs.input.$el.focus();
                }, 50);
                // prevent immediate close after opening
                this.disableOutsideClick = true;
                setTimeout(() => {
                    this.disableOutsideClick = false;
                }, 500);
            }
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
            // keep only values started with query (e.g. remove "WALLET" for "LET" query)
            return this.getSuggestionValue(item).toLowerCase().indexOf(query.toLowerCase()) === 0;
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
                :placeholder="inputPlaceholder"
                v-bind="$attrs"
                v-model="value"
                @keyup.enter="handleSuggestionClick(value)"
            />
            <input
                v-else
                ref="input"
                class="h-field__dropdown-input" type="text"
                :placeholder="inputPlaceholder"
                v-bind="$attrs"
                v-model="value"
                @keyup.enter="handleSuggestionClick(value)"
                @blur="$emit('blur', $event)"
                @focus="$emit('focus', $event)"
            >
            <img class="h-field__dropdown-field-icon" src="/img/icon-search.svg" alt="" role="presentation">
        </div>

        <!-- @TODO keyboard support -->
        <button
            class="h-field__suggestion-item u-semantic-button" type="button"
            v-for="suggestion in suggestionListFinal"
            :key="getSuggestionValue(suggestion)"
            @click="handleSuggestionClick(suggestion)"
        >
            <slot name="suggestion-item"
                  :suggestion="suggestion"
            >
                <span>{{ getSuggestionValue(suggestion) }}</span>
            </slot>
        </button>
    </div>
</template>
