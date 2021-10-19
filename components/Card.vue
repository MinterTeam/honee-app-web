<script>
import {DASHBOARD_URL} from '~/assets/variables.js';

export default {
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
            <div class="card__action-tag" v-for="tag in card.tags" :key="tag">{{ $td(tag, `action.tag-${tag.toLowerCase()}`) }}</div>
        </div>

        <nuxt-link class="button button--full u-mt-15" :to="card.action">
            <template v-if="card.actionType === 'swap'">Swap</template>
            <template v-if="card.actionType === 'farm'">Add liquidity</template>
            <template v-if="card.actionType === 'delegate'">Delegate</template>
            <template v-if="card.actionType === 'win'">Participate</template>
        </nuxt-link>
    </div>
</template>
