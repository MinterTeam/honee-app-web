<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import Big from 'minterjs-util/src/big.js';
import {getTokenSymbolForNetwork} from '~/api/hub.js';
import {pretty} from '~/assets/utils.js';
import {wait} from '@shrpne/utils/src/wait.js';
import {HUB_NETWORK, HUB_CHAIN_DATA, HUB_WITHDRAW_SPEED} from '~/assets/variables.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3SmartWalletSwapWithdraw from '~/composables/use-web3-smartwallet-swap-withdraw.js';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
import TxSequenceWithSwapForm from '~/components/base/TxSequenceWithSwapForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import SwapPriceImpact from '~/components/SwapPriceImpact.vue';


export default {
    components: {
        TxSequenceWithSwapForm,
        BaseAmountEstimation,
        FieldCombined,
        SwapPriceImpact,
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
        const {
            networkHubCoinList,
            setHubOracleProps,
            fetchHubDestinationFee,
        } = useHubOracle({
            // no need to subscribe here, because already subscribed in useHubToken and useWeb3Withdraw
        });
        const {hubCoin: coinItem, tokenPrice: coinPrice, tokenData: externalToken, setHubTokenProps} = useHubToken();
        const {
            discountUpsidePercent,
            destinationFeeInCoin,
            hubFeeRate,
            hubFeeRatePercent,
            hubFee,
            withdrawAmountToReceive,
            minAmountToWithdraw,
            withdrawTxParams,
            withdrawFeeTxParams,

            amountEstimationLimitForRelayReward: smartWalletRelayReward,
            amountToSellForSwapToHub,
            amountEstimationAfterSwapToHub: depositAmountToReceive,
            isSmartWalletSwapParamsLoading,
            smartWalletSwapParamsError,
            smartWalletAddress,
            buildTxListAndCallSmartWallet,
            setSmartWalletSwapWithdrawProps,
        } = useWeb3SmartWalletSwapWithdraw();

        return {
            networkHubCoinList,
            setHubOracleProps,
            fetchHubDestinationFee,

            coinItem,
            coinPrice,
            externalToken,
            setHubTokenProps,

            discountUpsidePercent,
            destinationFeeInCoin,
            hubFeeRate,
            hubFeeRatePercent,
            hubFee,
            withdrawAmountToReceive,
            minAmountToWithdraw,
            withdrawTxParams,
            withdrawFeeTxParams,

            smartWalletRelayReward,
            amountToSellForSwapToHub,
            depositAmountToReceive,
            isSmartWalletSwapParamsLoading,
            smartWalletSwapParamsError,
            smartWalletAddress,
            // oneInchSwapParams,
            // smartWalletTxParams,
            setSmartWalletSwapWithdrawProps,
            buildTxListAndCallSmartWallet,
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
            fee: {},
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
                minValue: (value) => minValue(this.minAmountToWithdraw)(value),
                // maxValue: maxValue(this.maxAmount || 0),
            },
            depositAmountToReceive: {
                required,
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
        externalNativeCoinSymbol() {
            return getTokenSymbolForNetwork(this.externalTokenMainnetSymbol);
        },
        isSelectedWithdrawCoin() {
            return this.suggestionList.includes(this.form.coinToSell);
        },
        withdrawCoin() {
            return this.isSelectedWithdrawCoin ? this.form.coinToSell : this.externalNativeCoinSymbol;
        },
        withdrawValue() {
            return this.isSelectedWithdrawCoin ? this.form.valueToSell : this.estimation;
        },
        sequenceParams() {
            const isWithdrawMaxWithoutSwap = this.isSelectedWithdrawCoin && this.isUseMax;
            const isWithdrawAfterSwap = !this.isSelectedWithdrawCoin;
            const prepareWithdrawTxParams = !isWithdrawMaxWithoutSwap && !isWithdrawAfterSwap ? undefined : (swapTx, prevPrepareGasCoin) => {
                let balanceItem;
                if (isWithdrawMaxWithoutSwap) {
                    balanceItem = this.$store.getters.getBalanceItem(this.form.coinToSell);
                } else {
                    const coinToBuy = swapTx.data.coin_to_buy || swapTx.data.coins.find((item) => item.id === swapTx.tags['tx.coin_to_buy']);
                    // @TODO if user had some coinToBuy on balance, it's better to deduct fee from old balance, than from swapTx.returnAmount
                    balanceItem = {
                        coin: coinToBuy,
                        amount: swapTx.returnAmount,
                    };
                }

                const value = getAvailableSelectedBalance(balanceItem, prevPrepareGasCoin.extra.fee);
                console.debug('getAvailableSelectedBalance', JSON.parse(JSON.stringify(balanceItem)), JSON.parse(JSON.stringify(prevPrepareGasCoin.extra.fee)));
                console.debug('value: prev, new', this.withdrawTxParams.data.value, value);
                console.debug('withdrawValue, withdrawAmountToReceive', this.withdrawValue, this.withdrawAmountToReceive);

                // update withdrawValue
                if (isWithdrawMaxWithoutSwap) {
                    this.form.valueToSell = value;
                } else if (isWithdrawAfterSwap) {
                    this.estimation = value;
                }

                return {
                    data: {
                        value,
                    },
                };
            };

            const prepareSmartWalletTx = () => {
                // wait for computed depended on withdrawValue to recalculate
                return wait(50)
                    .then(() => this.buildTxListAndCallSmartWallet())
                    .then((result) => {
                        const newPayload = JSON.parse(this.withdrawTxParams.payload);
                        newPayload.smartWalletTx = result.hash;

                        return {
                            payload: JSON.stringify(newPayload),
                        };
                    });
            };

            return [
                {
                    // refineFee is not needed if no 'prepare'
                    prepareGasCoinPosition: prepareWithdrawTxParams ? 'start' : 'skip',
                    prepare: [prepareWithdrawTxParams, prepareSmartWalletTx],
                    txParams: this.withdrawTxParams,
                    feeTxParams: this.withdrawFeeTxParams,
                },
            ];
        },
        suggestionList() {
            return this.networkHubCoinList
                // show only available coins for selected network
                .map((item) => item.symbol);
        },
    },
    watch: {
    },
    created() {
        // smartWalletSwapProps
        this.$watch(
            () => ({
                privateKey: this.$store.getters.privateKey,
                evmAccountAddress: this.$store.getters.evmAddress,
                depositDestinationAddress: this.$store.getters.evmAddress,
                chainId: this.hubChainData.chainId,
                valueToSell: this.withdrawValue,
                coinToSell: this.withdrawCoin,
                coinToBuy: this.form.coinToBuy,
                idPreventConcurrency: 'estimateSwsSwap',
            }),
            (newVal) => this.setSmartWalletSwapWithdrawProps(newVal),
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
            @update:fee="fee = $event"
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
                    <span class="form-field__error" v-else-if="$v.withdrawValue.$dirty && !$v.withdrawValue.minValue">{{ $td('Minimum', 'form.amount-error-min') }} {{ minAmountToWithdraw }}</span>
                </div>

                <div class="form-row">
                    <FieldCombined
                        class="u-mb-10"
                        :coin.sync="form.coinToBuy"
                        :$coin="v$estimation.coinToBuy"
                        :coin-list="suggestionList"
                        :amount="depositAmountToReceive"
                        :$amount="v$estimation.valueToBuy"
                        :label="$td('You receive', 'form.swap-buy-coin')"
                        :is-estimation="true"
                        :is-loading="!v$estimation.isEstimationWaiting.finished || isSmartWalletSwapParamsLoading"
                        @input-native="isSelling = false"
                        @blur="/*$refs.estimation.handleInputBlur()*/"
                    />

                    <span class="form-field__error" v-if="v$estimation.coinToBuy.$dirty && !v$estimation.coinToBuy.required">{{ $td('Enter coin', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-else-if="v$estimation.valueToBuy.$dirty && !v$estimation.valueToBuy.required">{{ $td('Enter amount', 'form.amount-error-required') }}</span>
                    <span class="form-field__error" v-else-if="v$estimation.valueToBuy.$dirty && !v$estimation.valueToBuy.validAmount">{{ $td('Wrong amount', 'form.number-invalid') }}</span>
                    <span class="form-field__error" v-else-if="smartWalletSwapParamsError">{{ smartWalletSwapParamsError }}</span>
                </div>

                <div class="information form-row" v-if="form.coinToSell && form.coinToBuy && form.valueToSell">
                    <template v-if="!isSelectedWithdrawCoin">
                        <h3 class="information__title">Sell {{ form.coinToSell }} in Minter for</h3>
                        <BaseAmountEstimation
                            :coin="withdrawCoin"
                            :amount="estimation || 0"
                            :hide-usd="true"
                            :is-loading="!v$estimation.isEstimationWaiting.finished"
                            format="approx"
                        />
                    </template>

                    <h3 class="information__title">Amount to withdraw to BSC</h3>
                    <BaseAmountEstimation
                        :coin="withdrawCoin"
                        :amount="withdrawValue > 0 ? withdrawValue : 0"
                        :hide-usd="true"
                        :is-loading="!v$estimation.isEstimationWaiting.finished"
                        format="pretty"
                    />

                    <h3 class="information__title">Smart-wallet fee</h3>
                    <BaseAmountEstimation
                        :coin="withdrawCoin"
                        :amount="smartWalletRelayReward"
                        :hide-usd="true"
                        format="pretty"
                    />

                    <h3 class="information__title">Amount to sell in BSC</h3>
                    <BaseAmountEstimation
                        :coin="withdrawCoin"
                        :amount="amountToSellForSwapToHub"
                        :hide-usd="true"
                        :is-loading="!v$estimation.isEstimationWaiting.finished"
                        format="pretty"
                    />

                    <h3 class="information__title">Amount to receive in Minter</h3>
                    <BaseAmountEstimation
                        :coin="form.coinToBuy"
                        :amount="depositAmountToReceive || 0"
                        :hide-usd="true"
                        :is-loading="!v$estimation.isEstimationWaiting.finished || isSmartWalletSwapParamsLoading"
                        format="pretty"
                    />
                </div>

                <!--<SwapPriceImpact
                    class="form-row"
                    :coin-to-sell="form.coinToSell"
                    :value-to-sell="form.valueToSell"
                    :coin-to-buy="form.coinToBuy"
                    :value-to-buy="depositAmountToReceive"
                />-->
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

            <template v-slot:confirm-modal-body>
                <!--<div class="information form-row">-->
                <!--    -->
                <!--</div>-->

                <SwapPriceImpact
                    class="form-row"
                    :coin-to-sell="form.coinToSell"
                    :value-to-sell="form.valueToSell"
                    :coin-to-buy="form.coinToBuy"
                    :value-to-buy="depositAmountToReceive"
                />
            </template>
        </TxSequenceWithSwapForm>
    </div>
</template>
