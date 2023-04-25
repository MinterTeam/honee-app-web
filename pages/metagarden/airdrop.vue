<script>
import TelegramAuth from '~/components/TelegramAuth.vue';

export default {
    layout: 'splash',
    components: {
        TelegramAuth,
    },
    head() {
        return {
            htmlAttrs: {
                class: 'splash-layout splash-layout--garden',
            },
        };
    },
};
</script>

<template>
    <div class="u-section u-relative u-container u-container--small">
        <div class="card card__content card--pop card--light-grey u-text-center">
            <img class="card__pop-item--20 u-mb-15 u-image u-image--pixelated" src="/img/garden-rabbit.png" alt="" role="presentation">

            <template v-if="!$store.getters['telegram/isAuthorized']">
                <h1 class="u-h3 u-mb-05">{{ $td('GARDEN tokens airdrop', 'garden.airdrop-title') }}</h1>
                <p>{{ $td('Every BIP coins holder is eligible for GARDEN tokens Airdrop which will take place on December 12th, 2022. Register for the airdrop with your Telegram account.', 'garden.airdrop-description') }}</p>

                <TelegramAuth
                    class="u-mt-15 u-mb-10"
                    reason="garden"
                    :label="$td('Register with Telegram', 'garden.airdrop-telegram-button')"
                />

                <p class="u-text-medium">{{ $td('BIP holders can register only one address with BIP coins for this airdrop.', 'garden.airdrop-description-2') }}</p>
            </template>
            <template v-else>
                <h1 class="u-h3 u-mb-05">{{ $td('You’ve registered for GARDEN tokens airdop.', 'garden.airdrop-registered-title') }}</h1>
                <p>{{ $td('Make sure your address has BIP coins. Airdrop will take place on December 12th, 2022.', 'garden.airdrop-registered-description') }}</p>
            </template>
        </div>
    </div>
</template>
