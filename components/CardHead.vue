<script>
import get from 'lodash-es/get.js';

export default {
    props: {
        card: {
            type: Object,
        },
        fallbackTitle: {
            type: String,
        },
        overrideValue: {
            type: [String, Number],
        },
    },
    computed: {
        iconList() {
            const icon = this.card?.icon || this.card?.coin;

            if (typeof icon === 'string') {
                return [icon];
            }

            return icon;
        },
    },
    methods: {
        getIconUrl(icon) {
            return icon.indexOf('/') >= 0 ? icon : this.$store.getters['explorer/getCoinIcon'](icon);
        },
        translate(key) {
            const localeData = this.$i18n.locale === 'en' ? this.card : this.card?.[this.$i18n.locale];
            return get(localeData, key);
        },
    },
};
</script>

<template>
    <div class="card__action-head">
        <img
            class="card__action-logo" alt=""
            v-for="icon in iconList" :key="icon"
            :src="getIconUrl(icon)"
        >
        <div class="card__action-title">
            <div class="card__action-title-type" v-if="card && card.caption">{{ translate('caption') }}</div>
            <div class="card__action-title-value">{{ card ? translate('title') : fallbackTitle }}</div>
        </div>
        <div class="card__action-stats" v-if="card">
            <div class="card__action-stats-caption">{{ translate('stats.caption') }}</div>
            <div class="card__action-stats-value">{{ overrideValue || translate('stats.value') }}</div>
        </div>
    </div>
</template>
