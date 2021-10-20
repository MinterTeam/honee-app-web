<script>
import { waitUntil } from 'async-wait-until';
import getTitle from '~/assets/get-title.js';
import {DASHBOARD_URL} from '~/assets/variables.js';
import cardList from '~/assets/data-card-list.js';
import HubBuyForm from '~/components/HubBuyForm.vue';
import Swap from '~/components/Swap.vue';
import TxSendForm from '~/components/TxSendForm.vue';
import TxPoolAddLiquidityForm from '~/components/TxPoolAddLiquidityForm.vue';
import TxPoolRemoveLiquidityForm from '~/components/TxPoolRemoveLiquidityForm.vue';
import TxStakeDelegateForm from '~/components/TxStakeDelegateForm.vue';
import TxStakeUnbondForm from '~/components/TxStakeUnbondForm.vue';
import Modal from '~/components/base/Modal.vue';

// treat such param value as not defined
const OMIT_PARAM_SYMBOL = '-';
// uppercase such param values
const COIN_PARAMS = ['coin', 'coin0', 'coin1', 'coinToSell', 'coinToBuy'];

const addLiquidityAction = {
    title: 'Provide liquidity to pool',
    params: ['coin0', 'coin1'],
    component: TxPoolAddLiquidityForm,
};

const actionList = {
    buy: {
        title: 'Buy BIP, HUB, & BEE for ETH',
        params: [],
        component: HubBuyForm,
        tags: [],
    },
    swap: {
        title: 'Swap coins',
        params: ['coinToBuy', 'coinToSell'],
        component: Swap,
        tags: ['exchange'],
    },
    send: {
        title: 'Send coins',
        params: [],
        component: TxSendForm,
    },
    'add-liquidity': addLiquidityAction,
    win: {
        ...addLiquidityAction,
        title: 'Win',
        tags: ['lottery'],
    },
    farm: {
        ...addLiquidityAction,
        title: 'Farm',
        tags: ['farming'],
    },
    'remove-liquidity': {
        title: 'Remove liquidity from pool',
        params: ['coin0', 'coin1'],
        component: TxPoolRemoveLiquidityForm,
    },
    delegate: {
        title: 'Delegate',
        params: ['coin', 'publicKey'],
        component: TxStakeDelegateForm,
        tags: ['staking'],
    },
    unbond: {
        title: 'Unbond',
        params: ['coin', 'publicKey'],
        component: TxStakeUnbondForm,
    },
};

export default {
    DASHBOARD_URL,
    components: {
        Modal,
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
                message: this.$td('Action not found', 'action.title-not-found'),
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
        let title = action.title;
        if (actionType === 'delegate' && params.coin) {
            title += ' ' + params.coin;
        }

        // action
        this.action = Object.freeze({
            ...action,
            title,
            params,
            langKey: `action.title-${actionType}`,
        });

        const flatCardList = [].concat(...Object.values(cardList));
        const currentActionCard = flatCardList.find((card) => card.action.replace(/^\//, '').toLowerCase() === this.$route.params.pathMatch.toLowerCase());
        let actionTags = (currentActionCard?.tags || []).map((tag) => tag.toLowerCase());
        //@TODO check each action.tags
        if (action.tags?.[0] && !actionTags.includes(action.tags[0])) {
            actionTags.push(action.tags[0]);
        }
        if (!actionTags.length) {
            return;
        }

        // faq
        let faqItems = await this.$content('faq').where({ 'slug': { $in: actionTags } }).fetch();
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
        this.faq = Object.freeze(faq);
    },
    head() {
        if (!this.action) {
            return {};
        }

        const title = getTitle(this.$td(this.action.title, this.action.langKey));
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
            faq: this.faq || null,
            isRedirecting: false,
        };
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
        modalContainerClass="card card--light-grey"
        @modal-close="$router.push($i18nGetPreferredPath({path: $options.DASHBOARD_URL}))"
    >
        <div v-if="action">
            <component
                class="card__content"
                :is="action.component"
                :action="action"
                :params="action.params"
            />

            <nuxt-content class="card__content" :document="faq" v-if="faq"/>
        </div>
        <div v-else-if="$fetchState.pending || isRedirecting">{{ $td('Loading…', 'index.loading') }}</div>
        <div v-else>{{ $td('Action not found', 'action.title-not-found') }}</div>



    </Modal>
</template>
