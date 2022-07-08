<script>
export default {
    emits: [
        'update:isOpen',
        'modal-close',
    ],
    props: {
        isOpen: {
            type: Boolean,
            default: false,
        },
        hideCloseButton: {
            type: Boolean,
            default: false,
        },
        disableOutsideClick: {
            type: Boolean,
            default: false,
        },
        modalClass: {
            type: String,
            default: '',
        },
        modalContainerClass: {
            type: String,
            default: 'card card__content card--light-grey',
        },
        modalContainerStyle: {
            type: String,
        },
        keepMarkup: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            elFocusedBeforeOpen: null,
        };
    },
    watch: {
        isOpen(newVal) {
            if (newVal) {
                // on open
                this.elFocusedBeforeOpen = document.activeElement;
                setTimeout(() => {
                    if (typeof this.$el.querySelector !== 'function') {
                        return;
                    }
                    const focusEl = this.$el.querySelector('[data-focus-on-open]');
                    if (focusEl) {
                        focusEl.focus();
                    }
                }, 0);
            } else {
                // on close
                this.$emit('modal-close');
                setTimeout(() => {
                    if (this.elFocusedBeforeOpen) {
                        setTimeout(() => {
                            this.elFocusedBeforeOpen.focus();
                            this.elFocusedBeforeOpen = null;
                        }, 0);
                    }
                }, 0);
            }
        },
    },
    methods: {
        closeModal() {
            this.$emit('update:isOpen', false);
        },
        handleModalClick(e) {
            const elCloseButton = this.$refs.modalCloseButton;
            // check button click
            if (elCloseButton && (e.target === elCloseButton || elCloseButton.contains(e.target))) {
                this.closeModal();
            }
            if (this.disableOutsideClick) {
                return;
            }
            // outside click
            if (this.$refs.modalContainer && e.target !== this.$refs.modalContainer && !this.$refs.modalContainer.contains(e.target)) {
                this.closeModal();
            }
        },
        handleModalKeydown(e) {
            if (this.disableOutsideClick) {
                return;
            }
            if (e.code === 'Escape' || e.keyCode === 27) {
                e.preventDefault();
                this.closeModal();
            }
        },
    },
};
</script>

<template>
    <transition name="v-transition-modal">
        <div class="modal-wrap" v-if="isOpen || keepMarkup">
            <transition name="v-transition-modal">
                <div
                    class="modal u-container u-container--wide" tabindex="-1" role="dialog"
                    v-show="isOpen"
                    :class="modalClass"
                    @click="handleModalClick($event)"
                    @keydown="handleModalKeydown($event)"
                >
                    <button class="modal__close u-semantic-button link--opacity" type="button" v-if="!hideCloseButton" ref="modalCloseButton">
                        <span class="modal__close-icon">{{ $td('Close', 'common.close') }}</span>
                    </button>
                    <div class="modal__wrap">
                        <div class="modal__container" ref="modalContainer" :class="modalContainerClass" :style="modalContainerStyle">
                            <slot></slot>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </transition>
</template>

