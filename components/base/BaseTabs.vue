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
        resetPages: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        'input',
    ],
    methods: {
        handleClick(newValue) {
            this.$emit('input', newValue);
            if (this.resetPages && this.$route.query.page > 1) {
                const {page, ...queryWithoutPage} = this.$route.query;
                this.$router.replace({
                    path: this.$route.path,
                    query: queryWithoutPage,
                });
            }
        },
    },
};
</script>

<template>
    <div class="tabs u-flex">
        <button
            v-for="tabItem in tabs"
            :key="tabItem.value"
            class="tabs__item u-h u-h3 u-semantic-button" type="button"
            :class="{'is-active': value === tabItem.value}"
            @click="handleClick(tabItem.value)"
        >
            {{ tabItem.label || tabItem.value }}
        </button>
    </div>
</template>
