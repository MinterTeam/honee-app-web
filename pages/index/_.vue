<script>
import { waitUntil } from 'async-wait-until';
import getTitle from '~/assets/get-title.js';
import {DASHBOARD_URL} from '~/assets/variables.js';
import hashColor from '~/assets/hash-color.js';
import cardList from '~/assets/data-card-list.js';
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

const addLiquidityAction = {
    params: ['coin0', 'coin1'],
    component: TxPoolAddLiquidityForm,
};

const actionList = {
    buy: {
        params: ['coinToGet'],
        component: HubBuyForm,
        tags: [],
    },
    swap: {
        params: ['coinToBuy', 'coinToSell'],
        component: Swap,
        tags: ['exchange'],
    },
    send: {
        params: [],
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
        params: ['coin', 'duration'],
        component: StakeByLock,
    },
};

export default {
    DASHBOARD_URL,
    components: {
        Modal,
        CardHead,
    },
    fetchOnServer: false,
    async fetch() {
        this.action = null;
        this.faq = null;
        // remove ending slash
        if (!this.$route.params.pathMatch) {
            const path = this.$i18nGetPreferredPath({path: DASHBOARD_URL});
            if (path !== this.$route.path) {
                return this.$router.replace(path);
            }
            return;
        }
        const [actionType, ...actionQueryParams] = this.$route.params.pathMatch.split('/').filter((item) => !!item);
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
        action.params.forEach((paramKey, paramIndex) => {
            const value = actionQueryParams[paramIndex];
            if (!value) {
                return;
            }
            const isCoinParam = COIN_PARAMS.includes(paramKey);
            if (isCoinParam && value.toUpperCase() !== value) {
                shouldRedirect = true;
                actionQueryParams[paramIndex] = value.toUpperCase();
            }
            if (value !== OMIT_PARAM_SYMBOL) {
                pathParams[paramKey] = value;
            }
        });
        if (shouldRedirect) {
            let newPathMatch = [actionType, ...actionQueryParams].join('/');
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
        const flatCardList = [].concat(...Object.values(cardList).map((category) => category.cards));
        const card = flatCardList.find((card) => card.action.replace(/^\//, '').toLowerCase() === this.$route.params.pathMatch.toLowerCase());
        this.card = Object.freeze(card);

        if (card) {
            title = [card.caption, card.title].join(' ');
        }

        // action
        this.action = Object.freeze({
            ...action,
            title,
            params,
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
    head() {
        if (!this.action) {
            return {};
        }

        const title = getTitle(this.action.title);
        return {
            title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
            ],
        };
    },
    data() {
        // https://github.com/nuxt/nuxt.js/issues/2444
        return {
            action: this.action || null,
            card: this.card || null,
            faq: this.faq || null,
            isRedirecting: false,
            overriddenStatsValue: '',
        };
    },
    computed: {
        color() {
            return hashColor(this.card?.action || this.$route.params.pathMatch);
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
    },
};
</script>

<template>
    <Modal
        v-if="$route.params.pathMatch"
        :isOpen="true"
        :hideCloseButton="false"
        :disableOutsideClick="true"
        modalContainerClass="card card--invert"
        :modalContainerStyle="`background-color: ${color};`"
        @modal-close="$router.push($i18nGetPreferredPath({path: $options.DASHBOARD_URL}))"
    >
        <template v-if="action">
            <CardHead
                class="card__content"
                :card="card"
                :fallback-title="action.title"
                :override-value="overriddenStatsValue"
            />
            <component
                class="card card--light-grey card__content card__content--pop"
                :is="action.component"
                :action="action"
                :params="action.params"
                @override-stats-value="overriddenStatsValue = $event"
            />

            <nuxt-content class="card__content" :document="faq" v-if="faq"/>
        </template>
        <div v-else-if="$fetchState.pending || isRedirecting">{{ $td('Loading…', 'index.loading') }}</div>
        <div v-else>{{ $t('action.title-not-found') }}</div>



    </Modal>
</template>
