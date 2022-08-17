<script>
import get from 'lodash-es/get.js';
import hashColor from '~/assets/hash-color.js';
import {clearActionQuery} from '~/components/CardAction.vue';
import CardHead from '~/components/CardHead.vue';

const ACTION_TYPE = {
    DEPOSIT: 'buy',
    SWAP: 'swap',
    FARM: 'farm',
    DELEGATE: 'delegate',
    WIN: 'win',
    REMOVE_LIQUIDITY: 'remove_liquidity',
    UNBOND: 'unbond',
    STAKE: 'stake',
};

export default {
    ACTION_TYPE,
    components: {
        CardHead,
    },
    props: {
        /** @type {PropOptions<CardListItem>} */
        card: {
            type: Object,
            required: true,
        },
        actionBaseUrl: {
            type: String,
        },
    },
    computed: {
        color() {
            return hashColor(clearActionQuery(this.card.action));
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
                return clearActionQuery(this.card.action.replace(/^\/(\w+)/, '/remove-liquidity'));
            }
            if (this.undoActionType === ACTION_TYPE.UNBOND) {
                return clearActionQuery(this.card.action.replace(/^\/(\w+)/, '/unbond'));
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
        translate(key) {
            return translateCardField(this.card, key, this.$i18n.locale);
        },
    },
};

export function translateCardField(card, key, locale) {
    // fallback to en locale
    return get(card?.[locale], key) || get(card, key);
}

function poolHasCoin(pool, symbol) {
    return pool.coin0.symbol === symbol || pool.coin1.symbol === symbol;
}
</script>

<template>
    <div class="card card--action card--invert card__content--small" :style="`background-color: ${color};`">
        <CardHead :card="card"/>
        <p class="card__action-description">{{ translate('description') }}</p>

        <!--<div class="card__action-tag-list">
            <div class="card__action-tag" v-for="tag in card.tags" :key="tag">{{ $td(tag, `action.tag-${tag.toLowerCase()}`) }}</div>
        </div>-->

        <div class="u-mt-10">
            <div class="u-grid">
                <div class="u-cell" :class="isUndoAvailable ? 'u-cell--6-10': ''">
                    <nuxt-link class="button button--full " :to="getDashboardUrl(card.action, actionBaseUrl)">
                        <template v-if="card.actionType === $options.ACTION_TYPE.DEPOSIT">{{ $td('Buy with BNB & ETH', 'index.card-button-deposit') }}</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.SWAP">{{ $td('Buy', 'index.swap') }}</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.FARM">{{ $td('Add liquidity', 'index.add-liquidity') }}</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.DELEGATE">{{ $td('Delegate', 'index.delegate') }}</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.WIN">{{ $td('Participate', 'index.participate') }}</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.STAKE">{{ $td('Stake', 'index.stake') }}</template>
                    </nuxt-link>
                </div>
                <div class="u-cell u-cell--4-10" v-if="isUndoAvailable">
                    <nuxt-link class="button button--full button--ghost-white" :to="getDashboardUrl(undoActionUrl, actionBaseUrl)">
                        <template v-if="undoActionType === $options.ACTION_TYPE.REMOVE_LIQUIDITY">{{ $td('Withdraw', 'index.withdraw-unbond') }}</template>
                        <template v-if="undoActionType === $options.ACTION_TYPE.UNBOND">{{ $td('Unbond', 'index.withdraw-unbond') }}</template>
                    </nuxt-link>
                </div>
            </div>
        </div>
    </div>
</template>
