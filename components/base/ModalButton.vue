<script>
import Modal from '~/components/base/Modal.vue';

export default {
    components: {
        Modal,
    },
    props: {
        label: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            isOpen: false,
        };
    },
};
</script>

<template>
    <div>
        <button class="u-semantic-button link link--default" type="button" @click="isOpen = true">
            {{ label || $td('Learn more', 'common.learn-more') }}
        </button>

        <Modal :is-open.sync="isOpen">
            <slot/>
        </Modal>
    </div>
</template>
