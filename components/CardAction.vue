<script>
import { waitUntil } from 'async-wait-until';
import getTitle from '~/assets/get-title.js';
import hashColor from '~/assets/hash-color.js';
import {flatCardList} from '~/content/card-list.js';
import {translateCardField} from '~/components/Card.vue';
import HubBuyForm from '~/components/HubBuyForm.vue';
import Swap from '~/components/Swap.vue';
import TxSendForm from '~/components/TxSendForm.vue';
import TxPoolAddLiquidityForm from '~/components/TxPoolAddLiquidityForm.vue';
import TxPoolRemoveLiquidityForm from '~/components/TxPoolRemoveLiquidityForm.vue';
import TxStakeDelegateForm from '~/components/TxStakeDelegateForm.vue';
import TxStakeUnbondForm from '~/components/TxStakeUnbondForm.vue';
import StakeByLock from '~/components/StakeByLock.vue';
import Modal from '~/components/base/Modal.vue';
import CardHead from '~/components/CardHead.vue';

// treat such param value as not defined
const OMIT_PARAM_SYMBOL = '-';
// uppercase such param values
const COIN_PARAMS = ['coin', 'coin0', 'coin1', 'coinToSell', 'coinToBuy'];
// @TODO uppercase coins in query

const addLiquidityAction = {
    params: ['coin0', 'coin1'],
    component: TxPoolAddLiquidityForm,
};

/**
 * @typedef {ActionItemRaw&{title: string}} ActionItem
 *
 * @typedef {object} ActionItemRaw
 * @property {Vue} component
 * @property {Array<string>} [params]
 * @property {Array<string>} [tags]
 *
 * @type {Object.<string, ActionItemRaw>}
 */
const actionList = {
    buy: {
        params: ['coinToGet'],
        component: HubBuyForm,
        tags: [],
    },
    swap: {
        //@TODO is coinToSell param really needed
        params: ['coinToBuy', 'coinToSell'],
        component: Swap,
        tags: ['exchange'],
    },
    send: {
        params: ['address', 'coin', 'amount'],
        component: TxSendForm,
    },
    'add-liquidity': addLiquidityAction,
    win: {
        ...addLiquidityAction,
        tags: ['lottery'],
    },
    farm: {
        ...addLiquidityAction,
        tags: ['farming'],
    },
    'remove-liquidity': {
        params: ['coin0', 'coin1'],
        component: TxPoolRemoveLiquidityForm,
    },
    delegate: {
        params: ['coin', 'publicKey'],
        component: TxStakeDelegateForm,
        tags: ['staking'],
    },
    unbond: {
        params: ['coin', 'publicKey'],
        component: TxStakeUnbondForm,
    },
    stake: {
        params: ['id'],
        component: StakeByLock,
    },
};

export default {
    components: {
        Modal,
        CardHead,
    },
    props: {
        baseUrl: {
            type: String,
            default: '/',
        },
    },
    emits: [
        'success',
        'success-modal-close',
        'update:action',
    ],
    fetchOnServer: false,
    async fetch() {
        this.action = null;
        this.faq = null;
        // remove ending slash
        if (!this.$route.params.pathMatch) {
            const path = this.baseUrl;
            if (path !== this.$route.path) {
                return this.$router.replace(path);
            }
            return;
        }
        const [actionType, ...actionPathParts] = this.$route.params.pathMatch.split('/').filter((item) => !!item);
        const action = actionList[actionType];
        if (!action) {
            this.$nuxt.error({
                status: 404,
                message: this.$t('action.title-not-found'),
            });
        }

        // action params
        let pathParams = {};
        let shouldRedirect = false;
        //@TODO split into two different cycles (redirecting actionPathParts and collecting pathParams)
        action.params.forEach((paramKey, paramIndex) => {
            const value = actionPathParts[paramIndex];
            if (!value) {
                return;
            }
            const isCoinParam = COIN_PARAMS.includes(paramKey);
            if (isCoinParam && value.toUpperCase() !== value) {
                shouldRedirect = true;
                actionPathParts[paramIndex] = value.toUpperCase();
            }
            if (value !== OMIT_PARAM_SYMBOL) {
                pathParams[paramKey] = value;
            }
        });
        if (shouldRedirect) {
            let newPathMatch = [actionType, ...actionPathParts].join('/');
            this.$router.replace({
                ...this.$route,
                params: {pathMatch: newPathMatch},
            });
            this.isRedirecting = true;
            return;
        }
        const params = {
            ...this.$route.query,
            ...pathParams,
        };

        // action title
        let title = this.$t(`action.title-${actionType}`);
        if (actionType === 'delegate' && params.coin) {
            title += ' ' + params.coin;
        }
        if (actionType === 'swap') {
            title = this.$t('action.title-swap-combined', {
                coin0: params.coinToSell ? params.coinToSell.toUpperCase() : this.$t('action.title-swap-coin0-empty'),
                conjunction: params.coinToBuy ? this.$t('action.title-swap-conjunction') : undefined,
                coin1: params.coinToBuy ? params.coinToBuy.toUpperCase() : undefined,
            });
        }

        // card
        const pathMatch = this.$route.params.pathMatch.replace(/\/$/, '').toLowerCase();
        const card = flatCardList.find((card) => card.action.replace(/^\//, '').toLowerCase() === pathMatch);
        this.card = Object.freeze(card);

        if (card) {
            const cardCaption = translateCardField(card, 'caption', this.$i18n.locale);
            const cardTitle = translateCardField(card, 'title', this.$i18n.locale);
            title = [cardCaption, cardTitle].join(' ');
        }

        // action
        this.action = Object.freeze({
            ...action,
            title,
            params: pathParams,
        });

        // tags
        let actionTags = (card?.tags || []).map((tag) => tag.toLowerCase());
        //@TODO check each action.tags
        if (action.tags?.[0] && !actionTags.includes(action.tags[0])) {
            actionTags.push(action.tags[0]);
        }
        if (!actionTags.length) {
            return;
        }

        // faq
        /*const localePrefix = this.$i18n.locale === this.$i18n.defaultLocale ? '' : this.$i18n.locale + '/';
        let faqItems = await this.$content(localePrefix + 'faq').where({ 'slug': { $in: actionTags } }).fetch();
        if (!faqItems) {
            return;
        }
        if (!Array.isArray(faqItems)) {
            faqItems = [faqItems];
        }
        let faq = faqItems[0];
        let children = [];
        faqItems.forEach((faqPage) => {
            children = children.concat(faqPage.body.children.map((child) => {
                if (child.type === 'element') {
                    return {
                        ...child,
                        // remove id from props
                        props: {},
                    };
                }

                return child;
            }));
        });
        faq.body.children = children;
        this.faq = Object.freeze(faq);*/
    },
    data() {
        // https://github.com/nuxt/nuxt.js/issues/2444
        return {
            /** @type {ActionItem|null} */
            action: this.action || null,
            /** @type {CardListItem|null} */
            card: this.card || null,
            faq: this.faq || null,
            isRedirecting: false,
            overriddenStatsValue: '',
        };
    },
    computed: {
        color() {
            const actionUrl = this.card?.action || this.$route.params.pathMatch.replace(/\/$/, '');
            return hashColor(clearActionQuery(actionUrl));
        },
    },
    watch: {
        '$route.params.pathMatch': {
            handler() {
                waitUntil(() => !this.$fetchState.pending)
                    .then(() => {
                        this.$fetch();
                    });
            },
        },
        action: {
            handler(newVal) {
                this.$emit('update:action', newVal);
            },
        },
    },
};

export function clearActionQuery(url) {
    return url.replace(/\?.*/, '');
}
</script>

<template>
    <div class="card card--invert" :style="`background-color: ${color};`">
        <template v-if="action">
            <CardHead
                class="card__content"
                :card="card"
                :fallback-title="action.title"
                :override-value="overriddenStatsValue"
            />
            <component
                class="card card--pop card--light-grey card__content"
                :is="action.component"
                :action="action"
                :params="action.params"
                @override-stats-value="overriddenStatsValue = $event"
                @success="$emit('success')"
                @success-modal-close="$emit('success-modal-close')"
            />

            <nuxt-content class="card__content u-text-medium" :document="faq" v-if="faq"/>
        </template>
        <div v-else-if="$fetchState.pending || isRedirecting">{{ $td('Loading…', 'index.loading') }}</div>
        <div v-else>{{ $t('action.title-not-found') }}</div>
    </div>
</template>
