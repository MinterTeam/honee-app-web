<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import autosize from 'v-autosize';
import {FEE_PRECISION_SETTING} from 'minter-js-sdk/src/api/estimate-tx-commission.js';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {convertToPip} from 'minterjs-util/src/converter.js';
import checkEmpty from '~/assets/v-check-empty.js';
import {getBlock} from '~/api/explorer.js';
import {pretty, getDateAmerican, getTimeDistance} from '~/assets/utils.js';
import {HUB_NETWORK, HUB_CHAIN_DATA, HUB_MINTER_MULTISIG_ADDRESS, HUB_WITHDRAW_SPEED, HUB_COIN_DATA, NETWORK, MAINNET} from '~/assets/variables.js';
import useFee from '~/composables/use-fee.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3Withdraw from '~/composables/use-web3-withdraw.js';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
import TxSequenceWithSwapForm from '~/components/base/TxSequenceWithSwapForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import FieldRange from '~/components/base/FieldRange.vue';


export default {
    TX_TYPE,
    components: {
        TxSequenceWithSwapForm,
        // BaseAmountEstimation,
        FieldCombined,
        // FieldRange,
    },
    directives: {
        checkEmpty,
        autosize,
    },
    mixins: [validationMixin],
    emits: [
        'success',
        'success-modal-close',
        'override-stats-value',
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
        const {fee, setFeeProps} = useFee();
        const {
            networkHubCoinList,
            setHubOracleProps,
            fetchHubDestinationFee,
        } = useHubOracle({
            // no need to subscribe here, because already subscribed in useHubToken and useWeb3Withdraw
        });
        const {hubCoin: coinItem, tokenPrice: coinPrice, tokenData: externalToken, setHubTokenProps} = useHubToken();
        const {discountUpsidePercent, destinationFeeInCoin: coinFee, hubFeeRate, hubFeeRatePercent, hubFee, amountToReceive, minAmountToSend: minAmount, txParams, feeTxParams, setWithdrawProps} = useWeb3Withdraw();

        return {
            fee,
            setFeeProps,

            networkHubCoinList,
            setHubOracleProps,
            fetchHubDestinationFee,

            coinItem,
            coinPrice,
            externalToken,
            setHubTokenProps,

            discountUpsidePercent,
            coinFee,
            hubFeeRate,
            hubFeeRatePercent,
            hubFee,
            amountToReceive,
            minAmount,
            txParams,
            feeTxParams,
            setWithdrawProps,
        };
    },
    data() {
        const coinList = this.$store.state.balance;
        let firstBalanceSymbol = coinList?.length ? coinList[0].coin.symbol : '';

        return {
            form: {
                coinToSell: this.params.coinToSell?.toUpperCase() || this.$route.query.coinToSell?.toUpperCase() || firstBalanceSymbol,
                coinToBuy: this.params.coinToBuy?.toUpperCase() || '',
                valueToSell: this.params.valueToSell || '',
                buyAmount: this.params.valueToBuy || '',
            },
            isSelling: true,
            isUseMax: false,
            estimation: 0,
            v$estimation: {
                coinToSell: {},
                coinToBuy: {},
                valueToSell: {},
                valueToBuy: {},
                estimationError: {},
                isEstimationWaiting: {},
            },
        };
    },
    validations() {
        return {
            form: {
                coinToSell: {
                    required,
                    minLength: minLength(3),
                    // supported: () => !!this.externalToken,
                },
            },
            withdrawValue: {
                required,
                // validAmount: isValidAmount,
                minValue: (value) => minValue(this.minAmount)(value),
                // maxValue: maxValue(this.maxAmount || 0),
            },
        };
    },
    computed: {
        /** @type {HubChainDataItem} */
        hubChainData() {
            return HUB_CHAIN_DATA[HUB_NETWORK.BSC];
        },
        externalTokenMainnetSymbol() {
            return this.hubChainData?.coinSymbol;
        },
        externalTokenSymbol() {
            return NETWORK === MAINNET ? this.externalTokenMainnetSymbol : HUB_COIN_DATA[this.externalTokenMainnetSymbol].testnetSymbol;
        },
        isSelectedWithdrawCoin() {
            return this.form.coinToSell === this.withdrawCoin;
        },
        withdrawCoin() {
            return this.externalTokenSymbol;
        },
        withdrawValue() {
            if (this.isSelectedWithdrawCoin) {
                return this.form.valueToSell;
            } else {
                return this.estimation;
            }
        },
        sequenceParams() {
            const prepareUseMaxCoin = this.isUseMax ? (dummyTx, prevPrepareGasCoin) => {
                const selectedBalanceItem = this.$store.getters.getBalanceItem(this.form.coinToSell);
                const value = getAvailableSelectedBalance(selectedBalanceItem, prevPrepareGasCoin.extra.fee);

                return {
                    data: {
                        value,
                    },
                };
            } : undefined;
            const prepareAfterSwap = (swapTx, prevPrepareGasCoin) => {
                const coinToBuy = swapTx.data.coin_to_buy || swapTx.data.coins.find((item) => item.id === swapTx.tags['tx.coin_to_buy']);
                // @TODO if user had some coinToBuy on balance, it's better to deduct fee from old balance, than from swapTx.returnAmount
                const value = getAvailableSelectedBalance({
                    coin: coinToBuy,
                    amount: swapTx.returnAmount,
                }, prevPrepareGasCoin.extra.fee);

                return {
                    data: {
                        value,
                    },
                };
            };
            const prepare = this.isSelectedWithdrawCoin ? prepareUseMaxCoin : prepareAfterSwap;
            return {
                // refineFee is not needed if no 'prepare'
                prepareGasCoinPosition: prepare ? 'start' : 'skip',
                prepare,
                txParams: this.txParams,
                feeTxParams: this.feeTxParams,
            };
        },
    },
    watch: {
    },
    created() {
        // withdrawProps
        this.$watch(
            () => ({
                hubNetworkSlug: this.hubChainData.hubNetworkSlug,
                amountToSend: this.withdrawValue,
                tokenSymbol: this.withdrawCoin,
                accountAddress: this.$store.getters.address,
                destinationAddress: this.$store.getters.evmAddress,
                speed: HUB_WITHDRAW_SPEED.FAST,
            }),
            (newVal) => this.setWithdrawProps(newVal),
            {deep: true, immediate: true},
        );

        // hubOracleProps
        this.$watch(
            () => ({
                hubNetworkSlug: this.hubChainData.hubNetworkSlug,
            }),
            (newVal) => this.setHubOracleProps(newVal),
            {deep: true, immediate: true},
        );

        // hubTokenProps
        this.$watch(
            () => ({
                chainId: this.hubChainData.chainId,
                tokenSymbol: this.withdrawCoin,
            }),
            (newVal) => this.setHubTokenProps(newVal),
            {deep: true, immediate: true},
        );

        // feeBusParams
        this.$watch(
            () => ({
                txParams: this.feeTxParams,
                baseCoinAmount: this.$store.getters.baseCoinAmount,
                fallbackToCoinToSpend: true,
                isOffline: !this.$store.state.onLine,
                precision: FEE_PRECISION_SETTING.PRECISE,
            }),
            (newVal) => this.setFeeProps(newVal),
            {deep: true, immediate: true},
        );
    },
    methods: {
        pretty,
        clearForm() {
            this.form.valueToSell = '';
            this.form.coinToSell = '';
            this.$v.$reset();
        },
    },
};

</script>

<template>
    <div>
<!--        <div class="u-mt-15" v-if="!stakingProgram && $fetchState.pending">{{ $td('Loading…', 'index.loading') }}</div>-->
<!--        <div class="u-mt-15" v-else-if="!stakingProgram && !$fetchState.pending">{{ $td('Can\'t load staking program', 'stake-by-lock.error-program-not-found') }}</div>-->
<!--        <div class="u-mt-15" v-else-if="!stakingProgram.isEnabled">{{ $td('Staking program disabled', 'stake-by-lock.error-program-disabled') }}</div>-->
<!--        <div class="u-mt-15" v-else-if="isProgramTimedOut">{{ $td('Staking program timed out', 'stake-by-lock.error-program-timeout') }}</div>-->
<!--        <div class="u-mt-15" v-else-if="maxValueToLock <= 0">{{ $td('Staking program exceed the limit', 'stake-by-lock.error-program-limit') }}</div>-->
        <TxSequenceWithSwapForm
            :coin-to-sell="form.coinToSell"
            :coin-to-buy="withdrawCoin"
            :value-to-sell="form.valueToSell"
            :is-use-max="isUseMax"
            :sequence-params="sequenceParams"
            :v$sequence-params="$v"
            @update:estimation="estimation = $event"
            @update:v$estimation="v$estimation = $event"
            @clear-form="clearForm()"
            @success="$emit('success')"
            @success-modal-close="$emit('success-modal-close')"
        >
            <template v-slot:default="{fee, estimation}">
                <div class="form-row">
                    <FieldCombined
                        :coin.sync="form.coinToSell"
                        :$coin="v$estimation.coinToSell"
                        :coinList="$store.state.balance"
                        :amount.sync="form.valueToSell"
                        :$amount="v$estimation.valueToSell"
                        :useBalanceForMaxValue="true"
                        :fee="fee"
                        :isUseMax.sync="isUseMax"
                        :label="$td('You pay', 'form.swap-sell-coin')"
                        @input-native="isSelling = true"
                        @use-max="isSelling = true"
                        @blur="/*$refs.estimation.handleInputBlur()*/"
                    />
                    <span class="form-field__error" v-if="v$estimation.coinToSell.$dirty && !v$estimation.coinToSell.required">{{ $td('Enter coin', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-else-if="v$estimation.coinToSell.$dirty && !v$estimation.coinToSell.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                    <span class="form-field__error" v-if="v$estimation.valueToSell.$dirty && !v$estimation.valueToSell.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                    <span class="form-field__error" v-else-if="v$estimation.valueToSell.$dirty && !v$estimation.valueToSell.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</span>
                    <span class="form-field__error" v-else-if="v$estimation.valueToSell.$dirty && v$estimation.maxAmount.$invalid">{{ $td('Not enough coins', 'form.not-enough-coins') }}</span>
                    <span class="form-field__error" v-else-if="v$estimation.valueToSell.$dirty && v$estimation.maxAmountAfterFee.$invalid">{{ $td('Not enough to pay transaction fee', 'form.fee-error-insufficient') }}: {{ pretty(fee.value) }} {{ fee.coinSymbol }}</span>
                    <span class="form-field__error" v-else-if="$v.withdrawValue.$dirty && !$v.withdrawValue.minValue">{{ $td(`Minimum ${minAmount}`, 'form.amount-error-min', {min: minAmount}) }}</span>
                </div>

                <div class="form-row">
                    <FieldCombined
                        class="u-mb-10"
                        :coin.sync="form.coinToBuy"
                        :$coin="v$estimation.coinToBuy"
                        :amount.sync="form.buyAmount"
                        :$amount="v$estimation.valueToBuy"
                        :label="$td('You receive', 'form.swap-buy-coin')"
                        @input-native="isSelling = false"
                        @blur="/*$refs.estimation.handleInputBlur()*/"
                    />

                    <span class="form-field__error" v-if="v$estimation.coinToBuy.$dirty && !v$estimation.coinToBuy.required">{{ $td('Enter coin', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-if="v$estimation.valueToBuy.$dirty && !v$estimation.valueToBuy.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                    <span class="form-field__error" v-else-if="v$estimation.valueToBuy.$dirty && !v$estimation.valueToBuy.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</span>
                </div>



            </template>

<!--            <template v-slot:submit-title>-->
<!--                {{ $td('Stake', `stake-by-lock.submit-button`) }}-->
<!--            </template>-->

            <template v-slot:confirm-modal-header>
                <h2 class="u-h3 u-mb-10">
                    <!--                <img class="panel__header-title-icon" :src="`${BASE_URL_PREFIX}/img/icon-delegate.svg`" alt="" role="presentation" width="40" height="40">-->
                    {{ action.title }}
                </h2>
            </template>

<!--            <template v-slot:confirm-modal-body>-->
<!--                <div class="information form-row">-->
<!--                    -->
<!--                </div>-->
<!--            </template>-->
        </TxSequenceWithSwapForm>
    </div>
</template>
