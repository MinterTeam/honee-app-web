<script>
import {DASHBOARD_URL} from '~/assets/variables.js';
import hashColor from '~/assets/hash-color.js';

const ACTION_TYPE = {
    DEPOSIT: 'buy',
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
        color() {
            return hashColor(this.card.action);
        },
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
        translate(key) {
            const localeData = this.$i18n.locale === 'en' ? this.card : this.card[this.$i18n.locale];
            if (localeData?.[key]) {
                return localeData[key];
            }
            // fallback to en locale
            return this.card[key];
        },
        $ts(locales) {
            if (locales[this.$i18n.locale]) {
                return locales[this.$i18n.locale];
            }

            return locales.en;
        },
    },
};

function poolHasCoin(pool, symbol) {
    return pool.coin0.symbol === symbol || pool.coin1.symbol === symbol;
}
</script>

<template>
    <div class="card card--action card--invert card__content--small" :style="`background-color: ${color};`">
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
        <h3 class="card__action-title">{{ translate('title') }}</h3>
        <p class="card__action-description">{{ translate('description') }}</p>

        <div class="card__action-tag-list">
            <div class="card__action-tag" v-for="tag in card.tags" :key="tag">{{ $td(tag, `action.tag-${tag.toLowerCase()}`) }}</div>
        </div>

        <div class="u-mt-15">
            <div class="u-grid">
                <div class="u-cell" :class="isUndoAvailable ? 'u-cell--6-10': ''">
                    <nuxt-link class="button button--full " :to="pageUrl(card.action)">
                        <template v-if="card.actionType === $options.ACTION_TYPE.DEPOSIT">{{ $td('Buy with BNB & ETH', 'index.card-button-deposit') }}</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.SWAP">{{ $td('Buy', 'index.swap') }}</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.FARM">{{ $td('Add liquidity', 'index.add-liquidity') }}</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.DELEGATE">{{ $td('Delegate', 'index.delegate') }}</template>
                        <template v-if="card.actionType === $options.ACTION_TYPE.WIN">{{ $td('Participate', 'index.participate') }}</template>
                    </nuxt-link>
                </div>
                <div class="u-cell u-cell--4-10" v-if="isUndoAvailable">
                    <nuxt-link class="button button--full button--ghost-white" :to="pageUrl(undoActionUrl)">
                        <template v-if="undoActionType === $options.ACTION_TYPE.REMOVE_LIQUIDITY">{{ $td('Withdraw', 'index.withdraw-unbond') }}</template>
                        <template v-if="undoActionType === $options.ACTION_TYPE.UNBOND">{{ $td('Unbond', 'index.withdraw-unbond') }}</template>
                    </nuxt-link>
                </div>
            </div>
        </div>
    </div>
</template>
