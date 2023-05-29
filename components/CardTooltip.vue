<script>
import {defineComponent} from 'vue';
import get from 'lodash-es/get.js';
import InlineSvg from 'vue-inline-svg';
import BaseTooltip from '~/components/base/BaseTooltip.vue';
// import LiteYoutube from '~/components/base/LiteYoutube.vue';
import Modal from '~/components/base/Modal.vue';


export default defineComponent({
    components: {
        InlineSvg,
        BaseTooltip,
        // LiteYoutube,
        Modal,
    },
    props: {
        card: {
            /** @type {PropType<CardListItem>} */
            type: Object,
        },
    },
    data() {
        return {
            isVideoModalVisible: false,
        };
    },
    computed: {

    },
    methods: {
        translate(key) {
            // fallback to en locale
            return get(this.card?.[this.$i18n.locale], key) || get(this.card, key);
        },
    },
});
</script>

<template>
    <div v-if="card?.tooltip || card?.video">
        <BaseTooltip
            v-if="card?.tooltip"
            :content="translate('tooltip')"
        />
        <button
            v-else-if="card?.video"
            type="button"
            class="u-semantic-button"
            aria-label="Video instruction"
            @click="isVideoModalVisible = true"
        >
            <InlineSvg class="u-image u-text-main" src="/img/icon-video.svg" alt="" fill="currentColor"/>
        </button>

        <Modal
            v-if="card?.video"
            class="u-text-center"
            modal-container-class="video-modal"
            :isOpen.sync="isVideoModalVisible"
        >
            <div class="u-aspect-ratio" style="--aspect-ratio: 16 / 9">
                <iframe class="video-youtube" :src="`https://www.youtube.com/embed/${translate('video')}?rel=0&autoplay=1&hl=${$i18n.locale}`" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
            </div>
        </Modal>
    </div>
</template>

<style>
.video-modal {max-width: 640px;}
.video-youtube {width: 100%;}
</style>
