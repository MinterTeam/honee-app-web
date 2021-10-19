<script>
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

const addLiquidityAction = {
    title: this.$td('Provide liquidity to pool', 'index.provide-liquidity-to-pool'),
    params: ['coin0', 'coin1'],
    component: TxPoolAddLiquidityForm,
};

const actionList = {
    buy: {
        title: this.$td('Buy BIP, HUB, & BEE for ETH', 'index.buy-bip-hub-bee-for-eth'),
        params: [],
        component: HubBuyForm,
        tags: [],
    },
    swap: {
        title: this.$td('Swap coins', 'index.swap-coins'),
        params: ['coinToBuy', 'coinToSell'],
        component: Swap,
        tags: ['exchange'],
    },
    send: {
        title: this.$td('Send coins', 'index.send-coins'),
        params: [],
        component: TxSendForm,
    },
    'add-liquidity': addLiquidityAction,
    win: {
        ...addLiquidityAction,
        title: this.$td('Win', 'index.win'),
        tags: ['lottery'],
    },
    farm: {
        ...addLiquidityAction,
        title: this.$td('Farm', 'index.farm'),
        tags: ['farming'],
    },
    'remove-liquidity': {
        title: this.$td('Remove liquidity from pool', 'index.remove-liquidity-from-pool'),
        params: ['coin0', 'coin1'],
        component: TxPoolRemoveLiquidityForm,
    },
    delegate: {
        title: this.$td('Delegate', 'index.delegate'),
        params: ['coin', 'publicKey'],
        component: TxStakeDelegateForm,
        tags: ['staking'],
    },
    unbond: {
        title: this.$td('Unbond', 'index.unbond'),
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
        const [actionType, ...actionParams] = this.$route.params.pathMatch.split('/').filter((item) => !!item);
        const action = actionList[actionType];
        if (!action) {
            this.$nuxt.error({
                status: 404,
                message: this.$td('Action not found', 'index.action-not-found'),
            });
        }

        // action params
        let pathParams = {};
        action.params.forEach((paramKey, paramIndex) => {
            if (actionParams[paramIndex]) {
                pathParams[paramKey] = actionParams[paramIndex];
            }
        });
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
        return {
            title: getTitle(this.action.title),
            meta: [
                { hid: 'og-title', name: 'og:title', content: getTitle(this.action.title) },
            ],
        };
    },
    data() {
        // https://github.com/nuxt/nuxt.js/issues/2444
        return {
            action: this.action || null,
            faq: this.faq || null,
        };
    },
    watch: {
        '$route.params.pathMatch': {
            handler() {
                this.$fetch();
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
                :params="action.params"
            />

            <nuxt-content class="card__content" :document="faq" v-if="faq"/>
        </div>
        <div v-else-if="$fetchState.pending">{{ $td('Loading…', 'index.loading') }}</div>
        <div v-else>{{ $td('Action not found', 'index.action-not-found') }}</div>



    </Modal>
</template>
