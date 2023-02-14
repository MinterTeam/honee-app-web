<script>
import {getLootbox} from '~/api/metagarden.js';
import BaseLoader from '~/components/base/BaseLoader.vue';

const LOOTBOX_STATE = {
    INACTIVE: 'inactive',
    READY: 'ready',
    OPENED: 'opened',
};

export default {
    LOOTBOX_STATE,
    components: {
        BaseLoader,
    },
    head: {
        htmlAttrs: {
            style: 'background-color: #D2EEDD;',
        },
    },
    fetch() {
        return getLootbox(this.$store.getters.privateKey)
            .then((lootbox) => {
                this.lootbox = lootbox;
            });
    },
    data() {
        return {
            isOpening: false,
            isOpened: false,
            lootbox: null,
        };
    },
    computed: {
        status() {
            if (!this.lootbox) {
                return LOOTBOX_STATE.INACTIVE;
            }
            if (this.lootbox && !this.isOpened) {
                return LOOTBOX_STATE.READY;
            }
            if (this.lootbox && this.isOpened) {
                return LOOTBOX_STATE.OPENED;
            }
            return undefined;
        },
    },
    methods: {
        openLootbox() {
            if (this.isOpening) {
                return;
            }
            this.isOpening = true;

            this.isOpened = true;
            this.isOpening = false;
        },
    },
};
</script>

<template>
    <div class="u-text-center u-container--mini">
        <template v-if="$fetchState.loading">Loading…</template>
        <template v-else>
            <div class="mg-lootbox__chest-wrap">
                <img class="mg-lootbox__chest-star" src="/img/metagarden-lootbox-star.svg" alt="">
                <img class="u-image" :src="`/img/metagarden-lootbox-${status}.svg`" alt="" role="presentation" width="128" height="128">
            </div>

            <template v-if="status === $options.LOOTBOX_STATE.INACTIVE">
                <h1 class="u-h3 u-mb-05">{{ $td('Lootbox is not ready yet', 'mg-lootbox.title-inactive') }}</h1>
                <p>Become <a class="link--main link--underline" href="#">Top-100 METAGARDEN holder</a> to&nbsp;win guaranteed prizes!</p>
            </template>
            <template v-if="status === $options.LOOTBOX_STATE.READY">
                <h1 class="u-h3 u-mb-05">{{ $td('You’ve won a lootbox!', 'mg-lootbox.title-ready') }}</h1>
                <p>{{ $td('Open it before January 31, 12:00pm to&nbsp;receive your prize!', 'mg-lootbox.description-ready') }}</p>
                <button
                    type="button" class="button button--gradient-green button--full u-mt-10"
                    :class="{'is-loading': isOpening, 'is-disabled': false}"
                    @click="openLootbox()"
                >
                    <span class="button__content">{{ $td('Open lootbox', 'mg-lootbox.description-ready') }}</span>
                    <BaseLoader class="button__loader" :isLoading="true"/>
                </button>
            </template>
            <template v-if="status === $options.LOOTBOX_STATE.OPENED">
                <h1 class="u-h3 u-mb-05">{{ $td('You’ve received 100 BEE!', 'mg-lootbox.title-opened') }}</h1>
                <p>{{ $td('Come back on January 31, 12:00pm to&nbsp;receive a new lootbox!', 'mg-lootbox.description-opened') }}</p>
            </template>
        </template>
    </div>
</template>

<style lang="less">
.mg-lootbox__chest-wrap {position: relative;}
.mg-lootbox__chest-star {position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: -1;}
</style>
