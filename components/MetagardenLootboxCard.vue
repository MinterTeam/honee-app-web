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
    <nuxt-link :to="$i18nGetPreferredPath('/metagarden/lootbox')" class="card card__content--small card--metagarden-lootbox luminaire__card u-text-center" v-if="lootbox">
        <div class="luminaire__wrap">
            <div class="luminaire on"></div>
            <img class="u-mb-05" src="/img/metagarden-lootbox-fancy.png" srcset="/img/metagarden-lootbox-fancy@2x.png" alt="" role="presentation" width="133" height="136">
        </div>


        <h2 class="u-h3">{{ $td('You’ve got a new lootbox!', 'mg-lootbox.new-lootbox-button') }}</h2>

    </nuxt-link>
</template>

<style lang="less" scoped>
.luminaire__card {overflow: clip; position: relative; z-index: 0;}
.luminaire__wrap {position: relative;}
.luminaire {
    position: absolute;
    z-index: -1;
    left: 50%;
    top: 50%;
    margin: -15px;
    display: inline-block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    //background-color: #000;
    box-shadow: 0 0 40px 20px #fff, 0 0 100px 50px #0ff;
    transition: box-shadow 4s ease-out;
    animation: spin 16s linear infinite;
}
@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}

.luminaire:hover {
    cursor: pointer;
}
.luminaire::before, .luminaire::after {
    @width: 0px;
    content: '';
    display: block;
    position: absolute;
    top: calc(50% - (@width / 2));
    left: calc(50% - (@width / 2));
    //width: @width;
    //height: @width;
    border-radius: 50%;
    //background-color: #fff;
    box-shadow: 0 0 40px 20px #fff, 0 0 100px 50px #ff0;
    opacity: 0;
    transition: opacity 8s, transform 8s;
}
.on {
    background-color: #fff;
    box-shadow: 0 0 80px 40px #fff, 0 0 200px 100px #f0f;
}
.on::before {
    transform: translateX(-100px);
    opacity: 1;
}
.on::after {
    transform: translateX(100px);
    opacity: 1;
}
</style>
