<script>
import {getCurrentInstance} from 'vue';
import {validationMixin} from 'vuelidate/src/index.js';
import required from 'vuelidate/src/validators/required';
import minLength from 'vuelidate/src/validators/minLength';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {convertFromPip} from 'minterjs-util/src/converter.js';
import Big, {BIG_ROUND_DOWN} from '~/assets/big.js';
import {PREMIUM_STAKE_PROGRAM_ID, PREMIUM_STAKE_LOCK_DURATION, SUCCESS_FEE_TEAM_ADDRESS, SUCCESS_FEE_FUND_ADDRESS, HUB_CHAIN_DATA, HUB_NETWORK} from '~/assets/variables.js';
import {pretty} from '~/assets/utils.js';
import {wait} from '~/assets/utils/wait.js';
import {getBalance, getBlock} from '~/api/explorer.js';
import {postConsumerPortfolio} from '~/api/portfolio.js';
import usePortfolioWallet from '~/composables/use-portfolio-wallet.js';
import useWeb3SmartWalletPortfolioSell from '~/composables/use-web3-smartwallet-portfolio-sell.js';
import SwapEstimation from '~/components/base/SwapEstimation.vue';
import TxSequenceForm from '~/components/base/TxSequenceForm.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import PortfolioPriceImpact from '~/components/PortfolioPriceImpact.vue';
import {getAddressPremiumLevel} from '~/api/staking.js';


export default {
    TX_TYPE,
    components: {
        SwapEstimation,
        TxSequenceForm,
        BaseAmountEstimation,
        FieldCombined,
        PortfolioPriceImpact,
    },
    mixins: [validationMixin],
    emits: [
        'success',
        'success-modal-close',
        'override-stats-value',
    ],
    props: {
        /** @type {ConsumerPortfolio} */
        portfolio: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy;
        const {getWallet} = usePortfolioWallet(vm.$store.getters.mnemonic);
        const {
            minAmountToWithdrawList,
            withdrawTxParamsList,
            withdrawFeeTxParamsList,

            swsList,
            swsSelectedIndices,
            amountEstimationBeforeRelayRewardList,
            amountEstimationToReceiveAfterDepositList,
            setSmartWalletPortfolioSellProps,
        } = useWeb3SmartWalletPortfolioSell();

        return {
            portfolioWallet: getWallet(props.portfolio.id),

            minAmountToWithdrawList,
            withdrawTxParamsList,
            withdrawFeeTxParamsList,

            swsList,
            swsSelectedIndices,
            amountEstimationBeforeRelayRewardList,
            amountEstimationToReceiveAfterDepositList,
            setSmartWalletPortfolioSellProps,
        };
    },
    fetch() {
        const managerPremiumLevelPromise = getAddressPremiumLevel(this.portfolio.owner)
            .then((level) => {
                this.managerPremiumLevel = level;
            });

        const balancePromise =  getBalance(this.portfolioWallet.address)
            .then((result) => {
                this.balanceList = result.data.balances.filter((item) => item.amount > 0);
            });

        return Promise.all([managerPremiumLevelPromise, balancePromise]);
    },
    data() {
        return {
            managerPremiumLevel: 0,
            balanceList: [],
            form: {
                coin: this.$route.query.coin || '',
            },
            fee: {},
            estimationList: [],
            estimationTxDataList: [],
            v$estimationList: [],
            estimationFetchStateList: [],
            v$serviceFeeSwapEstimation: {},
            serviceFeeSwapEstimation: 0,
            serviceFeeSwapTxData: {},
            isSequenceProcessing: false,
        };
    },
    validations() {
        const form = {
            coin: {
                required,
                minLength: minLength(3),
            },
        };

        return {
            form,
            sequenceParams: {
                valid: (value) => value.some((item) => !item.skip),
            },
        };
    },
    computed: {
        /** @type {HubChainDataItem} */
        hubChainData() {
            return HUB_CHAIN_DATA[HUB_NETWORK.BSC];
        },
        coinList() {
            return this.balanceList
                // .filter((item) => item.coin.symbol.indexOf('LP-') !== 0)
                .map((item) => {
                    return {
                        amount: item.amount,
                        id: item.coin.id,
                        symbol: item.coin.symbol,
                    };
                });
        },
        withdrawCoinList() {
            return this.coinList
                .map((item, index) => {
                    return {
                        ...item,
                        amount: new Big(item.amount).minus(this.withdrawFeeDataList?.[index]?.value || 0).toString(),
                    };
                });
        },
        selectedIndices() {
            return Object.keys(this.coinList);
            // @TODO
            // eslint-disable-next-line no-unreachable
            return Object.keys(this.coinList)
                .filter((indexString) => !this.swsSelectedIndices.includes(indexString));
        },
        //@TODO subtract minter fee from withdraw amount
        /* not needed for sellAll
        // amount minus fee to properly calculate estimation and slippage
        valueToSwapList() {
            return this.coinList.map((item, index) => {
                const feeItem = this.fee.resultList?.[index];
                const feeValue = feeItem?.coinSymbol === item.symbol ? feeItem.value : 0;
                const value = new Big(item.amount).minus(feeValue).toString();
                return value < 0 ? 0 : value;
            });
        },
        */
        isEstimationFetchLoading() {
            return this.estimationFetchStateList.some((item) => item.loading);
        },
        estimationSum() {
            return this.estimationViewCategorised.enabled.reduce((accumulator, item) => {
                return accumulator.plus(item.amountToGet || 0);
            }, new Big(0)).toString();
        },
        estimationView() {
            return this.coinList.map((item, index) => {
                let result = {
                    coin: item.symbol,
                    // display amount to sell
                    amount: item.amount,
                    hideUsd: false,
                };
                const needSwap = this.checkNeedSwapEqual(item.symbol);
                if (!needSwap) {
                    return {
                        ...result,
                        amountToGet: item.amount,
                    };
                }
                const validFormInput = this.v$estimationList[index] && !this.v$estimationList[index].propsGroup.$invalid;

                if (!validFormInput) {
                    return {
                        ...result,
                        amountToGet: 0,
                    };
                }

                const isLoading = this.estimationFetchStateList[index]?.loading/* || this.fee.isLoading*/;
                const error = this.estimationFetchStateList[index]?.error;
                const enoughToPayFee = Number(this.estimationList[index]) > 0;
                /* fee automatically excluded in sellAll
                const enoughToPayFee = Number(item.amount) > Number(this.fee.resultList?.[index]?.value);
                */

                const minterEstimation = this.estimationList[index] || 0;
                // @TODO
                // const smartWalletEstimation = this.amountEstimationToReceiveAfterDepositList[index] || 0;
                const smartWalletEstimation = 0;
                const isSmartWalletSwapBetter = new Big(smartWalletEstimation).gt(minterEstimation);
                const finalEstimation = isSmartWalletSwapBetter ? smartWalletEstimation : minterEstimation;

                return {
                    ...result,
                    amountMinter: minterEstimation ?? '',
                    amountSmartWallet: smartWalletEstimation ?? '',
                    amountToGet: finalEstimation ?? '',
                    isSmartWalletSwapBetter,
                    /* loading indicator not needed for amountToSell (it's already known)
                    isLoading,
                     */
                    error,
                    disabled: !!error || (!isLoading && !enoughToPayFee),
                };
            });
        },
        estimationViewCategorised() {
            return {
                enabled: this.estimationView.filter((item) => !item.disabled),
                disabled: this.estimationView.filter((item) => item.disabled),
            };
        },
        estimationViewUsd() {
            return this.estimationView
                .filter((item) => !item.disabled && item.amountToGet > 0)
                .map((item) => {
                    return {
                        spendUsd: item.amount * this.$store.getters['portfolio/getCoinPrice'](item.coin),
                        resultUsd: item.amountToGet * this.$store.getters['portfolio/getCoinPrice'](this.form.coin),
                    };
                });
        },
        priceImpactUnavailable() {
            return this.estimationSum > 0 && !this.$store.getters['portfolio/getCoinPrice'](this.form.coin);
        },
        estimationPremiumFee() {
            return getPremiumFee(this.estimationSum);
        },
        estimationSuccessFee() {
            return getSuccessFee(this.estimationSum, this.portfolio.profit);
        },
        estimationServiceFee() {
            return new Big(this.estimationPremiumFee).plus(this.estimationSuccessFee).toString();
        },
        estimationAfterFee() {
            return this.estimationSum - this.estimationServiceFee;
        },
        isNeedSwapServiceFee() {
            return this.form.coin && this.form.coin !== 'BEE';
        },
        sequenceParams() {
            const coinToReturn = this.form.coin;
            const privateKey = this.portfolioWallet.privateKey;

            let swsExtraNonce = 0;
            // const swapReturnList = [];
            let swapTotalReturn = 0;
            let swapServiceFeeReturn = 0;
            // fee denominated in coinToReturn
            let premiumFeeInCoin = 0;
            let successFeeInCoin = 0;
            // fee in BEE to lock
            let premiumFeeAmount = 0;
            // total gas used for premium fee txs
            let premiumFeeTotalGas = 0;

            // if no minter swaps mean that address will be empty after sws withdrawals, so
            // - nothing to swap for serviceFee
            // - no coins to pay fee for send tx with type: sell payload
            // - no premiumFee to lock
            const hasMinterTxs = this.selectedIndices.length > 0;

            const swsSequence = this.coinList.map((coinItem, index) => {
                // ? maybe use swsSelectedIndices ?
                const isSwsBetter = this.estimationView[index]?.isSmartWalletSwapBetter;

                return {
                    // pass skip to not send tx in sequence
                    skip: !isSwsBetter,
                    txParams: {
                        ...this.withdrawTxParamsList[index],
                        gasCoin: coinItem.symbol,
                    },
                    feeTxParams: {
                        ...this.withdrawFeeTxParamsList[index],
                        gasCoin: coinItem.symbol,
                    },
                    privateKey,
                    prepareGasCoinPosition: 'start',
                    prepare: () => {
                        // wait for computed depended on withdrawFee and withdrawValue to recalculate
                        return wait(50)
                            .then(() => this.swsList[index].buildTxListAndCallSmartWallet({overrideExtraNonce: swsExtraNonce}))
                            .then((result) => {
                                swsExtraNonce += result.callCount;

                                const newPayload = JSON.parse(this.withdrawTxParamsList[index].payload);
                                newPayload.smartWalletTx = result.hash;

                                return {
                                    payload: JSON.stringify(newPayload),
                                    data: {
                                        value: this.withdrawTxParamsList[index].data.value,
                                    },
                                };
                            });
                    },
                    // @TODO extract swapReturn from receiveAfterDepositAmount (can try to extract part of it from minter swap result)
                    // finalize: (tx) => {
                    //     const swapReturn = convertFromPip(tx.tags['tx.return']);
                    //     // swapReturnList.push(swapReturn);
                    //     swapTotalReturn = new Big(swapTotalReturn).plus(swapReturn).toString();
                    //     return tx;
                    // },
                };
            });

            const swapSequence = this.coinList.map((coinItem, index) => {
                const coinSymbol = coinItem.symbol;
                const needSwap = this.checkNeedSwapEqual(coinSymbol);
                const estimationViewItem = this.estimationView[index];
                const skip = !needSwap || estimationViewItem?.disabled || estimationViewItem?.isSmartWalletSwapBetter;

                if (!needSwap) {
                    // swapReturnList.push(coinItem.amount);
                    swapTotalReturn = coinItem.amount;
                }

                return {
                    txParams: {
                        type: this.getEstimationRef(index)?.getTxType(),
                        data: this.estimationTxDataList[index],
                        gasCoin: coinSymbol,
                    },
                    feeTxParams: false,
                    /* no need to calculate fee for sellAll tx
                    feeTxParams: needSwap ? {
                        type: TX_TYPE.SELL_ALL_SWAP_POOL,
                        data: {
                            coins: [item.symbol, 1, 2, 3, 4],
                        },
                        gasCoin: item.symbol,
                    } : undefined,
                    */
                    privateKey,
                    // pass skip to not send tx in sequence
                    skip,
                    // prepareGasCoin not matter for sellAll tx
                    prepareGasCoinPosition: 'skip',
                    prepare: (swapTx) => {
                        return this.getEstimationRef(index)?.getEstimation(true, true)
                            .then(() => {
                                return {
                                    type: this.getEstimationRef(index)?.getTxType(),
                                    data: this.estimationTxDataList[index],
                                };
                            });
                    },
                    finalize: (tx) => {
                        const swapReturn = convertFromPip(tx.tags['tx.return']);
                        // swapReturnList.push(swapReturn);
                        swapTotalReturn = new Big(swapTotalReturn).plus(swapReturn).toString();
                        return tx;
                    },
                };
            });


            // SWAP SERVICE FEE TX
            const swapServiceFee = {
                skip: !this.isNeedSwapServiceFee || !hasMinterTxs,
                txParams: {
                    type: this.$refs.estimationServiceFee?.getTxType(),
                    data: this.serviceFeeSwapTxData,
                    gasCoin: coinToReturn,
                },
                feeTxParams: false,
                /* no need to calculate fee because NOT selling all (main part destined to receive after portfolio-selling should be enough to cover fee)
                feeTxParams: this.isNeedSwapServiceFee ? {
                    type: TX_TYPE.SELL_SWAP_POOL,
                    data: {
                        coins: [1, 2, 3, 4, 5],
                    },
                    gasCoin: coinToReturn,
                } : undefined,
                */
                privateKey,
                // prepareGasCoin position not matter because NOT selling all
                prepareGasCoinPosition: 'skip',
                prepare: (swapTx) => {
                    premiumFeeInCoin = getPremiumFee(swapTotalReturn);
                    successFeeInCoin = getSuccessFee(swapTotalReturn, this.portfolio.profit);
                    const valueToSell = new Big(premiumFeeInCoin).plus(successFeeInCoin).toString();
                    return this.$refs.estimationServiceFee?.getEstimation(true, true, {
                        valueToSell,
                    })
                        .then(() => {
                            return {
                                type: this.$refs.estimationServiceFee?.getTxType(),
                                data: {
                                    ...this.serviceFeeSwapTxData,
                                    valueToSell,
                                },
                            };
                        });
                },
                finalize: (tx) => {
                    swapServiceFeeReturn = convertFromPip(tx.tags['tx.return']);
                    const gasUsed = convertFromPip(tx.tags['tx.commission_amount']);
                    premiumFeeTotalGas = new Big(premiumFeeTotalGas).plus(gasUsed).toString();
                    return tx;
                },
            };


            const send = {
                skip: !hasMinterTxs,
                prepareGasCoinPosition: 'start',
                prepare: (swapTx, prevPrepareGasCoin) => {
                    premiumFeeAmount = this.isNeedSwapServiceFee ? restorePremiumFee(swapServiceFeeReturn, this.portfolio.profit) : premiumFeeInCoin;
                    const successFeeAmount = this.isNeedSwapServiceFee ? restoreSuccessFee(swapServiceFeeReturn, this.portfolio.profit) : successFeeInCoin;
                    const successFeeManagerPercent = this.managerPremiumLevel > 0 ? 25 : 0;
                    const successFeeFundPercent = this.managerPremiumLevel > 0 ? 50 : 75;
                    const successFeeManagerAmount = percent(successFeeAmount, successFeeManagerPercent);
                    const successFeeTeamAmount = percent(successFeeAmount, 25);
                    const successFeeFundAmount = percent(successFeeAmount, successFeeFundPercent);
                    // @TODO existing dust in balance not included here
                    const value = new Big(swapTotalReturn)
                        .minus(premiumFeeInCoin)
                        .minus(successFeeInCoin)
                        .minus(premiumFeeTotalGas)
                        .minus(prevPrepareGasCoin.extra.fee.value)
                        .toString();

                    console.log({value, swapTotalReturn, premiumFeeInCoin, successFeeInCoin, premiumFeeTotalGas, prepareGasValue: prevPrepareGasCoin.extra.fee.value});

                    return {
                        data: {
                            list: [
                                {
                                    to: this.$store.getters.address,
                                    value,
                                    coin: coinToReturn,
                                },
                                {
                                    to: this.$store.getters.address,
                                    value: premiumFeeAmount,
                                    coin: 'BEE',
                                },
                                ...this.getSuccessFeeDistribution(successFeeManagerAmount, successFeeTeamAmount, successFeeFundAmount),
                            ],
                        },
                    };
                },
                txParams: {
                    type: TX_TYPE.MULTISEND,
                    data: {
                        list: [
                            {
                                to: this.$store.getters.address,
                                // value from 'prepare'
                                value: 0,
                                coin: coinToReturn,
                            },
                            {
                                to: this.$store.getters.address,
                                value: 0,
                                coin: 'BEE',
                            },
                            ...this.getSuccessFeeDistribution(0, 0, 0),
                        ],
                    },
                    gasCoin: coinToReturn,
                    payload: JSON.stringify({
                        app: 'portfolio',
                        type: 'sell',
                        id: this.portfolio.id,
                    }),
                },
                privateKey,
            };

            // LOCK TX
            const lock = {
                skip: !hasMinterTxs,
                txParams: {
                    type: TX_TYPE.LOCK,
                    data: {
                        coin: 'BEE',
                        // value and dueBlock from 'prepare'
                        value: 0,
                        dueBlock: 1,
                    },
                    gasCoin: coinToReturn,
                    payload: JSON.stringify({lock_id: PREMIUM_STAKE_PROGRAM_ID}),
                },
                feeTxParams: false,
                // skip, because value to return after portfolio-selling should be enough to pay fee anyway (since fee is payed in coinToReturn)
                prepareGasCoinPosition: 'skip',
                prepare: async () => {
                    const block = await getBlock('latest');

                    return {
                        data: {
                            value: premiumFeeAmount,
                            dueBlock: block.height + PREMIUM_STAKE_LOCK_DURATION,
                        },
                    };
                },
                // ? not needed in lock
                // finalize: (tx) => {
                //     const gasUsed = convertFromPip(tx.tags['tx.commission_amount']);
                //     premiumFeeTotalGas = new Big(premiumFeeTotalGas).plus(gasUsed).toString();
                //     return tx;
                // },
            };

            return swsSequence.concat(swapSequence, swapServiceFee, send, lock);
        },
        withdrawFeeDataList() {
            return this.fee?.resultList?.slice(0, this.coinList.length) || [];
        },
    },
    watch: {
    },
    created() {
        // smartWalletPortfolioSellProps
        this.$watch(
            () => ({
                privateKey: this.$store.getters.privateKey,
                evmAccountAddress: this.$store.getters.evmAddress,
                withdrawOriginAddress: this.portfolioWallet.address,
                depositDestinationAddress: this.$store.getters.address,
                chainId: this.hubChainData.chainId,
                coinToSellList: this.withdrawCoinList,
                coinToBuy: this.form.coin,
                minterEstimationList: this.estimationList,
                // minterFeeToDeduct: this.withdrawFeeToDeduct,
                // isLocked: this.isSequenceProcessing && !this.isWithdrawProcessing,
            }),
            (newVal) => {
                // @TODO
                // eslint-disable-next-line no-constant-condition
                if (newVal.isLocked || true) {
                    this.setSmartWalletPortfolioSellProps({
                        // only update isLocked to reduce recalculations
                        isLocked: true,
                    });
                } else {
                    this.setSmartWalletPortfolioSellProps(newVal);
                }
            },
            {deep: true, immediate: true},
        );
    },
    methods: {
        pretty,
        getEstimationRef(index) {
            // $refs item in v-for is an array
            return this.$refs['estimation' + index]?.[0];
        },
        // if coins are equal, then no need swap
        checkNeedSwapEqual(coinSymbol) {
            return this.form.coin !== coinSymbol;
        },
        getSuccessFeeDistribution(managerFee, teamFee, fundFee) {
            if (!this.portfolio.profit ||  this.portfolio.profit <= 0) {
                return [];
            }
            return [
                {
                    to: SUCCESS_FEE_TEAM_ADDRESS,
                    value: teamFee,
                    coin: 'BEE',
                },
                {
                    to: SUCCESS_FEE_FUND_ADDRESS,
                    value: fundFee,
                    coin: 'BEE',
                },
            ].concat(this.managerPremiumLevel > 0 ? {
                to: this.portfolio.owner,
                value: managerFee,
                coin: 'BEE',
            } : []);
        },
        clearForm() {
            this.form.value = '';
            this.form.coin = '';
            this.$v.$reset();
        },
        handleEstimation(index, estimation) {
            this.$set(this.estimationList, index, estimation);
        },
        handleEstimationTxData(index, txData) {
            this.$set(this.estimationTxDataList, index, txData);
        },
        handleV$estimation(index, v$) {
            this.$set(this.v$estimationList, index, v$);
        },
        handleFetchState(index, v$) {
            this.$set(this.estimationFetchStateList, index, v$);
        },
        beforeSuccessSequence() {
            return postConsumerPortfolio('sell', this.portfolio.id, this.portfolioWallet.address, this.$store.getters.privateKey)
                .then(() => {
                    this.$store.commit('portfolio/removeConsumerPortfolio', this.portfolio.id);
                });
        },
    },
};

const PREMIUM_FEE_PERCENT = 1;
/**
 * @param {number|string} amount
 * @return {number|string}
 */
function getPremiumFee(amount) {
    if (!amount) {
        return 0;
    }
    return percent(amount, PREMIUM_FEE_PERCENT);
}
/**
 * @param {number|string} amount
 * @param {number|string} profitPercent
 * @return {number|string}
 */
function getSuccessFee(amount, profitPercent) {
    if (profitPercent <= 0 || !amount) {
        return 0;
    }
    const profitValue = percent(amount, profitPercent);
    const successFeePercent = getProfitFeePercent(profitPercent);
    return percent(profitValue, successFeePercent);
}
/**
 * @param {number|string} profitPercent
 * @return {number}
 */
function getProfitFeePercent(profitPercent) {
    if (!profitPercent || profitPercent <= 0) {
        return 0;
    }
    if (profitPercent < 10) {
        return 10;
    }
    if (profitPercent < 20) {
        return 20;
    }
    if (profitPercent < 40) {
        return 30;
    }
    return 40;
}

function restorePremiumFee(serviceFee, profitPercent) {
    if (profitPercent <= 0) {
        return serviceFee;
    }
    // calculated basing on full amount, not just on profitValue
    // (successFee = amount * profitPercent * profitFeePercent)
    const successFeePercent = percent(profitPercent, getProfitFeePercent(profitPercent));
    // (PREMIUM_FEE_PERCENT + successFeePercent) / PREMIUM_FEE_PERCENT = serviceFee / premiumFee;
    // premiumFee = serviceFee * PREMIUM_FEE_PERCENT / (PREMIUM_FEE_PERCENT + successFeePercent);
    return new Big(serviceFee).times(PREMIUM_FEE_PERCENT).div(new Big(PREMIUM_FEE_PERCENT).plus(successFeePercent)).toString(undefined, BIG_ROUND_DOWN);
}
function restoreSuccessFee(serviceFee, profitPercent) {
    if (profitPercent <= 0) {
        return 0;
    }
    // calculated basing on full amount, not just on profitValue
    // (successFee = amount * profitPercent * profitFeePercent)
    const successFeePercent = percent(profitPercent, getProfitFeePercent(profitPercent));
    // (PREMIUM_FEE_PERCENT + successFeePercent) / successFeePercent = serviceFee / successFee;
    // successFee = serviceFee * successFeePercent / (PREMIUM_FEE_PERCENT + successFeePercent);
    return new Big(serviceFee).times(successFeePercent).div(new Big(PREMIUM_FEE_PERCENT).plus(successFeePercent)).toString(undefined, BIG_ROUND_DOWN);
}

/**
 * calculate percent
 * @param {number|string} amount
 * @param {number|string} percent
 * @return {number|string}
 */
function percent(amount, percent) {
    return new Big(amount).times(percent).div(100).toString(undefined, BIG_ROUND_DOWN);
}
</script>


<template>
    <div>
        <TxSequenceForm
            :sequence-params="sequenceParams"
            :v$sequence-params="$v"
            :before-success-sequence="beforeSuccessSequence"
            @update:fee="fee = $event"
            @update:is-sequence-processing="isSequenceProcessing = $event"
            @clear-form="clearForm()"
            @success="$emit('success')"
            @success-modal-close="$emit('success-modal-close')"
        >
            <template v-slot:default>
                <div class="form-row">
                    <FieldCombined
                        :coin.sync="form.coin"
                        :$coin="$v.form.coin"
                        :label="$td('You receive', 'form.swap-buy-coin')"
                        :amount="false"
                    />
                    <span class="form-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">{{ $td('Enter coin symbol', 'form.coin-error-required') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.coin.$dirty && !$v.form.coin.minLength">{{ $td('Min 3 letters', 'form.coin-error-min') }}</span>
                </div>

                <div class="information form-row">
                    <template v-if="estimationViewCategorised.enabled.length > 0">
                        <h3 class="information__title">{{ $td('Tokens to sell', 'portfolio.tokens-sell-label') }}</h3>
                        <BaseAmountEstimation
                            v-for="item in estimationViewCategorised.enabled"
                            :key="item.coin"
                            v-bind="item"
                        />
                    </template>

                    <template v-if="estimationViewCategorised.disabled.length > 0">
                        <h3 class="information__title">{{ $td('Unable to sell', 'portfolio.tokens-sell-disabled-label') }}</h3>
                        <BaseAmountEstimation
                            v-for="item in estimationViewCategorised.disabled"
                            :key="item.coin"
                            v-bind="item"
                            :is-loading="false"
                            amount="—"
                        />
                    </template>

                    <h3 class="information__title">{{ $td('Premium fee', 'portfolio.estimation-premium-fee') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="estimationPremiumFee" format="approx" :is-loading="isEstimationFetchLoading"/>

                    <template v-if="portfolio.profit > 0">
                        <h3 class="information__title">{{ $td('Success fee', 'portfolio.estimation-success-fee') }}</h3>
                        <BaseAmountEstimation :coin="form.coin" :amount="estimationSuccessFee" format="approx" :is-loading="isEstimationFetchLoading"/>
                    </template>

                    <h3 class="information__title">{{ $td('You get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="estimationAfterFee" format="approx" :is-loading="isEstimationFetchLoading"/>
                </div>
                <!--<PortfolioPriceImpact class="form-row" :estimation-view-usd="estimationViewUsd" :price-unavailable="priceImpactUnavailable"/>-->

                <SwapEstimation
                    class="u-text-medium form-row u-hidden"
                    v-for="(coin, index) in coinList"
                    :key="coin.id"
                    :ref="'estimation' + index"
                    :idPreventConcurrency="'swapForm' + index"
                    :coin-to-sell="checkNeedSwapEqual(coin.symbol) ? coin.symbol : ''"
                    :coin-to-buy="form.coin"
                    :value-to-sell="coin.amount"
                    :force-sell-all="true"
                    :is-use-max="true"
                    :fee="null && fee.resultList && fee.resultList[index]"
                    @update:estimation="handleEstimation(index, $event)"
                    @update:tx-data="handleEstimationTxData(index, $event)"
                    @update:v$estimation="handleV$estimation(index, $event)"
                    @update:fetch-state="handleFetchState(index, $event)"
                />

                <SwapEstimation
                    class="u-text-medium form-row u-hidden"
                    ref="estimationServiceFee"
                    idPreventConcurrency="swapPortfolioServiceFee"
                    :coin-to-sell="form.coin"
                    :coin-to-buy="isNeedSwapServiceFee ? 'BEE' : ''"
                    :value-to-sell="estimationServiceFee"
                    @update:estimation="serviceFeeSwapEstimation = $event"
                    @update:tx-data="serviceFeeSwapTxData = $event"
                    @update:v$estimation="v$serviceFeeSwapEstimation = $event"
                />
            </template>

            <template v-slot:submit-title>
                {{ $td('Confirm', `form.submit-confirm-button`) }}
            </template>

            <template v-slot:confirm-modal-header>
                <h2 class="u-h3 u-mb-10">
                    {{ $td('Sell portfolio', 'portfolio.sell-title') }}
                </h2>
            </template>

            <template v-slot:confirm-modal-body>
                <div class="information form-row">
                    <template v-if="estimationViewCategorised.enabled.length > 0">
                        <h3 class="information__title">{{ $td('Tokens to sell', 'portfolio.tokens-sell-label') }}</h3>
                        <BaseAmountEstimation
                            v-for="item in estimationViewCategorised.enabled"
                            :key="item.coin"
                            v-bind="item"
                        />
                    </template>

                    <h3 class="information__title">{{ $td('Premium fee', 'portfolio.estimation-premium-fee') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="estimationPremiumFee" format="approx" :is-loading="isEstimationFetchLoading"/>

                    <template v-if="portfolio.profit > 0">
                        <h3 class="information__title">{{ $td('Success fee', 'portfolio.estimation-success-fee') }}</h3>
                        <BaseAmountEstimation :coin="form.coin" :amount="estimationSuccessFee" format="approx" :is-loading="isEstimationFetchLoading"/>
                    </template>

                    <h3 class="information__title">{{ $td('You get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                    <BaseAmountEstimation :coin="form.coin" :amount="estimationSum" format="approx" :is-loading="isEstimationFetchLoading"/>

                    <PortfolioPriceImpact class="u-mt-05 u-text-right" :estimation-view-usd="estimationViewUsd" :price-unavailable="priceImpactUnavailable"/>
                </div>
            </template>
        </TxSequenceForm>
    </div>
</template>
