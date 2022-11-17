<script>
export default {

};
</script>

<template>
    <div class="footer-garden u-text-center">
        <div class="u-container u-container--large">
            <template v-if="$i18n.locale === 'en'">
                <p>Play metagarden games! Participate in the <strong>GARDEN</strong> tokens airdrop for <strong>BIP</strong> holders.</p>
                <nuxt-link class="button button--medium button--garden u-mt-10" :to="$i18nGetPreferredPath('/metagarden')">Get GARDEN airdrop</nuxt-link>
            </template>
            <template v-if="$i18n.locale === 'ru'">
                <p>Играйте в metagarden-игры! Примите участие в раздаче токенов <strong>GARDEN</strong> для держателей <strong>BIP</strong>.</p>
                <nuxt-link class="button button--medium button--garden u-mt-10" :to="$i18nGetPreferredPath('/metagarden')">Получить аирдроп GARDEN</nuxt-link>
            </template>
        </div>
    </div>
</template>
