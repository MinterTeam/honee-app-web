<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import Big from 'minterjs-util/src/big.js';
import {AbiMethodEncoder} from 'minter-js-web3-sdk/src/web3-abi.js';
import {buildDepositWithApproveTxList} from 'minter-js-web3-sdk/src/web3.js';
import {LEND_COIN, getLend} from '~/api/web3-loans.js';
import {pretty} from '~/assets/utils.js';
import {HUB_NETWORK_SLUG, HUB_CHAIN_DATA, NATIVE_COIN_ADDRESS, LOANS_BSC_CONTRACT_ADDRESS_LIST} from '~/assets/variables.js';
import loansABI from '~/assets/abi/loans.json';
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
    props: {
        id: {
            type: [Number, String],
            required: true,
        },
        collateralCoin: {
            type: String,
            required: true,
        },
    },
    fetch() {
        if (!this.id && this.id !== 0) {
            return this.$nuxt.error({
                status: 404,
                message: this.$td('Lend ID is required', 'todo'),
                useMessage: true,
            });
        }
        if (!this.loansContractAddress) {
            return this.$nuxt.error({
                status: 404,
                message: this.$td('Invalid collateral coin', 'todo'),
                useMessage: true,
            });
        }
        return this.fetchLend()
            .then(() => {
                if (this.lend.dropped) {
                    this.$nuxt.error({
                        status: 400,
                        message: this.$td('Lend is dropped, it is fully consumed or already withdrawn', 'todo'),
                        useMessage: true,
                    });
                }
                if (this.lend.leftAmount <= 0) {
                    this.$nuxt.error({
                        status: 400,
                        message: this.$td('Lend\'s left amount is 0, nothing to withdraw', 'todo'),
                        useMessage: true,
                    });
                }
                if (this.lend.lender !== this.$store.getters.smartWalletAddress) {
                    this.$nuxt.error({
                        status: 400,
                        message: this.$td('You can\'t withdraw another\'s lend', 'todo'),
                        useMessage: true,
                    });
                }
            })
            .catch((error) => {
                if (error.message.includes('execution reverted')) {
                    this.$nuxt.error({
                        status: 400,
                        message: this.$td('Can\'t get lend info', 'todo'),
                        useMessage: true,
                    });
                } else {
                    this.$nuxt.error(error);
                }
            });
    },

    data() {
        return {
            /** @type {MinterLoansLend} */
            lend: undefined,
            innerData: {},
        };
    },
    validations() {
        return {
            lend: {
                dropped: {
                    required,
                    valid: (val) => !val,
                },
                leftAmount: {
                    required,
                    minValue: (val) => val > 0,
                },
                lender: {
                    valid: (val) => val === this.$store.getters.smartWalletAddress,
                },
            },
        };
    },
    computed: {
        /** @type {HubChainDataItem} */
        hubChainData() {
            return HUB_CHAIN_DATA[HUB_NETWORK_SLUG.BSC];
        },
        loansContractAddress() {
            return LOANS_BSC_CONTRACT_ADDRESS_LIST[this.collateralCoin];
        },
    },
    methods: {
        pretty,
        fetchLend() {
            return getLend(this.collateralCoin, this.id)
                .then((lend) => {
                    this.lend = Object.freeze(lend);
                });
        },
        async buildTxList() {
            const oldLeftAmount = this.lend.leftAmount;
            await this.fetchLend();
            await this.$nextTick();
            if (this.lend.leftAmount !== oldLeftAmount) {
                throw new Error('Lend info changed, check it and retry');
            }
            if (this.$v.$invalid) {
                throw new Error('Invalid lend info');
            }

            const tx = {
                to: this.loansContractAddress,
                data: AbiMethodEncoder(loansABI)('withdraw', this.id),
                value: '0x00',
            };
            const depositTxList = await buildDepositWithApproveTxList(
                this.hubChainData.chainId,
                this.innerData.isNativeToken ? undefined : this.innerData.tokenContractAddress,
                this.innerData.tokenDecimals,
                this.$store.getters.address,
                this.lend.leftAmount,
                this.innerData.smartWalletAddress,
            );
            return [].concat(tx, depositTxList);
        },
    },
};

</script>

<template>
    <div>
        <template v-if="$fetchState.pending">Loading…</template>
        <TxSequenceWeb3Withdraw
            v-else
            :hub-network-slug="hubChainData.hubNetworkSlug"
            :coin="$options.LEND_COIN"
            :coin-label="$td('Fee', 'todo')"
            :amount="innerData?.amountToSendForRelayReward"
            :coin-to-deposit="$options.LEND_COIN"
            :amount-to-deposit="lend.leftAmount"
            :complexity="0"
            :build-tx-list="buildTxList"
            :v$extra="$v"
            @update:web3-data="innerData = $event"
            @success="$emit('success')"
            @success-modal-close="$emit('success-modal-close')"
        >
            <template v-slot:information>
                <h3 class="information__title">Amount to receive</h3>
                <BaseAmountEstimation
                    :coin="$options.LEND_COIN"
                    :amount="lend.leftAmount"
                    :hide-usd="true"
                    format="pretty"
                />
            </template>
        </TxSequenceWeb3Withdraw>
    </div>
</template>
