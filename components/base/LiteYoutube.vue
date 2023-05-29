<script>
import Vue from 'vue';
// import 'lite-youtube-embed';
// import {gaSend, ymGoal} from '~/assets/analytics-track.js';

Vue.config.ignoredElements = Vue.config.ignoredElements || [];
Vue.config.ignoredElements.push('lite-youtube');

export default {
    props: {
        videoId: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            isTracked: false,
        };
    },
    mounted() {
        import('lite-youtube-embed');
    },
    methods: {
        trackCLick() {
            /*
            if (this.isTracked) {
                return;
            }
            this.isTracked = true;
            gaSend('click', 'video');
            ymGoal('click', 'video');
            */
        },
    },
};
</script>

<template>
    <lite-youtube
        :videoid="videoId"
        params="rel=0"
        :style="`background-image: url(https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg);`"
        @click="trackCLick()"
    />
</template>

<style>
lite-youtube::before {background: none;}
</style>
