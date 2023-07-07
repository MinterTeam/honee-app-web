<script>
import 'core-js/es/array/to-spliced.js';
import 'core-js/es/array/to-sorted.js';
import {getCoinHolders} from '~/api/chainik.js';

export default {
    fetch() {
        getCoinHolders('MEGANET').then((holders) => {
            this.meganetHolders = holders;
        });
        getCoinHolders('LAUNCHER').then((holders) => {
            this.launcherHolders = holders;
        });
    },
    data() {
        return {
            meganetHolders: [],
            launcherHolders: [],
        };
    },
    computed: {
        meganetPosition() {
            return this.meganetHolders.find((item) => item.address === this.$store.getters.address)?.rank;
        },
        launcherPosition() {
            const position = this.launcherHolders.find((item) => item.address === this.$store.getters.address)?.rank;
            return position ? position : this.launcherHolders.length + 1;
        },
    },
    methods: {
        selectRatingCategory(position) {
            const categoryList = [10, 50, 100, 500, 1000, 10000];
            const index = categoryList.toSpliced(0, 0, position).toSorted((a, b) => a - b).indexOf(position);
            return categoryList[index];
        },
    },
};
</script>

<template>
    <div>
        <div class="u-flex u-flex--align-center u-mb-10">
            <img class="u-image u-image--round u-mr-05" alt="" src="/img/icon-star.svg" width="24" height="24">
            <div class="u-h--uppercase-solid">
                {{ $td(`Your ratings`, 'meganet.rating-title') }}
            </div>
        </div>

        <div class="u-flex u-flex--justify-between u-flex--align-center u-mb-10" v-if="meganetPosition > 0">
            <div class="u-flex u-flex--align-center u-mr-10">
                <div class="u-h--uppercase u-text-mega-muted">
                    {{ $td(`MEGANET holders`, 'meganet.rating-meganet-holders', {coin: 'MEGANET'}) }}
                </div>
            </div>

            <div class="u-h u-h4">
                {{ meganetPosition }}
                <span class="u-text-mega-muted">/</span>
                Top-{{ selectRatingCategory(meganetPosition) }}
            </div>
        </div>
        <div class="u-flex u-flex--justify-between u-flex--align-center">
            <div class="u-flex u-flex--align-center u-mr-10">
                <div class="u-h--uppercase u-text-mega-muted">
                    {{ $td(`LAUNCHER holders`, 'meganet.rating-launcher-holders', {coin: 'LAUNCHER'}) }}
                </div>
            </div>

            <div class="u-h u-h4">
                {{ launcherPosition }}
                <span class="u-text-mega-muted">/</span>
                Top-{{ selectRatingCategory(launcherPosition) }}
            </div>
        </div>
    </div>

</template>

