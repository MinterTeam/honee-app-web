<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import Big from 'minterjs-util/src/big.js';
import {toErcDecimals, AbiMethodEncoder, addApproveTx, buildDepositWithApproveTxList} from 'minter-js-web3-sdk/src/web3.js';
import {LOAN_MIN_AMOUNT, LEND_COIN, COLLATERAL_COIN, LOANS_CONTRACT_ADDRESS, getCollateralPrice, COLLATERAL_RATE} from '~/api/web3-loans.js';
import {pretty} from '~/assets/utils.js';
import {HUB_NETWORK_SLUG, HUB_CHAIN_DATA, NATIVE_COIN_ADDRESS} from '~/assets/variables.js';
import loansABI from '~/assets/abi/loans.json';
import useHubToken from '~/composables/use-hub-token.js';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import TxSequenceWeb3Withdraw from '~/components/base/TxSequenceWeb3Withdraw.vue';


export default {
    COLLATERAL_COIN,
    LEND_COIN,
    components: {
        BaseAmountEstimation,
        TxSequenceWeb3Withdraw,
    },
    mixins: [validationMixin],
    emits: [
        'success',
        'success-modal-close',
        // 'override-stats-value',
    ],
    setup() {
        const {
            tokenContractAddressFixNative: lendTokenContractAddress,
            tokenDecimals: lendTokenDecimals,
            isNativeToken: lendIsNativeToken,
            isWrappedNativeToken: lendIsWrappedNativeToken,
            /*hubCoin, tokenData,*/
            setHubTokenProps,
        } = useHubToken();

        return {
            lendTokenContractAddress,
            lendTokenDecimals,
            lendIsNativeToken,
            lendIsWrappedNativeToken,
            setHubTokenProps,
        };
    },
    fetch() {
        return this.fetchCollateralPrice();
    },
    data() {
        return {
            collateralPrice: 0,
            innerData: {},
        };
    },
    validations() {
        return {
            //@TODO show this error
            amountToBorrow: {
                required,
                minValue: minValue(LOAN_MIN_AMOUNT),
            },
        };
    },
    computed: {
        /** @type {HubChainDataItem} */
        hubChainData() {
            return HUB_CHAIN_DATA[HUB_NETWORK_SLUG.BSC];
        },
        amountToPledge() {
            // invalid reward so can't calculate part to use for swapToHub
            if (!this.innerData.smartWalletRelayReward || this.innerData.smartWalletRelayReward <= 0) {
                return 0;
            }
            return new Big(this.innerData.withdrawAmountToReceive).minus(this.innerData.smartWalletRelayReward).toString();
        },
        amountToBorrow() {
            return new Big(this.amountToPledge).times(this.collateralPrice).div(COLLATERAL_RATE).toString();
        },
    },
    created() {
        // hubTokenProps
        this.$watch(
            () => ({
                chainId: this.hubChainData.chainId,
                tokenSymbol: LEND_COIN,
            }),
            (newVal) => this.setHubTokenProps(newVal),
            {deep: true, immediate: true},
        );
    },
    methods: {
        pretty,
        fetchCollateralPrice() {
            return getCollateralPrice()
                .then((price) => {
                    this.collateralPrice = price;
                });
        },
        async buildTxList() {
            await this.fetchCollateralPrice();
            await this.$nextTick();

            const amountToPledgeWei = toErcDecimals(this.amountToPledge, this.innerData.tokenDecimals);

            const tx = {
                to: LOANS_CONTRACT_ADDRESS,
                data: AbiMethodEncoder(loansABI)('borrow', amountToPledgeWei),
                value: '0x00',
            };
            const borrowTxList = await addApproveTx(this.innerData.tokenContractAddress, amountToPledgeWei, tx);
            const depositTxList = await buildDepositWithApproveTxList(
                this.hubChainData.chainId,
                this.lendIsNativeToken ? undefined : this.lendTokenContractAddress,
                this.lendTokenDecimals,
                this.$store.getters.address,
                this.amountToBorrow,
                this.innerData.smartWalletAddress,
            );
            return [].concat(borrowTxList, depositTxList);
        },
    },
};

</script>

<template>
    <TxSequenceWeb3Withdraw
        :hub-network-slug="hubChainData.hubNetworkSlug"
        :coin="$options.COLLATERAL_COIN"
        :coin-to-deposit="$options.LEND_COIN"
        :amount-to-deposit="amountToBorrow"
        :complexity="0"
        :build-tx-list="buildTxList"
        :v$extra="$v"
        @update:web3-data="innerData = $event"
        @success="$emit('success')"
        @success-modal-close="$emit('success-modal-close')"
    >
        <template v-slot:information>
            <h3 class="information__title">Amount to pledge</h3>
            <BaseAmountEstimation
                :coin="$options.COLLATERAL_COIN"
                :amount="amountToPledge"
                :hide-usd="true"
                :is-loading="innerData.isEstimationLimitForRelayRewardsLoading"
                format="pretty"
            />

            <h3 class="information__title">Amount to borrow</h3>
            <BaseAmountEstimation
                :coin="$options.LEND_COIN"
                :amount="amountToBorrow"
                :hide-usd="true"
                :is-loading="innerData.isEstimationLimitForRelayRewardsLoading"
                format="pretty"
            />
        </template>
    </TxSequenceWeb3Withdraw>
</template>
