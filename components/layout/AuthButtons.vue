<script>
export default {
    props: {
        buttonClass: {
            type: String,
        },
    },
};
</script>

<template>
    <div>
        <nuxt-link
            class="button button--full button--large"
            :class="buttonClass"
            :to="$i18nGetPreferredPath('/auth/sign-up')"
        >
            {{ $td('Sign up', 'index.sign-up') }}
        </nuxt-link>

        <div class="u-text-center u-mt-15">
            <nuxt-link class="link link--underline u-fw-700" :to="$i18nGetPreferredPath('/auth/sign-in')">
                {{ $td('I already got a wallet', 'index.already-have-wallet') }}
            </nuxt-link>
        </div>
    </div>
</template>
