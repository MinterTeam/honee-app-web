<script>
import {getLootboxList} from '~/api/metagarden.js';

export default {
    props: {
        allowEmpty: {
            type: Boolean,
            default: false,
        },
        externalLink: {
            type: String,
        },
    },
    fetch() {
        return getLootboxList(this.$store.getters.privateKey)
            .then((lootboxList) => {
                this.lootboxList = lootboxList;
            });
    },
    data() {
        return {
            lootboxList: [],
        };
    },
};
</script>

<template>
    <component
        :is="lootboxList.length > 0 ? (externalLink ? 'a' : 'nuxt-link') : 'div'"
        :to="$i18nGetPreferredPath('/metagarden/lootbox')"
        :href="externalLink"
        :target="externalLink ? '_blank' : undefined"
        class="card card__content--small card--metagarden-lootbox u-text-center"
        v-if="lootboxList.length > 0 || allowEmpty"
    >
        <img class="u-mb-05" :class="{'mg-lootbox__chest-inactive': !lootboxList.length}" src="/img/metagarden-lootbox-fancy.png" srcset="/img/metagarden-lootbox-fancy@2x.png" alt="" role="presentation" width="179" height="151">


        <template v-if="lootboxList.length > 0">
            <h2 class="u-h3 u-mb-05">
            {{ $td('You’ve got', 'mg-lootbox.new-lootbox-button') }}
            {{ $tc('mg-lootbox.new-lootbox-button-plural', lootboxList.length, {n: lootboxList.length}) }}!
            </h2>
            <p>{{ $td('Check Launchpad every day to find new lootboxes.', 'mg-lootbox.new-lootbox-p') }}</p>
        </template>
        <template v-else>
            <h2 class="u-h3 u-mb-05">
            {{ $td('No lootboxes. Visit tomorrow!', 'mg-lootbox.no-lootbox-title') }}
            </h2>
            <p>{{ $td('Check Launchpad every day to find new lootboxes.', 'mg-lootbox.no-lootbox-p') }}</p>
        </template>
    </component>
</template>

<style>
.mg-lootbox__chest-inactive {filter: grayscale(100%) brightness(1.1);}
</style>
