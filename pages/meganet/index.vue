<script>
import FieldAddressDisplay from '~/components/base/FieldAddressDisplay.vue';
import {prettyRound} from '~/assets/utils';

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
        prettyRound,
    },
};
</script>

<template>
    <div class="u-container--small">
        <div class="card card__content card__content--medium u-text-center u-mb-10">
            <h2 class="u-h3 u-mb-05">{{ $td('Become early adopter', 'meganet.early-adopter-title') }}</h2>
            <p class="u-text-medium">{{ $td('Buy MEGANET tokens to join the Metagarden Chain. All MEGANET token holders will receive native Metagarden Chain coins with a 100% bonus.', 'meganet.early-adopter-description') }}</p>



            <div class="meganet__range u-mt-15" :style="`--val: 305; --min: 0; --max: 500; --step: 1`"></div>

            <div class="u-mt-10 u-text-medium u-fw-700">{{ $td('', 'meganet.tokens-left-1') }}{{ prettyRound(500000 - 305000) }} {{ $td('of 500 000 tokens left', 'meganet.tokens-left-2') }}</div>

            <nuxt-link class="button button--main button--full u-mt-10" :to="$i18nGetPreferredPath('/meganet/balance')">
                {{ $td('Buy MEGANET tokens', 'meganet.buy-button') }}
            </nuxt-link>
        </div>

        <div class="card card__content card__content--medium u-text-center u-mb-10">
            <h2 class="u-h3 u-mb-05">{{ $td('MEGANET price stages', 'meganet.token-price-stages-title') }}</h2>
            <p class="u-text-medium u-mb-10">{{ $td('The current price of early access MEGANET tokens is', 'meganet.token-price-stages-description-1') }} <span class="span-green">$0.32</span> {{ $td('per token.', 'meganet.token-price-stages-description-2') }}</p>
            <img src="/img/megachain-prices.svg" alt="MEGANET Price Stages" width="100%">
            <p class="u-text-small">{{ $td('The token price can be subject to increase at any time.', 'meganet.token-price-stages-p') }}</p>
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

            <a class="button button--ghost-main button--full u-mt-10" :href="$td('https://metagarden.io/', 'meganet.useful-links-button-about-url')" target="_blank">{{ $td('About EVM blockchain', 'meganet.useful-links-button-about') }}</a>
            <a class="button button--ghost-main button--full u-mt-10" :href="$td('https://metagarden.io/tokenomics', 'meganet.useful-links-button-tokenomics-url')" target="_blank">{{ $td('Tokenomics', 'meganet.useful-links-button-tokenomics') }}</a>
            <a class="button button--ghost-main button--full u-mt-10" :href="$td('https://metagarden.io/platform', 'meganet.useful-links-button-platform-url')" target="_blank">{{ $td('Gaming platform', 'meganet.useful-links-button-platform') }}</a>
        </div>
    </div>
</template>

<style lang="less">
@import '~/assets/less/include/variables.less';

.meganet-range-track() {
    border-radius: 8px;
    height: 16px;
}
.meganet__range {
    .meganet-range-track(); background: #1c082f; position: relative;
    --meganet-width-percent: var(--val) / var(--max) * 100%;
    // progress
    &::before {
        .meganet-range-track();
        content: ''; position: absolute; left: 0; top: 0;
        background: var(--color-main);
        width: ~"calc(max(var(--meganet-width-percent), 8px))";
    }
    // thumb
    &::after {
        content: '';
        position: absolute;
        width: 40px;
        height: 40px;
        left: ~"calc(max(var(--meganet-width-percent) - 24px, -16px))";
        top: (-1 * (40px - 16px) / 2);
        background: var(--color-main);
        opacity: 0.56;
        filter: blur(12px);
        border-radius: 50%;
    }
}
</style>
