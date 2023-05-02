<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import Big from 'minterjs-util/src/big.js';
import {toErcDecimals, AbiMethodEncoder, addApproveTx} from 'minter-js-web3-sdk/src/web3.js';
import {pretty} from '~/assets/utils.js';
import {HUB_NETWORK_SLUG, HUB_CHAIN_DATA} from '~/assets/variables.js';
import loansABI from '~/assets/abi/loans.json';
import {LOAN_MIN_AMOUNT, LEND_COIN, COLLATERAL_COIN, LOANS_CONTRACT_ADDRESS} from '~/api/web3-loans.js';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import TxSequenceWeb3Withdraw from '~/components/base/TxSequenceWeb3Withdraw.vue';


export default {
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
    data() {
        return {
            innerData: {},
        };
    },
    validations() {
        return {
            //@TODO display error
            amountToLend: {
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
        amountToLend() {
            // invalid reward so can't calculate part to use for swapToHub
            if (!this.innerData.smartWalletRelayReward || this.innerData.smartWalletRelayReward <= 0) {
                return 0;
            }
            return new Big(this.innerData.withdrawAmountToReceive).minus(this.innerData.smartWalletRelayReward).toString();
        },
    },
    methods: {
        pretty,
        async buildTxList() {
            const amountToLendWei = toErcDecimals(this.amountToLend, this.innerData.tokenDecimals);

            let lendTxList;
            if (this.innerData.isNativeToken && !this.innerData.isWrappedNativeToken) {
                const tx = {
                    to: LOANS_CONTRACT_ADDRESS,
                    data: AbiMethodEncoder(loansABI)('lendBNB'),
                    value: amountToLendWei,
                };
                lendTxList = [tx];
            } else {
                const tx = {
                    to: LOANS_CONTRACT_ADDRESS,
                    data: AbiMethodEncoder(loansABI)('lend', amountToLendWei),
                    value: '0x00',
                };
                lendTxList = await addApproveTx(this.innerData.tokenContractAddress, amountToLendWei, tx);
            }
            return lendTxList;
        },
    },
};

</script>

<template>
    <TxSequenceWeb3Withdraw
        :hub-network-slug="hubChainData.hubNetworkSlug"
        :coin="$options.LEND_COIN"
        :coin-label="$td('Amount to lend', 'form.amount')"
        :complexity="0"
        :build-tx-list="buildTxList"
        :v$extra="$v"
        @update:web3-data="innerData = $event"
        @success="$emit('success')"
        @success-modal-close="$emit('success-modal-close')"
    >
        <template v-slot:information>
            <h3 class="information__title">Amount to lend</h3>
            <BaseAmountEstimation
                :coin="$options.LEND_COIN"
                :amount="amountToLend"
                :hide-usd="true"
                :is-loading="innerData.isEstimationLimitForRelayRewardsLoading"
                format="pretty"
            />
        </template>
    </TxSequenceWeb3Withdraw>
</template>
