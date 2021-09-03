import Vue from 'vue';
// import {BASE_URL_PREFIX} from '~/assets/variables.js';
const BASE_URL_PREFIX = '';

Vue.mixin({
    computed: {
        BASE_URL_PREFIX: () => BASE_URL_PREFIX,
    },
});
