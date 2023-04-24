<script>
export default {
    props: {
        isLoading: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<template>
    <svg class="loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" v-if="isLoading">
        <circle class="loader__path" cx="25" cy="25" r="16"/>
    </svg>
</template>

<style>
    /* @TODO intensive js calculations interrupts css transition */
    /*.loader {
        opacity: 0; transition: 0.05s;
        .is-loading > & { opacity: 1; transition: 0.1s 0.1s;}
    }*/
</style>
