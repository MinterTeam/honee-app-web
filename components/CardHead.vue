<script>
import {defineComponent} from 'vue';
import get from 'lodash-es/get.js';
import {pretty} from '~/assets/utils.js';
import BaseTooltip from '~/components/base/BaseTooltip.vue';
import {getCoinBySymbol} from '~/api/explorer.js';

export default defineComponent({
    components: {
        BaseTooltip,
    },
    props: {
        card: {
            /** @type {PropType<CardListItem>} */
            type: Object,
        },
        fallbackTitle: {
            type: String,
        },
        overrideValue: {
            type: [String, Number],
        },
    },
    fetch() {
        if (this.isShowStatsPrice) {
            return getCoinBySymbol(this.card.coin)
                .then((coinInfo) => {
                    this.price = coinInfo.priceUsd;
                });
        }
    },
    data() {
        return {
            price: 0,
        };
    },
    computed: {
        iconList() {
            const icon = this.card?.icon;

            if (typeof icon === 'string') {
                return [icon];
            }

            return icon;
        },
        caption() {
            return this.translate('caption');
        },
        title() {
            return this.card ? this.translate('title') : this.fallbackTitle;
        },
        isMgSwapTitles() {
            const MG_COINS = ['METAGARDEN', 'MEGANET'];
            return this.$store.state.isMetagarden && MG_COINS.includes(this.title) && this.caption;
        },
        // swap title and caption for metagarden
        finalCaption() {
            return this.isMgSwapTitles ? this.title : this.caption;
        },
        finalTitle() {
            return this.isMgSwapTitles ? this.caption : this.title;
        },
        isShowStatsPrice() {
            return this.card?.stats?.price && this.card.coin;
        },
        statsCaption() {
            const stats = this.card?.stats;

            const aprOrApy = stats?.apr || stats?.apy;
            if (aprOrApy) {
                let result;
                if (stats.apr) {
                    result = this.$td('APR', 'common.apr');
                } else if (stats.apy) {
                    result = this.$td('APY', 'common.apy');
                }

                if (aprOrApy.rewardCoin) {
                    result += ` ${this.$td('in', 'common.in')} ${aprOrApy.rewardCoin}`;
                }

                return result;
            }
            if (this.isShowStatsPrice) {
                return this.$td('Token price', 'common.token-price');
            }

            return this.translate('stats.caption');
        },
        statsValue() {
            if (this.overrideValue) {
                return this.overrideValue;
            }
            const stats = this.card?.stats;

            let percent = stats?.apr?.percent || stats?.apy?.percent;
            if (percent) {
                const isRange = (/.+-.+/).test(percent.toString());
                if (isRange) {
                    const [percent1, percent2] = percent.split('-');
                    return `${this.$td('up to', 'common.upto')} ${percent2}%`;
                } else {
                    return percent + '%';
                }
            }
            if (this.isShowStatsPrice) {
                const price = this.price || this.$store.getters['portfolio/getCoinPrice'](this.card.coin);
                return '$' + pretty(price);
            }

            return this.translate('stats.value');
        },
    },
    methods: {
        getIconUrl(icon) {
            return icon.indexOf('/') >= 0 ? icon : this.$store.getters['explorer/getCoinIcon'](icon);
        },
        translate(key) {
            // fallback to en locale
            return get(this.card?.[this.$i18n.locale], key) || get(this.card, key);
        },
    },
});
</script>

<template>
    <div class="card__action-head">
        <img
            class="card__action-logo" alt=""
            v-for="icon in iconList" :key="icon"
            :src="getIconUrl(icon)"
        >
        <div class="card__action-title">
            <div class="card__action-title-type" v-if="finalCaption">{{ finalCaption }}</div>
            <div class="card__action-title-value">{{ finalTitle }}</div>
        </div>
        <div class="card__action-stats" v-if="card?.stats">
            <div class="card__action-stats-caption">{{ statsCaption }}</div>
            <div class="card__action-stats-value">{{ statsValue }}</div>
        </div>

        <BaseTooltip
            v-if="card?.tooltip && !card.stats"
            class="card__action-tooltip"
            :content="translate('tooltip')"
        />
    </div>
</template>
