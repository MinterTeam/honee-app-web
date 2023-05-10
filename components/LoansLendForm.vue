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
import {HUB_NETWORK_SLUG, HUB_CHAIN_DATA, LOANS_BSC_CONTRACT_ADDRESS_LIST} from '~/assets/variables.js';
import loansABI from '~/assets/abi/loans.json';
import {LOAN_MIN_AMOUNT, LEND_COIN} from '~/api/web3-loans.js';
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
        collateralCoin: {
            type: String,
            required: true,
        },
    },
    fetch() {
        if (!this.loansContractAddress) {
            return this.$nuxt.error({
                status: 404,
                message: this.$td('Invalid collateral coin', 'todo'),
                useMessage: true,
            });
        }
    },
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
        loansContractAddress() {
            return LOANS_BSC_CONTRACT_ADDRESS_LIST[this.collateralCoin];
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
                    to: this.loansContractAddress,
                    data: AbiMethodEncoder(loansABI)('lendBNB'),
                    value: amountToLendWei,
                };
                lendTxList = [tx];
            } else {
                const tx = {
                    to: this.loansContractAddress,
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
        :coin-label="$td('You lend', 'todo')"
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

        <template v-slot:form-end>
            <div class="form-row u-text-medium u-text-muted">
                <ul class="list-simple">
                    <template v-if="$i18n.locale === 'en'">
                        <li>You can send BNB and wait for someone to&nbsp;borrow it.</li>
                        <li>Unused BNB can be withdrawn at any time.</li>
                        <li>The interest is 12% per annum. 1% is charged once the borrower receives BNB and then continues to charge every 30th day.</li>
                        <li>Please read the <a class="link--underline" href="https://honee.app/lending-and-borrowing-crypto" target="_blank">full terms</a></li>
                    </template>
                    <template v-if="$i18n.locale === 'ru'">
                        <li>Вы можете отправить BNB и дождаться, пока кто-нибудь возьмет их взаймы.</li>
                        <li>Неиспользованные BNB можно вывести в любое время.</li>
                        <li>Процентная ставка составляет 12% годовых. 1% взимается, как только заемщик получает BNB, а затем продолжает взиматься каждый 30-й день.</li>
                        <li>Please read the <a class="link--underline" href="https://honee.app/ru/lending-and-borrowing-crypto" target="_blank">full terms</a></li>
                    </template>
                </ul>
            </div>
        </template>
    </TxSequenceWeb3Withdraw>
</template>
