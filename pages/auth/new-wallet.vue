<script>
export default {
    layout: 'splash',
    asyncData({redirect, app}) {
        return redirect(app.i18nGetPreferredPath('/auth/sign-up'));
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        Loading…
    </div>
</template>

