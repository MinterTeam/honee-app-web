<script>
import {getCurrentInstance} from 'vue';
import useStakeByLockList from '~/composables/use-stake-by-lock-list.js';
import Card from '~/components/Card.vue';

export default {
    components: {
        Card,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy;
        const {
            lockListPromise,
            premiumCard,
            prepareStakeCardList,
        } = useStakeByLockList({
            initFetchAddress: vm.$store.getters.address,
        });

        return {
            lockListPromise,
            premiumCard,
            prepareStakeCardList,
        };
    },
    fetch() {
        return this.lockListPromise;
    },
    data() {
        return {
        };
    },
    computed: {
    },

    methods: {
    },
};
</script>

<template>
    <Card :card="premiumCard"/>
</template>
