<script>
import getTitle from '~/assets/get-title.js';
import TopupWaitSmartWallet from '~/components/TopupWaitSmartWallet.vue';

export default {
    layout(context) {
        return context.store.state.isMetagarden ? 'metagarden' : 'default';
    },
    components: {
        TopupWaitSmartWallet,
    },
    head() {
        const title = getTitle(this.$td('Deposit with crypto or cards', 'deposit.title'));

        return {
            title,
            meta: [
                {hid: 'og-title', name: 'og:title', content: title},
            ],
        };
    },
    data() {
        return {
            isDepositProcessing: false,
            successDeposit: '',
        };
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small u-text-center">
        <TopupWaitSmartWallet
            class="u-text-center u-mt-15 u-text-medium"
            :showWaitIndicator="true"
            :networkSlug="'bsc'"
            @update:processing="isDepositProcessing = $event"
            @topup="successDeposit = $event; $emit('topup', $event)"
        />
    </div>
</template>
