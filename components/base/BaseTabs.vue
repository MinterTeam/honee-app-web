<script>
export default {
    props: {
        value: {
            type: [String, Number],
        },
        /** @type {Array<{value: number|string, label: string}>} */
        tabs: {
            type: Array,
            required: true,
        },
    },
    emits: [
        'input',
    ],
};
</script>

<template>
    <div class="tabs u-flex">
        <button
            v-for="tabItem in tabs"
            :key="tabItem.value"
            class="tabs__item u-h u-h3 u-semantic-button" type="button"
            :class="{'is-active': value === tabItem.value}"
            @click="$emit('input', tabItem.value)"
        >
            {{ tabItem.label || tabItem.value }}
        </button>
    </div>
</template>
