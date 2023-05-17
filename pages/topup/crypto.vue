<script>
import getTitle from '~/assets/get-title.js';
import TopupSmartWalletForm from '~/components/TopupSmartWalletForm.vue';
import TopupWaitSmartWalletWrap from '~/components/TopupWaitSmartWalletWrap.vue';

export default {
    layout(context) {
        return context.store.getters.isMetagarden ? 'metagarden' : 'default';
    },
    components: {
        TopupSmartWalletForm,
        TopupWaitSmartWalletWrap,
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
            isShowWaitSmartWallet: false,
        };
    },
    computed: {
    },
    methods: {
    },
};
</script>

<template>
    <div class="u-section u-container u-container--small">
        <div class="card card--invert">
            <div class="card__content card__content--medium">
                <h1 class="u-h3">
                    {{ $td('Topup with crypto', 'deposit.title-crypto') }}
                </h1>
            </div>
            <div class="card card--light-grey">
                <div
                    class="card__content card__content--medium"
                    :class="isShowWaitSmartWallet || isDepositProcessing || successDeposit ? '' : 'u-hidden'"
                >
                    <TopupWaitSmartWalletWrap
                        class="u-text-center u-text-medium"
                        :showWaitIndicator="false"
                        @update:processing="isDepositProcessing = $event"
                        @topup="successDeposit = $event;"
                        @is-show="isShowWaitSmartWallet = $event;"
                    />
                    <nuxt-link v-if="successDeposit" class="button button--ghost button--full u-mt-10" :to="$getDashboardUrl()">
                        {{ $td('Finish', 'common.finish') }}
                    </nuxt-link>
                </div>

                <div class="card__content card__content--medium" v-if="!isDepositProcessing && !successDeposit">
                    <TopupSmartWalletForm/>
                </div>
            </div>
        </div>




        <!--
        <nuxt-link class="button button&#45;&#45;ghost button&#45;&#45;full u-mt-10" :to="backUrl || $i18nGetPreferredPath('/topup')">
            {{ $td('Cancel', 'topup.back') }}
        </nuxt-link>
        -->


    </div>
</template>
