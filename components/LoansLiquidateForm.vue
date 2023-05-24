<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import Big from 'minterjs-util/src/big.js';
import {AbiMethodEncoder, buildDepositWithApproveTxList} from 'minter-js-web3-sdk/src/web3.js';
import {LEND_COIN, getLoan} from '~/api/web3-loans.js';
import {pretty} from '~/assets/utils.js';
import {HUB_NETWORK_SLUG, HUB_CHAIN_DATA, NATIVE_COIN_ADDRESS, LOANS_BSC_CONTRACT_ADDRESS_LIST} from '~/assets/variables.js';
import loansABI from '~/assets/abi/loans.json';
import useHubToken from '~/composables/use-hub-token.js';
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
    setup() {
        const {
            tokenContractAddressFixNative: collateralTokenContractAddress,
            tokenDecimals: collateralTokenDecimals,
            isNativeToken: collateralIsNativeToken,
            isWrappedNativeToken: collateralIsWrappedNativeToken,
            /*hubCoin, tokenData,*/
            setHubTokenProps,
        } = useHubToken();

        return {
            collateralTokenContractAddress,
            collateralTokenDecimals,
            collateralIsNativeToken,
            collateralIsWrappedNativeToken,
            setHubTokenProps,
        };
    },
    fetch() {
        if (!this.id && this.id !== 0) {
            return this.$nuxt.error({
                status: 404,
                message: this.$td('Loan ID is required', 'todo'),
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
        return this.fetchLoan()
            .then(() => {
                if (this.loan.closed) {
                    this.$nuxt.error({
                        status: 400,
                        message: this.$td('Loan is closed, it is repaid or already liquidated', 'todo'),
                        useMessage: true,
                    });
                }
                if (!this.loan.mayBeLiquidated) {
                    this.$nuxt.error({
                        status: 400,
                        message: this.$td('Loan can\'t be liquidated', 'todo'),
                        useMessage: true,
                    });
                }
                if (this.loan.lender !== this.$store.getters.smartWalletAddress) {
                    this.$nuxt.error({
                        status: 400,
                        message: this.$td('You can\'t liquidate another\'s lend', 'todo'),
                        useMessage: true,
                    });
                }
            })
            .catch((error) => {
                if (error.message.includes('execution reverted')) {
                    this.$nuxt.error({
                        status: 400,
                        message: this.$td('Can\'t get loan info', 'todo'),
                        useMessage: true,
                    });
                } else {
                    this.$nuxt.error(error);
                }
            });
    },

    data() {
        return {
            /** @type {MinterLoansLoan} */
            loan: undefined,
            innerData: {},
        };
    },
    validations() {
        // @TODO validate all here and check later
        return {
            loan: {
                closed: {
                    required,
                    valid: (val) => !val,
                },
                mayBeLiquidated: {
                    required,
                    valid: (val) => val,
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
    created() {
        // hubTokenProps
        this.$watch(
            () => ({
                chainId: this.hubChainData.chainId,
                tokenSymbol: this.collateralCoin,
            }),
            (newVal) => this.setHubTokenProps(newVal),
            {deep: true, immediate: true},
        );
    },
    methods: {
        pretty,
        fetchLoan() {
            return getLoan(this.collateralCoin, this.id)
                .then((loan) => {
                    this.loan = Object.freeze(loan);
                });
        },
        async buildTxList() {
            await this.fetchLoan();
            await this.$nextTick();
            if (this.$v.$invalid) {
                throw new Error('Invalid loan info');
            }

            const tx = {
                to: this.loansContractAddress,
                data: AbiMethodEncoder(loansABI)('liquidate', this.id),
                value: '0x00',
            };
            const depositTxList = await buildDepositWithApproveTxList(
                this.hubChainData.chainId,
                this.collateralTokenContractAddress,
                this.collateralTokenDecimals,
                this.$store.getters.address,
                this.loan.collateralAmount,
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
            :coin-to-deposit="collateralCoin"
            :amount-to-deposit="loan.collateralAmount"
            :complexity="0"
            :build-tx-list="buildTxList"
            :v$extra="$v"
            @update:web3-data="innerData = $event"
            @success="$emit('success')"
            @success-modal-close="$emit('success-modal-close')"
        >
            <template v-slot:information>
                <h3 class="information__title">Deposit to forfeit</h3>
                <BaseAmountEstimation
                    :coin="$options.LEND_COIN"
                    :amount="loan.borrowedAmount"
                    format="pretty"
                />

                <h3 class="information__title">Collateral to receive</h3>
                <BaseAmountEstimation
                    :coin="collateralCoin"
                    :amount="loan.collateralAmount"
                    format="pretty"
                />
            </template>
        </TxSequenceWeb3Withdraw>
    </div>
</template>
