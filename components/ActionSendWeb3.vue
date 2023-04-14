<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import Big from 'minterjs-util/src/big.js';
import {buildTransferTx, toErcDecimals} from 'minter-js-web3-sdk/src/web3.js';
import {pretty} from '~/assets/utils.js';
import {HUB_NETWORK_SLUG, HUB_CHAIN_DATA} from '~/assets/variables.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3SmartWalletWithRelayReward from 'minter-js-web3-sdk/src/composables/use-web3-smartwallet-relay-reward.js';
import FieldAddress from '~/components/base/FieldAddress.vue';


export default {
    components: {
        FieldAddress,
    },
    mixins: [validationMixin],
    emits: [
        // 'success',
        // 'success-modal-close',
        // 'override-stats-value',
    ],
    props: {
        action: {
            type: Object,
        },
        params: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        const {networkGasPrice, setHubOracleProps} = useHubOracle({
            subscribePriceList: true,
        });
        const {tokenContractAddressFixNative: tokenContractAddress, tokenDecimals, hubCoin, tokenData, setHubTokenProps} = useHubToken();
        const {smartWalletAddress, setSmartWalletProps, buildTxForRelayReward, callSmartWallet} = useWeb3SmartWalletWithRelayReward();

        return {
            networkGasPrice,
            setHubOracleProps,

            tokenContractAddress,
            tokenDecimals,
            setHubTokenProps,
            hubCoin, tokenData,


            smartWalletAddress,
            setSmartWalletProps,
            buildTxForRelayReward,
            callSmartWallet,
        };
    },
    data() {
        return {
            form: {
                token: '',
                amount: '',
                address: '',
            },
        };
    },
    computed: {
        /** @type {HubChainDataItem} */
        hubChainData() {
            return HUB_CHAIN_DATA[HUB_NETWORK_SLUG.BSC];
        },
        isTokenDecimalsFetched() {
            return this.tokenDecimals > 0;
        },
    },
    created() {
        // smartWalletProps
        this.$watch(
            () => ({
                privateKey: this.$store.getters.privateKey,
                evmAccountAddress: this.$store.getters.evmAddress,
                chainId: this.hubChainData.chainId,
                gasPriceGwei: this.networkGasPrice,
                gasTokenAddress: this.tokenContractAddress,
                gasTokenDecimals: this.tokenDecimals,
                estimationSkip: true,
            }),
            (newVal) => this.setSmartWalletProps(newVal),
            {deep: true, immediate: true},
        );

        // hubOracleProps
        this.$watch(
            () => ({
                hubNetworkSlug: this.hubChainData.hubNetworkSlug,
                fixInvalidGasPriceWithDummy: false,
            }),
            (newVal) => this.setHubOracleProps(newVal),
            {deep: true, immediate: true},
        );

        // hubTokenProps
        this.$watch(
            () => ({
                chainId: this.hubChainData.chainId,
                tokenSymbol: this.form.token.indexOf('0x') === 0 ? '' : this.form.token,
                tokenAddress: this.form.token.indexOf('0x') === 0 ? this.form.token : '',
            }),
            (newVal) => this.setHubTokenProps(newVal),
            {deep: true, immediate: true},
        );
    },
    methods: {
        pretty,
        async submit() {
            if (!this.isTokenDecimalsFetched) {
                return;
            }
            const relayRewardData = await this.buildTxForRelayReward();
            const amount = new Big(this.form.amount).minus(relayRewardData.swapLimit).toString();
            if (amount <= 0) {
                throw new Error('Not enough amount to pay tx fee');
            }
            let tx;
            if (this.form.token === 'BNB') {
                tx = {
                    to: this.form.address,
                    value: toErcDecimals(amount, this.tokenDecimals),
                    data: '0x',
                };
            } else {
                tx = buildTransferTx(this.form.token, this.form.address, toErcDecimals(amount, this.tokenDecimals));
            }
            this.callSmartWallet([].concat(relayRewardData.txList, tx))
                .then((result) => {
                    window.alert(`https://explorer.minter.network/smart-wallet-relay/${this.hubChainData.hubNetworkSlug}/${result.hash}`);
                    this.clearForm();
                })
                .catch((error) => {
                    window.alert(error);
                });
        },
        clearForm() {
            this.form.token = '';
            this.form.amount = '';
            this.form.address = '';
            // this.$v.$reset();
        },
    },
};

</script>

<template>
    <form @submit.prevent="submit()">
        <div class="form-row">
            Your address: {{ smartWalletAddress }}
        </div>
        <div class="h-field form-row">
            <div class="h-field__content">
                <div class="h-field__title">Coin symbol or address of token contract to send (e.g. USDTBSC)</div>
                <input class="h-field__input" type="text" v-model="form.token">
            </div>
        </div>
        <div class="h-field form-row">
            <div class="h-field__content">
                <div class="h-field__title">Amount</div>
                <input class="h-field__input" type="text" v-model="form.amount" inputmode="decimal">
            </div>
        </div>

        <div class="form-row">
            <FieldAddress
                v-model.trim="form.address"
                :label="$td('To the address', 'form.wallet-send-address')"
                placeholder="0x"
            />
        </div>
        <div class="form-row">
            <button class="button button--main button--full" type="submit">Send</button>
        </div>
    </form>
</template>
