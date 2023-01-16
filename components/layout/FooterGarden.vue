<script>
export default {

};
</script>

<template>
    <div class="footer-garden u-text-center">
        <div class="u-container u-container--large">
            <template v-if="$i18n.locale === 'en'">
                <p><strong>metagarden</strong> — a play-to-earn platform with mini games.</p>
                <a href="https://t.me/metagarden" target="_blank" class="button button--medium button--garden u-mt-10">Join the community</a>
            </template>
            <template v-if="$i18n.locale === 'ru'">
                <p><strong>metagarden</strong> — play-to-earn платформа с мини-играми.</p>
                <a href="https://t.me/metagardenru" target="_blank" class="button button--medium button--garden u-mt-10">Присоединиться к сообществу</a>
            </template>
        </div>
    </div>
</template>
