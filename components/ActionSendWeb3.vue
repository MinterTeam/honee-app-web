<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import Big from '~/assets/big.js';
import {getTokenSymbolForNetwork} from '~/api/hub.js';
import {pretty} from '~/assets/utils.js';
import {HUB_NETWORK, HUB_CHAIN_DATA, HUB_WITHDRAW_SPEED, NATIVE_COIN_ADDRESS} from '~/assets/variables.js';
// import useHubOracle from '~/composables/use-hub-oracle.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3SmartWalletWithRelayReward from '~/composables/use-web3-smartwallet-relay-reward.js';
import {buildTransferTx, toErcDecimals} from '~/api/web3.js';
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
        // const {
        //     networkHubCoinList,
        //     setHubOracleProps,
        //     fetchHubDestinationFee,
        // } = useHubOracle({
        //     // no need to subscribe here, because already subscribed in useHubToken and useWeb3Withdraw
        // });
        const {tokenContractAddressFixNative: tokenContractAddress, tokenDecimals, hubCoin, tokenData, setHubTokenProps} = useHubToken();
        const {smartWalletAddress, setSmartWalletProps, buildTxForRelayReward, callSmartWallet} = useWeb3SmartWalletWithRelayReward();

        return {
            // networkHubCoinList,
            // setHubOracleProps,
            // fetchHubDestinationFee,

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
            return HUB_CHAIN_DATA[HUB_NETWORK.BSC];
        },
        tokenAddressFixed() {
            if (this.form.token === 'BNB') {
                return NATIVE_COIN_ADDRESS;
            }
            if (this.form.token.length === 42 && this.form.token.indexOf('0x') === 0) {
                return this.form.token;
            }
            return '';
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
                gasTokenAddress: this.form.token === 'BNB' ? NATIVE_COIN_ADDRESS : this.form.token,
                gasTokenDecimals: this.tokenDecimals,
                estimationSkip: true,
            }),
            (newVal) => this.setSmartWalletProps(newVal),
            {deep: true, immediate: true},
        );

        // hubOracleProps
        // this.$watch(
        //     () => ({
        //         hubNetworkSlug: this.hubChainData.hubNetworkSlug,
        //     }),
        //     (newVal) => this.setHubOracleProps(newVal),
        //     {deep: true, immediate: true},
        // );

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
