<script>
import autosize from 'v-autosize';
import {pretty} from '~/assets/utils.js';

export default {
    components: {
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
        min: {
            type: [Number, String],
            default: 0,
        },
        max: {
            type: [Number, String],
            default: 100,
        },
        step: {
            type: [Number, String],
            default: 0.01,
        },
        unit: {
            type: String,
        },
        label: {
            type: String,
            default: 'Range',
        },
    },
    data() {
        return {
        };
    },
    methods: {
        pretty,
    },
};
</script>

<template>
    <div class="h-field">
        <div class="h-field__content">
            <div class="h-field__title">{{ label }}</div>
            <input
                class="h-field__range form-range" type="range"
                :style="`--val: ${value}; --min: ${min}; --max: ${max};`"
                :min="min"
                :max="max"
                :step="step"
                :value="value"
                @input="$emit('input', $event.target.value)"
            >
        </div>
        <div class="h-field__aside" :class="{'is-error': $value.$error}">
            <div class="h-field__input h-field__aside-input h-field__aside-range" >
                {{ pretty(value || 0) }}{{ unit }}
            </div>
        </div>
    </div>
</template>
