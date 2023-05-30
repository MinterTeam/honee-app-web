<script>
import FieldAddressDisplay from '~/components/base/FieldAddressDisplay.vue';

export default {
    components: {
        FieldAddressDisplay,
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

            <nuxt-link class="button button--main button--full u-mt-10" :to="$i18nGetPreferredPath('/meganet/balance')">
                {{ $td('Buy MEGANET tokens', 'meganet.buy-button') }}
            </nuxt-link>


        </div>

        <div class="card card__content card__content--medium u-text-center u-mb-10">
            <h2 class="u-h3 u-mb-05">{{ $td('Your testnet address', 'meganet.testnet-address-title') }}</h2>

            <FieldAddressDisplay
                class="u-mt-10"
                :value="$store.getters.evmAddress"
                :label="$td('Metagarden testnet address', 'meganet.testnet-address-label')"
            />

            <a class="button button--main button--full u-mt-10" :href="`https://scan.testnet.metagarden.io/address/${$store.getters.evmAddress}`" target="_blank">{{ $td('View in block explorer', 'meganet.testnet-address-button') }}</a>
        </div>

        <div class="card card__content card__content--medium u-text-center">
            <h2 class="u-h3 u-mb-05">{{ $td('Useful links', 'meganet.useful-links-title') }}</h2>

            <a class="button button--ghost-main button--full u-mt-10" href="https://metagarden.io/" target="_blank">{{ $td('About EVM blockchain', 'meganet.useful-links-button-about') }}</a>
            <a class="button button--ghost-main button--full u-mt-10" href="https://metagarden.io/tokenomics" target="_blank">{{ $td('Tokenomics', 'meganet.useful-links-button-tokenomics') }}</a>
            <a class="button button--ghost-main button--full u-mt-10" href="https://metagarden.io/platform" target="_blank">{{ $td('Gaming platform', 'meganet.useful-links-button-platform') }}</a>
        </div>
    </div>
</template>
