<script>
import {DASHBOARD_URL} from '~/assets/variables.js';

const ACTION_TYPE = {
    SWAP: 'swap',
    FARM: 'farm',
    DELEGATE: 'delegate',
    WIN: 'win',
    REMOVE_LIQUIDITY: 'remove_liquidity',
    UNBOND: 'unbond',
};

export default {
    ACTION_TYPE,
    props: {
        card: {
            type: Object,
            required: true,
        },
    },
    computed: {
        iconList() {
            if (typeof this.card.icon === 'string') {
                return [this.card.icon];
            }

            return this.card.icon;
        },
        undoActionType() {
            switch (this.card.actionType) {
                case ACTION_TYPE.FARM:
                case ACTION_TYPE.WIN:
                    return ACTION_TYPE.REMOVE_LIQUIDITY;
                case ACTION_TYPE.DELEGATE:
                    return ACTION_TYPE.UNBOND;
                default:
                    return undefined;
            }
        },
        undoActionUrl() {
            if (this.undoActionType === ACTION_TYPE.REMOVE_LIQUIDITY) {
                return this.card.action.replace(/^\/(\w+)/, '/remove-liquidity');
            }
            if (this.undoActionType === ACTION_TYPE.UNBOND) {
                return this.card.action.replace(/^\/(\w+)/, '/unbond');
            }
            return undefined;
        },
        isUndoAvailable() {
            const parts = this.card.action.split('/').filter((item) => !!item);
            if (this.undoActionType === ACTION_TYPE.REMOVE_LIQUIDITY) {
                const lp = this.$store.state.liquidityList.find((item) => poolHasCoin(item, parts[1]) && poolHasCoin(item, parts[2]));
                return lp?.liquidity > 0;
            }
            if (this.undoActionType === ACTION_TYPE.UNBOND) {
                const stake = this.$store.state.stakeList.find((item) => item.coin.symbol === parts[1]);
                return stake?.value > 0;
            }
            return false;
        },
    },
    methods: {
        getIconUrl(icon) {
            return icon.indexOf('/') >= 0 ? icon : this.$store.getters['explorer/getCoinIcon'](icon);
        },
        pageUrl(page) {
            return this.$i18nGetPreferredPath((DASHBOARD_URL + page).replace('//', '/'));
        },
    },
};

function poolHasCoin(pool, symbol) {
    return pool.coin0.symbol === symbol || pool.coin1.symbol === symbol;
}
</script>

<template>
    <div class="card card--invert card__content--small" :style="`background-color: ${card.color};`">
        <div class="card__action-head">
            <img class="card__action-logo" alt=""
                 v-for="icon in iconList" :key="icon"
                 :src="getIconUrl(icon)"
            >
            <div class="card__action-stats">
                <div class="card__action-stats-caption">{{ card.stats.caption }}</div>
                <div class="card__action-stats-value">{{ card.stats.value }}</div>
            </div>
        </div>
        <h3 class="card__action-title">{{ card.title }}</h3>
        <p class="">{{ card.description }}</p>

        <div class="card__action-tag-list">
            <div class="card__action-tag" v-for="tag in card.tags" :key="tag">{{ tag }}</div>
        </div>

        <div class="u-mt-15">
            <div class="u-grid">
                <div class="u-cell" :class="isUndoAvailable ? 'u-cell--6-10': ''">
                    <nuxt-link class="button button--full " :to="pageUrl(card.action)">
                        <template v-if="card.actionType === $options.ACTION_TYPE.SWAP">Swap</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.FARM">Add liquidity</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.DELEGATE">Delegate</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.WIN">Participate</template>
                    </nuxt-link>
                </div>
                <div class="u-cell u-cell--4-10" v-if="isUndoAvailable">
                    <nuxt-link class="button button--full button--ghost-white" :to="pageUrl(undoActionUrl)">
                        <template v-if="undoActionType === $options.ACTION_TYPE.REMOVE_LIQUIDITY">Withdraw</template>
                        <template v-if="undoActionType === $options.ACTION_TYPE.UNBOND">Unbond</template>
                    </nuxt-link>
                </div>
            </div>
        </div>
    </div>
</template>
