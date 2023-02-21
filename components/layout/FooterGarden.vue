<script>
export default {

};
</script>

<template>
    <div class="footer-garden u-text-center">
        <div class="u-container u-container--large">
            <template v-if="$i18n.locale === 'en'">
                <p><strong>Metagarden</strong> — a play-to-earn platform with mini games.</p>
                <a href="/metagarden/account" class="button button--medium button--garden u-mt-10">Metagarden account</a>
            </template>
            <template v-if="$i18n.locale === 'ru'">
                <p><strong>Metagarden</strong> — play-to-earn платформа с мини-играми.</p>
                <a href="/ru/metagarden/account" class="button button--medium button--garden u-mt-10">Аккаунт Metagarden</a>
            </template>
        </div>
    </div>
</template>
