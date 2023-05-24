<script>
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import maxLength from 'vuelidate/src/validators/maxLength';
import minValue from 'vuelidate/src/validators/minValue.js';
import maxValue from 'vuelidate/src/validators/maxValue.js';
import {wait} from '@shrpne/utils/src/wait.js';
import Big from 'minterjs-util/src/big.js';
import { createReusableTemplate } from '@vueuse/core';
import useWeb3SmartWalletWithRelayReward from 'minter-js-web3-sdk/src/composables/use-web3-smartwallet-relay-reward.js';
import {pretty} from '~/assets/utils.js';
import {isValidAmount} from '~/assets/utils/validators.js';
import {HUB_NETWORK_SLUG, HUB_CHAIN_DATA, NATIVE_COIN_ADDRESS, HUB_BUY_STAGE as LOADING_STAGE} from '~/assets/variables.js';
import useTxService from '~/composables/use-tx-service.js';
import {addStepDataBridgeWithdraw, addStepDataBridgeDeposit, addStepDataRelay} from '~/composables/use-tx-minter-presets.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3Withdraw from '~/composables/use-web3-withdraw.js';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import TxSequenceForm from '~/components/base/TxSequenceForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';

const [DefineTemplate, ReuseTemplate] = createReusableTemplate();


export default {
    components: {
        DefineTemplate, ReuseTemplate,
        BaseAmountEstimation,
        FieldCombined,
        TxSequenceForm,
    },
    mixins: [validationMixin],
    emits: [
        'update:web3-data',
        'success',
        'success-modal-close',
        'validation-touch',
        // 'override-stats-value',
    ],
    props: {
        hubNetworkSlug: {
            type: String,
            required: true,
        },
        coin: {
            type: String,
            required: true,
        },
        coinLabel: {
            type: String,
            default: '',
        },
        amount: {
            type: [Number, String],
            default: undefined,
        },
        coinToDeposit: {
            type: String,
        },
        amountToDeposit: {
            type: [Number, String],
        },
        complexity: {
            type: Number,
            default: 1,
        },
        buildTxList: {
            type: Function,
            required: true,
        },
        v$extra: {
            type: Object,
            validator(value) {
                // it should be vuelidate object
                return typeof value.$error === 'boolean' &&
                    typeof value.$dirty === 'boolean' &&
                    typeof value.$invalid === 'boolean' &&
                    typeof value.$model === 'object' &&
                    typeof value.$params === 'object';
            },
        },
    },
    setup() {
        const {addStepData} = useTxService();

        // const {networkGasPrice, setHubOracleProps} = useHubOracle({
        //     subscribePriceList: true,
        // });
        const {tokenContractAddressFixNative: tokenContractAddress, tokenDecimals, isNativeToken, isWrappedNativeToken, hubCoin, tokenData, setHubTokenProps} = useHubToken();
        const {
            smartWalletAddress,
            isEstimationLimitForRelayRewardsLoading,
            estimationLimitForRelayRewardsError,
            amountEstimationLimitForRelayReward: smartWalletRelayReward,
            setSmartWalletProps,
            buildTxForRelayReward,
            callSmartWallet,
        } = useWeb3SmartWalletWithRelayReward();

        const {
            discountUpsidePercent,
            destinationFeeInCoin,
            hubFeeRate,
            hubFeeRatePercent,
            hubFee,
            amountToReceive: withdrawAmountToReceive,
            minAmountToSend: minAmountToWithdraw,
            txParams: withdrawTxParams,
            feeTxParams: withdrawFeeTxParams,
            setWithdrawProps,
            calculateAmountToSend,
        } = useWeb3Withdraw();

        return {
            addStepData,

            // networkGasPrice,
            // setHubOracleProps,
            //
            tokenContractAddress,
            tokenDecimals,
            isNativeToken,
            isWrappedNativeToken,
            setHubTokenProps,
            hubCoin, tokenData,


            smartWalletAddress,
            isEstimationLimitForRelayRewardsLoading,
            estimationLimitForRelayRewardsError,
            smartWalletRelayReward,
            setSmartWalletProps,
            buildTxForRelayReward,
            callSmartWallet,

            // withdraw
            discountUpsidePercent,
            destinationFeeInCoin,
            hubFeeRate,
            hubFeeRatePercent,
            hubFee,
            withdrawAmountToReceive,
            minAmountToWithdraw,
            withdrawTxParams,
            withdrawFeeTxParams,
            setWithdrawProps,
            calculateAmountToSend,
        };
    },
    data() {
        return {
            form: {
                amount: '',
            },
            isUseMax: false,
            fee: {},
            collateralPrice: 0,
        };
    },
    validations() {
        return {
            form: {
                amount: {
                    required,
                    validAmount: isValidAmount,
                    // maxValue: maxValue(this.maxAmount || 0),
                    minValue: (value) => value > 0,
                    // enoughToPayFee: (value) => value >= this.evmTotalFee,
                },
            },
            withdrawAmountToReceive: {
                required,
                minValue: (val) => minValue(this.smartWalletRelayReward)(val),
            },
            parent: {
                valid: () => !this.v$extra?.$invalid,
            },
        };
    },
    computed: {
        /** @type {HubChainDataItem} */
        hubChainData() {
            return HUB_CHAIN_DATA[this.hubNetworkSlug];
        },
        isTokenDecimalsFetched() {
            return this.tokenDecimals > 0;
        },
        isStaticAmount() {
            return typeof this.amount !== 'undefined';
        },
        minterBalance() {
            return this.$store.getters.getBalanceAmount(this.coin);
        },
        amountToSendForRelayReward() {
            return this.calculateAmountToSend(this.smartWalletRelayReward, true);
        },
        withdrawValue() {
            return this.form.amount;
            // return this.isSelectedWithdrawCoin ? this.form.amount : this.estimation;
        },
        sequenceParams() {
            let withdrawValue = this.withdrawValue;
            let smartWalletTx;

            const isWithdrawMaxWithoutSwap = this.isUseMax; // this.isSelectedWithdrawCoin && this.isUseMax;
            const isWithdrawAfterSwap = false; //!this.isSelectedWithdrawCoin;
            const prepareWithdrawTxParams = !isWithdrawMaxWithoutSwap && !isWithdrawAfterSwap ? undefined : (swapTx, prevPrepareGasCoin) => {
                let balanceItem;
                if (isWithdrawMaxWithoutSwap) {
                    balanceItem = this.$store.getters.getBalanceItem(this.coin);
                } else {
                    // const coinToBuy = swapTx.data.coin_to_buy || swapTx.data.coins.find((item) => item.id === swapTx.tags['tx.coin_to_buy']);
                    // // @TODO if user had some coinToBuy on balance, it's better to deduct fee from old balance, than from swapTx.returnAmount
                    // balanceItem = {
                    //     coin: coinToBuy,
                    //     amount: swapTx.returnAmount,
                    // };
                }

                const value = getAvailableSelectedBalance(balanceItem, prevPrepareGasCoin.extra.fee);
                console.debug('getAvailableSelectedBalance', JSON.parse(JSON.stringify(balanceItem)), JSON.parse(JSON.stringify(prevPrepareGasCoin.extra.fee)));
                console.debug('value: prev, new', this.withdrawTxParams.data.value, value);
                console.debug('withdrawValue, withdrawAmountToReceive', this.withdrawValue, this.withdrawAmountToReceive);

                // update withdrawValue
                if (isWithdrawMaxWithoutSwap) {
                    this.form.amount = value;
                } else if (isWithdrawAfterSwap) {
                    this.estimation = value;
                }
                withdrawValue = value;

                return {
                    data: {
                        value,
                    },
                };
            };

            const prepareWithdrawStepData = () => {
                addStepDataBridgeWithdraw(this.hubChainData.chainId, undefined, this.coin, withdrawValue, 1);
            };

            const prepareSmartWalletTx = () => {
                // wait for computed depended on withdrawValue to recalculate
                return wait(50)
                    .then(() => this.buildTxListAndCallSmartWallet())
                    .then((result) => {
                        smartWalletTx = result.hash;

                        const newPayload = JSON.parse(this.withdrawTxParams.payload);
                        newPayload.smartWalletTx = result.hash;

                        return {
                            payload: JSON.stringify(newPayload),
                        };
                    });
            };

            const withdrawAmountToReceive = this.withdrawAmountToReceive;
            const amountToDeposit = this.amountToDeposit;
            /** @type {SendSequenceItem['finalize']}*/
            const finalizeWithdraw = (minterTx) => {
                // @TODO properly cancel waiting, otherwise it may leak to smart-wallet topup (stepList is shared)
                minterTx.extra = minterTx.extra || {};

                let [promise, withdrawCanceler] = addStepDataBridgeWithdraw(this.hubChainData.chainId, minterTx.hash, this.coin, withdrawValue, 1);
                let relayCanceler;
                let depositCanceler;
                promise = promise
                    .then(() => {
                        this.addStepData(LOADING_STAGE.SEND_TO_RELAY, {
                            coin: this.coin,
                            amount: withdrawAmountToReceive,
                            relayParams: {
                                hubNetworkSlug: this.hubChainData.hubNetworkSlug,
                            },
                        }, true);

                        const [relayPromise, _relayCanceler] = addStepDataRelay(this.hubChainData.chainId, smartWalletTx);
                        relayCanceler = _relayCanceler;
                        return relayPromise;
                    })
                    .then((result) => {
                        if (this.coinToDeposit) {
                            const [depositPromise, _depositCanceler] = addStepDataBridgeDeposit(this.hubChainData.chainId, result.txHash, this.coinToDeposit, amountToDeposit, this.$store.getters.address, 2);
                            depositCanceler = _depositCanceler;
                            return depositPromise;
                        }
                    });

                minterTx.extra.waitBridgePromise = promise;
                minterTx.extra.waitBridgeCancel = function() {
                    withdrawCanceler();
                    relayCanceler?.();
                    depositCanceler?.();
                };

                return minterTx;
            };

            return [
                /** @type {SendSequenceItem} */
                {
                    // refineFee is not needed if no 'prepare'
                    prepareGasCoinPosition: prepareWithdrawTxParams ? 'start' : 'skip',
                    prepare: [prepareWithdrawTxParams, prepareWithdrawStepData, prepareSmartWalletTx],
                    finalize: finalizeWithdraw,
                    txParams: this.withdrawTxParams,
                    feeTxParams: this.withdrawFeeTxParams,
                    skipAddStepData: true,
                },
            ];
        },
    },
    watch: {
        amount: {
            handler(newVal) {
                this.form.amount = newVal;
                if (newVal) {
                    this.$v.form.amount.$touch();
                }
            },
        },
    },
    created() {
        // smartWalletProps
        this.$watch(
            () => ({
                privateKey: this.$store.getters.privateKey,
                evmAccountAddress: this.$store.getters.evmAddress,
                chainId: this.hubChainData.chainId,
                // gasPriceGwei: this.networkGasPrice,
                gasTokenAddress: this.tokenContractAddress,
                gasTokenDecimals: this.tokenDecimals,
                complexity: this.complexity,
                // estimationSkip: true,
            }),
            (newVal) => this.setSmartWalletProps(newVal),
            {deep: true, immediate: true},
        );

        // withdrawProps
        const dummySmartWalletTxHash = Array.from({length: 64}).fill('0').join('');
        this.$watch(
            () => ({
                hubNetworkSlug: this.hubChainData.hubNetworkSlug,
                amountToSend: this.form.amount,
                tokenSymbol: this.coin,
                accountAddress: this.$store.getters.address,
                destinationAddress: this.smartWalletAddress,
                // placeholder for minter tx payload
                smartWalletTx: dummySmartWalletTxHash,
            }),
            (newVal) => this.setWithdrawProps(newVal),
            {deep: true, immediate: true},
        );

        // hubOracleProps
        // this.$watch(
        //     () => ({
        //         hubNetworkSlug: this.hubChainData.hubNetworkSlug,
        //         fixInvalidGasPriceWithDummy: false,
        //     }),
        //     (newVal) => this.setHubOracleProps(newVal),
        //     {deep: true, immediate: true},
        // );

        // hubTokenProps
        this.$watch(
            () => ({
                chainId: this.hubChainData.chainId,
                tokenSymbol: this.coin,
            }),
            (newVal) => this.setHubTokenProps(newVal),
            {deep: true, immediate: true},
        );

        // emit shared data to parent
        this.$watch(
            () => ({
                // other
                amountToSendForRelayReward: this.amountToSendForRelayReward,
                // withdraw
                withdrawAmountToReceive: this.withdrawAmountToReceive,
                // sw
                smartWalletAddress: this.smartWalletAddress,
                smartWalletRelayReward: this.smartWalletRelayReward,
                isEstimationLimitForRelayRewardsLoading: this.isEstimationLimitForRelayRewardsLoading,
                // token
                tokenContractAddress: this.tokenContractAddress,
                tokenDecimals: this.tokenDecimals,
                isNativeToken: this.isNativeToken,
                isWrappedNativeToken: this.isWrappedNativeToken,
            }),
            (newVal) => {
                this.$emit('update:web3-data', newVal);
            },
            {deep: true, immediate: true},
        );
    },
    methods: {
        pretty,
        async buildTxListAndCallSmartWallet() {
            const relayRewardData = await this.buildTxForRelayReward();
            const amount = new Big(this.withdrawAmountToReceive).minus(relayRewardData.swapLimit).toString();
            if (amount < 0) {
                throw new Error('Not enough amount to pay tx fee');
            }

            const txList = await this.buildTxList();

            return this.callSmartWallet([].concat(relayRewardData.txList, txList));
        },
        clearForm() {
            this.form.amount = '';
            // this.$v.$reset();
        },
    },
};

</script>

<template>
    <div>
        <TxSequenceForm
            :sequence-params="sequenceParams"
            :v$sequence-params="$v"
            @update:fee="fee = $event"
            @clear-form="clearForm()"
            @validation-touch="v$extra.$touch(); $emit('validation-touch')"
            @success="$emit('success')"
            @success-modal-close="$emit('success-modal-close')"
        >
            <div class="form-row">
                <FieldCombined
                    :coin="coin"
                    :fallback-to-full-list="false"
                    :amount.sync="form.amount"
                    :$amount="$v.form.amount"
                    :useBalanceForMaxValue="true"
                    :fee="fee"
                    :isUseMax.sync="isUseMax"
                    :is-estimation="isStaticAmount"
                    :label="coinLabel || $td('Amount to spend', 'form.amount')"
                    @blur="/*handleInputBlur(); */$v.form.amount.$touch()"
                />
                <!--<span class="form-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">{{ $td('Enter amount', 'form.enter-amount') }}</span>-->
                <!--<span class="form-field__error" v-else-if="$v.form.amount.$dirty && (!$v.form.amount.validAmount || !$v.form.amount.minValue)">{{ $td('Invalid amount', 'form.invalid-amount') }}</span>-->
                <!--<span class="form-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.enoughToPayFee">{{ $td('Not enough to pay fee', 'form.not-enough-to-pay-fee') }}</span>-->
                <!--                        <span class="form-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.maxValue">{{ $td('Not enough', 'form.not-enough') }} {{ form.coinToGet }} ({{ $td('max.', 'form.max') }} {{ pretty(maxAmount) }})</span>-->
            </div>

            <DefineTemplate>
                <div class="information form-row" v-show="form.amount">
                    <h3 class="information__title">Amount after withdrawal to BSC</h3>
                    <BaseAmountEstimation
                        :coin="coin"
                        :amount="withdrawAmountToReceive"
                        :hide-usd="true"
                        format="pretty"
                    />

                    <h3 class="information__title">Smart-wallet fee</h3>
                    <BaseAmountEstimation
                        :coin="coin"
                        :amount="smartWalletRelayReward"
                        :hide-usd="true"
                        :is-loading="isEstimationLimitForRelayRewardsLoading"
                        format="pretty"
                    />

                    <slot name="information"/>
                </div>
            </DefineTemplate>

            <ReuseTemplate/>

            <slot name="form-end"/>

            <template v-slot:submit-title>
                {{ $td('Continue', 'common.continue') }}
            </template>

            <template v-slot:confirm-modal-body>
                <ReuseTemplate/>
            </template>

            <template v-slot:panel-footer>
                <slot name="panel-footer"/>
            </template>
        </TxSequenceForm>
    </div>
</template>
