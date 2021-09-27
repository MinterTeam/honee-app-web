<script>
import getTitle from '~/assets/get-title.js';
import {DASHBOARD_URL} from '~/assets/variables.js';
import Swap from '~/components/Swap.vue';
import TxPoolAddLiquidityForm from '~/components/TxPoolAddLiquidityForm.vue';
import TxPoolRemoveLiquidityForm from '~/components/TxPoolRemoveLiquidityForm.vue';
import TxStakeDelegateForm from '~/components/TxStakeDelegateForm.vue';
import TxStakeUnbondForm from '~/components/TxStakeUnbondForm.vue';
import Modal from '~/components/base/Modal.vue';

const addLiquidityAction = {
    title: 'Provide liquidity to pool',
    params: ['coin0', 'coin1'],
    component: TxPoolAddLiquidityForm,
};

const actionList = {
    swap: {
        title: 'Swap coins',
        params: ['coinToBuy', 'coinToSell'],
        component: Swap,
    },
    'add-liquidity': addLiquidityAction,
    win: {
        ...addLiquidityAction,
        title: 'Win',
    },
    farm: {
        ...addLiquidityAction,
        title: 'Farm',
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
        TxStakeDelegateForm,
        Modal,
    },
    fetchOnServer: false,
    fetch() {
        const [actionType, ...actionParams] = this.$route.params.pathMatch.split('/').filter((item) => !!item);
        const action = actionList[actionType];
        if (!action) {
            this.$nuxt.error({
                status: 404,
                message: 'Action not found',
            });
        }

        // params
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

        // title
        let title = action.title;
        if (actionType === 'delegate' && params.coin) {
            title += ' ' + params.coin;
        }

        this.action = Object.freeze({
            ...action,
            title,
            params,
        });
    },
    head() {
        return {
            title: getTitle(this.action?.title),
            meta: [
                { hid: 'og-title', name: 'og:title', content: getTitle(this.action?.title) },
            ],
        };
    },
    data() {
        return {
            action: null,
        };
    },
};
</script>

<template>
    <Modal
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

            <div class="card__content">
                <h3 class="u-h5 u-mb-05">What’s BIP?</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa pellentesque donec in mus mi massa fusce netus. Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>

                <h3 class="u-h5 u-mb-05 u-mt-15">What's swap?</h3>
                <p>Nec gravida faucibus pellentesque aliquam consequat sed. Dignissim suspendisse blandit lacinia amet. Cras tincidunt nec maecenas eleifend nisl tristique volutpat enim habitant.</p>

                <h3 class="u-h5 u-mb-05 u-mt-15">Is it possible to cancel the transaction?</h3>
                <p>Augue nisi quis dignissim sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>

                <h3 class="u-h5 u-mb-05 u-mt-15">How long does a transaction take to complete?</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquet ac tellus etiam.</p>
            </div>
        </div>
        <div v-else-if="$fetchState.pending">Loading…</div>
        <div v-else>Action not found</div>



    </Modal>
</template>
