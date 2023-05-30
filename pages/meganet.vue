<script>
export default {
    components: {
    },
    head: {
        bodyAttrs: {
            class: 'megachain__body',
        },
    },
    fetch() {
    },
    /*
    head: {
        htmlAttrs: {
            class: 'metagarden-layout theme--metagarden',
        },
    },
    */
    data() {
        return {
        };
    },
    computed: {
    },
    methods: {
    },
};
</script>

<template>
    <div class="u-container--small">
        <div class="card card__content card__content--medium u-text-center u-mb-10">
            <h2 class="u-h3 u-mb-05">{{ $td('Become early adopter', 'meganet.early-adopter-title') }}</h2>
            <p class="u-text-medium">{{ $td('Buy MEGANET tokens to join the Metagarden Chain. All MEGANET token holders will receive native Metagarden Chain coins with a 100% bonus.', 'meganet.early-adopter-description') }}</p>

            <nuxt-link class="button button--main button--full u-mt-10" :to="$i18nGetPreferredPath('/balance')">
                {{ $td('Buy MEGANET tokens', 'meganet.buy-button') }}
            </nuxt-link>
        </div>
    </div>
</template>
