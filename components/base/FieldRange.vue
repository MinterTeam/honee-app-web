<script>
import autosize from 'v-autosize';
import gcd from 'compute-gcd';
import {prettyNumber} from '~/assets/utils.js';

export default {
    components: {
    },
    directives: {
        autosize,
    },
    props: {
        value: {
            type: [Number, String],
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
        },
        max: {
            type: [Number, String],
        },
        step: {
            type: [Number, String],
        },
        list: {
            type: Array,
        },
        unit: {
            type: [String, Function],
        },
        label: {
            type: String,
            default: 'Range',
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
        resultMin() {
            return this.listMin || this.min || 0;
        },
        resultMax() {
            return this.listMax || this.max || 100;
        },
        resultStep() {
            return this.listStep || this.step;
        },
        listMin() {
            if (!this.list?.length) {
                return;
            }
            return Math.min(...this.list);
        },
        listMax() {
            if (!this.list?.length) {
                return;
            }
            return Math.max(...this.list);
        },
        listStep() {
            if (!this.list?.length) {
                return;
            }
            return this.step || gcd(this.list);
        },
        random() {
            return Math.random().toString().replace('0.', '');
        },
        listId() {
            if (!this.list?.length) {
                return;
            }
            return `field-range-list-${this.random}`;
        },
        precision() {
            // number of digits after dot
            return (this.listStep || this.step).split('.')[1]?.length;
        },
        valueCaption() {
            const prettyValue = this.pretty(this.value || 0);
            if (typeof this.unit === 'string') {
                return prettyValue + this.unit;
            }
            if (typeof this.unit === 'function') {
                return this.unit(this.value);
            }
            return prettyValue;
        },
    },
    methods: {
        pretty(value) {
            return prettyNumber(value, this.precision);
        },
    },
};
</script>

<template>
    <div class="h-field">
        <div class="h-field__content">
            <div class="h-field__title">{{ label }}</div>
            <div class="h-field__range form-range-wrap" :style="`--val: ${value}; --min: ${resultMin}; --max: ${resultMax}; --step: ${resultStep}`">
                <input
                    class="form-range" type="range"
                    :min="resultMin"
                    :max="resultMax"
                    :step="resultStep"
                    :list="listId"
                    :value="value"
                    @input="$emit('input', $event.target.value)"
                >
                <datalist :id="listId" v-if="listId">
                    <option v-for="listValue in list" :key="listValue" :value="listValue"/>
                </datalist>
            </div>
        </div>
        <div class="h-field__aside" :class="{'is-error': $value.$error}">
            <div class="h-field__input h-field__aside-input h-field__aside-range" >
                {{ valueCaption }}
            </div>
        </div>
    </div>
</template>
