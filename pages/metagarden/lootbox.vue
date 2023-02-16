<script>
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {decodeCheck} from 'minter-js-sdk/src/check.js';
import {getLootbox, openLootbox} from '~/api/metagarden.js';
import {getErrorText} from '~/assets/server-error.js';
import useTxService from '~/composables/use-tx-service.js';
import BaseLoader from '~/components/base/BaseLoader.vue';

const LOOTBOX_STATE = {
    INACTIVE: 'inactive',
    READY: 'ready',
    OPENED: 'opened',
};

export default {
    LOOTBOX_STATE,
    layout: 'metagarden',
    components: {
        BaseLoader,
    },
    setup() {
        const {sendMinterTx} = useTxService();

        return {
            sendMinterTx,
        };
    },
    head: {
        htmlAttrs: {
            class: 'metagarden-layout',
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
            /** @type {MetagardenLootbox|null}*/
            lootbox: null,
            isLootboxRedeemFailed: false,
            checkData: null,
            serverError: '',
            serverSuccess: '',
        };
    },
    computed: {
        status() {
            if (!this.lootbox) {
                return LOOTBOX_STATE.INACTIVE;
            }
            if (this.isOpening || (this.lootbox && !this.lootbox.isActivated)) {
                return LOOTBOX_STATE.READY;
            }
            if (this.lootbox && this.lootbox.isActivated) {
                return LOOTBOX_STATE.OPENED;
            }
            return undefined;
        },
    },
    methods: {
        async openLootbox() {
            if (this.isOpening) {
                return;
            }
            this.isOpening = true;
            try {
                this.lootbox = await openLootbox(this.$store.getters.privateKey, this.lootbox.id);
            } catch (error) {
                console.error(error);
                this.serverError = getErrorText(error);
                this.isOpening = false;
                return;
            }

            if (this.lootbox.items.length !== 1 || this.lootbox.items[0].type !== 'check') {
                this.serverError = 'Unsupported lootbox type';
                this.isOpening = false;
                return;
            }

            const reward = this.lootbox.items[0];
            try {
                const {hash} = await this.sendMinterTx({
                    type: TX_TYPE.REDEEM_CHECK,
                    data: {
                        check: reward.data.check,
                    },
                }, {
                    privateKey: this.$store.getters.privateKey,
                    password: reward.data.password,
                });
                this.checkData = decodeCheck(reward.data.check);
                this.serverSuccess = hash;
            } catch (error) {
                this.isLootboxRedeemFailed = true;
                this.serverError = getErrorText(error);
            }
            this.isOpening = false;
        },
    },
};
</script>

<template>
    <div class="u-container--small">
        <div class="card mg-lootbox__card">
            <div class="card__content u-text-center">
                <template v-if="$fetchState.pending">Loading…</template>
                <template v-else>
                    <div class="mg-lootbox__chest-wrap" v-if="!isLootboxRedeemFailed">
                        <img class="mg-lootbox__chest-star" src="/img/metagarden-lootbox-star.svg" alt="">
                        <img class="u-image" :src="`/img/metagarden-lootbox-${status}.svg`" alt="" role="presentation" width="128" height="128">
                    </div>

                    <template v-if="status === $options.LOOTBOX_STATE.INACTIVE">
                        <h1 class="u-h3 u-mb-05">{{ $td('Lootbox is not ready yet', 'mg-lootbox.title-inactive') }}</h1>
                        <!--<p v-if="$i18n.locale === 'en'">Become <a class="link--default link--underline" href="https://metagarden-top.honee.app/" target="_blank">Top-100 METAGARDEN holder</a> to&nbsp;win guaranteed prizes!</p>
                        <p v-if="$i18n.locale === 'ru'">todo</p>-->
                    </template>
                    <template v-if="status === $options.LOOTBOX_STATE.READY">
                        <h1 class="u-h3 u-mb-05">{{ $td('You’ve won a lootbox!', 'mg-lootbox.title-ready') }}</h1>
                        <button
                            type="button" class="button button--gradient-green button--full u-mt-10"
                            :class="{'is-loading': isOpening, 'is-disabled': false}"
                            @click="openLootbox()"
                        >
                            <span class="button__content">{{ $td('Open lootbox', 'mg-lootbox.button-ready') }}</span>
                            <BaseLoader class="button__loader" :isLoading="true"/>
                        </button>
                    </template>
                    <template v-if="status === $options.LOOTBOX_STATE.OPENED && !isLootboxRedeemFailed">
                        <h1 class="u-h3 u-mb-05">
                            {{ $td('You’ve received', 'mg-lootbox.title-opened') }}
                            {{ checkData.value }} {{ $store.getters['explorer/getCoinSymbol'](checkData.coin) }}
                        </h1>
                    </template>
                    <template v-if="status === $options.LOOTBOX_STATE.OPENED && isLootboxRedeemFailed">
                        <h1 class="u-h3 u-mb-05">{{ $td('Error!', 'mg-lootbox.error-opened') }}</h1>
                        <p>{{ $td('Lootbox opening was unsuccessful, please contact support to get reward', 'mg-lootbox.description-redeem-failed') }}</p>
                    </template>

                    <div class="form__error u-mt-10" v-if="serverError">{{ serverError }}</div>
                    <div class="u-mt-10" v-if="serverError && lootbox?.items.length">
                        <p>Rewards</p>
                        <p>{{ lootbox.items }}</p>
                    </div>
                </template>
            </div>
            <div class="card__content card__content--medium u-text-medium">
                <h3 class="u-h5 u-mb-05">{{ $td('What is a lootbox?', 'mg-lootbox.terms-title') }}</h3>
                <p>{{ $td('A Lootbox is a prize box with a random prize. Coins, in-game items, NFTs or other items.', 'mg-lootbox.terms-description') }}</p>
                <nuxt-link
                    v-if="status === $options.LOOTBOX_STATE.INACTIVE && !$fetchState.pending"
                    class="button button--gradient-green button--full u-mt-10"
                    :to="$i18nGetPreferredPath('/swap/METAGARDEN')"
                >
                    {{ $td('Buy', 'common.buy') }} METAGARDEN
                </nuxt-link>
                <nuxt-link
                    class="button button--ghost button--full u-mt-10"
                    :to="$i18nGetPreferredPath('/metagarden/account')"
                >
                    {{ $td('Close', 'common.close') }}
                </nuxt-link>
            </div>
        </div>
    </div>
</template>

<style lang="less">
@import '~/assets/less/include/variables.less';
.mg-lootbox__card {background: #d2eedd; color: @c-black; position: relative; z-index: 0; overflow: clip;}
.mg-lootbox__chest-wrap {position: relative;}
.mg-lootbox__chest-star {position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: -1;}
</style>
