<script>
import FieldAddressDisplay from '~/components/base/FieldAddressDisplay.vue';

export default {
    components: {
        FieldAddressDisplay,
    },
    data() {
        return {
        };
    },
    computed: {
        smartWalletAddress() {
            return this.$store.getters.smartWalletAddress;
        },
    },
    methods: {
    },
};
</script>

<template>
    <div>
        <h2 class="u-h--uppercase-solid u-mb-025 u-flex u-flex--align-center">
            <img class="u-mr-minus-025" src="https://explorer-static.minter.network/coins/2065.png" alt="" role="presentation" width="24" height="24">
            <img class="u-mr-05" src="https://explorer-static.minter.network/coins/2107.png" alt="" role="presentation" width="24" height="24">
            {{ $td('From Ethereum & BNB Smart Chain', 'deposit.title-evm') }}
        </h2>

        <FieldAddressDisplay class="u-mt-10 u-mb-05" :value="smartWalletAddress" :label="$td('Your smart wallet address', 'deposit.smart-wallet-address')"/>

        <ul class="form-row u-text-muted u-text-small u-text-left">
            <template v-if="$i18n.locale === 'en'">
                <li>To deposit crypto, transfer only BEP20 or ERC20 tokens to the specified address, any amount;</li>
                <li>The first deposit for BNB Smart Chain ≈ $3, following ≈ $1.5. For Ethereum ≈ $50, following ≈ $25.</li>
            </template>
            <template v-if="$i18n.locale === 'ru'">
                <li>Для пополнения переводите на указанный адрес только BEP20 или ERC20 токены, любое количество;</li>
                <li>Первое пополнение для BNB Smart Chain ≈ 3$, последующие ≈ 1,5$. Для Ethereum ≈ 50$, последующие ≈ 25$.</li>
            </template>
        </ul>


    </div>
</template>
