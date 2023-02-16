<script>
import {getLootbox} from '~/api/metagarden.js';

export default {
    fetch() {
        return getLootbox(this.$store.getters.privateKey)
            .then((lootbox) => {
                this.lootbox = lootbox;
            });
    },
    data() {
        return {
            lootbox: null,
        };
    },
};
</script>

<template>
    <div class="card card__content--small card--metagarden" v-if="lootbox">
        <div class="u-flex u-flex--align-center">
            <img class="u-flex-item--no-shrink u-mr-10" src="/img/metagarden-lootbox-ready.svg" alt="" role="presentation" width="64" height="64">

            <div class="u-flex-item--grow">
                <nuxt-link :to="$i18nGetPreferredPath('/metagarden/lootbox')" class="button button--full button--gradient-green">
                    {{ $td('You’ve got a new lootbox!', 'mg-lootbox.new-lootbox-button') }}
                </nuxt-link>
            </div>
        </div>
    </div>
</template>
