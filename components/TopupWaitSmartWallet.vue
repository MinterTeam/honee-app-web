<script>
import {defineComponent} from 'vue';
import stripZeros from 'pretty-num/src/strip-zeros.js';
import {isCoinSymbol} from 'minter-js-sdk/src/utils.js';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_BY_ID, HUB_CHAIN_DATA, HUB_COIN_DATA as DEPOSIT_COIN_DATA, HUB_NETWORK_SLUG, SWAP_TYPE} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {wait, waitCondition} from '@shrpne/utils/src/wait.js';
import {pretty} from '~/assets/utils.js';
import {findHubCoinItemByTokenAddress, findHubCoinItem, waitHubTransferToMinter} from '~/api/hub.js';
import {waitRelayTxSuccess} from 'minter-js-web3-sdk/src/api/smart-wallet-relay.js';
import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';
import useHubDiscount from '~/composables/use-hub-discount.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3AddressBalance from '~/composables/use-web3-address-balance';
import useWeb3SmartWalletSwap from 'minter-js-web3-sdk/src/composables/use-web3-smartwallet-swap.js';
import useTxService from '~/composables/use-tx-service.js';
import useTxMinterPresets from '~/composables/use-tx-minter-presets.js';
import {addStepDataRelay, addStepDataBridgeDeposit} from '~/composables/use-tx-minter-presets.js';
import {TOP_UP_NETWORK} from '~/components/Topup.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';
import SwapEstimationWithFee from '~/components/base/SwapEstimationWithFee.vue';
import HubBuyTxListItem from '~/components/base/StepListItem.vue';

/**
 * @enum {string}
 */
const MODE = {
    AFTER_TOPUP: 'topup',
    EXISTING_BALANCE: 'existing',
};

export default defineComponent({
    LOADING_STAGE,
    components: {
        BaseLoader,
        SwapEstimationWithFee,
        HubBuyTxListItem,
    },
    props: {
        /** @type {HUB_NETWORK_SLUG} */
        networkSlug: {
            type: String,
            required: true,
        },
        isLegacy: {
            type: Boolean,
            default: false,
        },
        form: {
            type: Object,
            default: () => ({}),
        },
        showWaitIndicator: {
            type: Boolean,
            default: false,
        },
        coinSwapAfterDeposit: {
            type: String,
        },
    },
    emits: [
        'update:processing',
        'update:data',
        'topup',
    ],
    setup() {
        const { discount, discountUpsidePercent, setDiscountProps } = useHubDiscount();

        const {
            initPromise: hubInfoInitPromise,
            networkNativeCoin,
            networkGasPrice,
            hubTokenList,
            setHubOracleProps,
            fetchHubPriceList,
        } = useHubOracle({
            subscribeTokenList: true,
            subscribePriceList: true,
        });
        const {
            tokenData,
            isNativeToken,
            setHubTokenProps,
        } = useHubToken();

        const {
            web3Balance,
            balanceList: addressBalance,
            setWeb3AddressBalanceProps,
            waitBalanceUpdate,
        } = useWeb3AddressBalance();

        const {
            gasPrice,
            relayRewardAmount,
            amountEstimationLimitForRelayReward: smartWalletRelayReward,
            amountToSellForSwapToHub,
            amountEstimationAfterSwapToHub,
            amountToDeposit,
            amountAfterDeposit,
            smartWalletAddress,
            isSmartWalletSwapParamsLoading,
            smartWalletSwapParamsError,
            estimationAfterSwapToHubError,
            estimationLimitForRelayRewardsError,
            /*feeTxParams: smartWalletTxParams,*/
            buildTxListAndCallSmartWallet,
            setSmartWalletSwapProps,
        } = useWeb3SmartWalletSwap();

        const {sendMinterSwapTx} = useTxMinterPresets();
        const {txServiceState, currentLoadingStage, setTxServiceProps, setStepList, estimateTxGas, waitPendingStep, addStepData} = useTxService();

        return {
            discount,
            discountUpsidePercent,
            setDiscountProps,

            hubInfoInitPromise,
            // networkNativeCoin,
            networkGasPrice,
            hubTokenList,
            setHubOracleProps,
            fetchHubPriceList,

            // tokenData,
            // isNativeToken,
            // setHubTokenProps,

            web3Balance,
            addressBalance,
            setWeb3AddressBalanceProps,
            waitBalanceUpdate,

            gasPrice,
            relayRewardAmount,
            smartWalletRelayReward,
            amountToSellForSwapToHub,
            amountEstimationAfterSwapToHub,
            amountToDeposit,
            amountAfterDeposit,
            isSmartWalletSwapParamsLoading,
            smartWalletSwapParamsError,
            estimationAfterSwapToHubError,
            estimationLimitForRelayRewardsError,
            smartWalletAddress,
            /*feeTxParams: smartWalletTxParams,*/
            buildTxListAndCallSmartWallet,
            setSmartWalletSwapProps,

            sendMinterSwapTx,

            txServiceState,
            currentLoadingStage,
            // setTxServiceProps,
            setStepList,
            estimateTxGas,
            waitPendingStep,
            addStepData,
        };
    },
    fetch() {
        if (!this.isLegacy) {
            return this.initWaitEvmTopup();
        }
    },
    data() {
        return {
            mode: MODE.EXISTING_BALANCE,
            /** @type {TokenBalanceItem|null} */
            updatedBalanceItem: null,
            evmWaitCanceler: () => {},
            relayWaitCanceler: () => {},
            serverError: '',
            // isConfirmModalVisible: false,

            /** @type {FeeData} */
            fee: undefined,
            // just `estimation` refers to minter swap estimation
            estimation: 0,
            estimationFetchState: null,
            v$estimation: {},
            txData: {},
        };
    },
    computed: {
        /** @type {TopUpNetwork} */
        network() {
            return TOP_UP_NETWORK[this.networkSlug];
        },
        /** @type {HubChainDataItem} */
        hubChainData() {
            return HUB_CHAIN_DATA[this.networkSlug];
        },
        /** @type {TokenBalanceItem} */
        selectedBalanceItem() {
            return this.mode === MODE.AFTER_TOPUP ? this.updatedBalanceItem : this.form?.tokenBalanceItem;
        },
        selectedAmount() {
            return this.mode === MODE.AFTER_TOPUP ? this.updatedBalanceItem?.amount : this.form?.amount;
        },
        /** @type {HubCoinItem|undefined} - hub coin to send to relay */
        hubCoin() {
            return findHubCoinItemByTokenAddress(this.hubTokenList, this.selectedBalanceItem?.tokenContractAddress, this.hubChainData.chainId, true);
        },
        tokenSymbol() {
            return this.hubCoin?.symbol || this.selectedBalanceItem?.tokenContractAddress;
        },
        fallbackSymbol() {
            if (this.networkSlug === HUB_NETWORK_SLUG.ETHEREUM) {
                return 'ETH';
                // return 'USDTE';
            }
            if (this.networkSlug === HUB_NETWORK_SLUG.BSC) {
                return 'BNB';
                // return 'USDTBSC';
            }
            return '';
        },
        /** @type {HubCoinItem|undefined} */
        fallbackHubCoin() {
            return findHubCoinItem(this.hubTokenList, this.fallbackSymbol);
        },
        /** @type {HubCoinItem|undefined} */
        depositHubCoin() {
            // if token to sell exists in Hub bridge, then set is as tokenToBuy, so swap will be skipped and token will be deposited as is
            // otherwise buy USDT
            return this.hubCoin || this.fallbackHubCoin;
        },
        /** @type {TokenInfo.AsObject|undefined} */
        depositHubToken() {
            return this.depositHubCoin
                ? this.depositHubCoin[this.hubChainData.hubNetworkSlug]
                : undefined;
        },
        minterCoinToGet() {
            const coinToGet = this.coinSwapAfterDeposit || this.$route.query.coinToGet;
            return isCoinSymbol(coinToGet) ? coinToGet : '';
        },
        // hubFeeRate() {
        //     const discountModifier = 1 - this.discount;
        //     // commission to deposit is taken from external token data (e.g. chainId: 'ethereum')
        //     return new Big(this.tokenData?.commission || 0.01).times(discountModifier).toString();
        // },
        // fee to HUB bridge calculated in COIN
        // hubFee() {
        //     const input = this.depositAmountAfterGas;
        //     return new Big(input || 0).times(this.hubFeeRate).toString();
        // },
        totalFeeImpact() {
            const totalSpend = this.form?.amount;
            const totalResult = this.amountAfterDeposit;
            if (!totalSpend || !totalResult) {
                return 0;
            }
            return Math.min((totalSpend - totalResult) / totalSpend * 100, 100);
        },
        isWaitingEvmTopup() {
            const step = this.txServiceState.steps[LOADING_STAGE.WAIT_ETH];
            return step?.loadingStage && !step.amount;
        },
        isEvmToppedUp() {
            return this.txServiceState.steps[LOADING_STAGE.WAIT_ETH]?.amount;
        },
        isDepositStarted() {
            // has any step except WAIT_ETH
            return Object.keys(this.txServiceState.steps).some((key) => key !== LOADING_STAGE.WAIT_ETH);
        },
        showExistingBalance() {
            return this.addressBalance?.length > 0 && !this.isEvmToppedUp && !this.isDepositStarted;
        },
        showLoader() {
            return this.showWaitIndicator && this.currentLoadingStage === LOADING_STAGE.WAIT_ETH;
        },
        showTxList() {
            return Object.keys(this.txServiceState.steps).length > 0 && !this.showLoader && !this.isWaitingEvmTopup;
        },
        showSomething() {
            return this.showExistingBalance || this.showLoader || this.showTxList || this.serverError;
        },
    },
    watch: {
    },
    created() {
        // smartWalletSwapProps
        this.$watch(
            () => {
                return {
                    privateKey: this.$store.getters.privateKey,
                    evmAccountAddress: this.$store.getters.evmAddress,
                    depositDestinationAddress: this.$store.getters.evmAddress,
                    chainId: this.hubChainData.chainId,
                    isLegacy: this.isLegacy,
                    gasPriceGwei: this.networkGasPrice,
                    valueToSell: this.selectedAmount,
                    tokenToSellContractAddress: this.selectedBalanceItem?.tokenContractAddress,
                    tokenToSellDecimals: this.selectedBalanceItem?.decimals,
                    tokenToBuyContractAddress: this.depositHubToken?.externalTokenId,
                    tokenToBuyDecimals: this.depositHubToken?.externalDecimals,
                    // skipEstimation: true,
                    idPreventConcurrency: 'estimateSwsSwap' + this.hubChainData.chainId + (this.isLegacy ? 'legacy' : ''),
                };
            },
            (newVal) => this.setSmartWalletSwapProps(newVal),
            {deep: true, immediate: true},
        );

        // web3AddressBalanceProps
        this.$watch(
            () => ({
                accountAddress: this.smartWalletAddress,
                chainId: this.hubChainData.chainId,
            }),
            (newVal) => {
                this.setWeb3AddressBalanceProps(newVal);
                // this.setDepositProps(newVal);
                this.setHubOracleProps({
                    hubNetworkSlug: HUB_CHAIN_BY_ID[newVal.chainId]?.hubNetworkSlug,
                });
            },
            {deep: true, immediate: true},
        );

        // discountProps
        this.$watch(
            () => ({
                minterAddress: this.$store.getters.address,
                ethAddress: this.$store.getters.evmAddress,
            }),
            (newVal) => this.setDiscountProps(newVal),
            {deep: true, immediate: true},
        );

        // emit shared data to wrapper
        this.$watch(
            () => ({
                addressBalance: this.addressBalance,
                amountAfterDeposit: this.amountAfterDeposit,
                smartWalletRelayReward: this.smartWalletRelayReward,
                minterCoinToGet: this.minterCoinToGet,
                minterEstimation: this.estimation,
                // relay reward error
                estimationLimitForRelayRewardsError: this.estimationLimitForRelayRewardsError,
                // combined error
                smartWalletSwapParamsError: this.smartWalletSwapParamsError,
                isSmartWalletSwapParamsLoading: this.isSmartWalletSwapParamsLoading,
                totalFeeImpact: this.totalFeeImpact,
                showSomething: this.showSomething,
            }),
            (newVal) => {
                /**
                 * @typedef {newVal} TopupWaitSmartWalletSharedData
                 */
                this.$emit('update:data', newVal);
            },
            {deep: true, immediate: true},
        );
    },
    destroyed() {
        this.evmWaitCanceler();
        this.relayWaitCanceler();
    },
    methods: {
        pretty,
        updateGasPrice() {
            return this.fetchHubPriceList()
                // wait computed and useSmartWallet watch-debounce (50 + 100)
                .then(() => wait(150))
                .then(() => {
                    if (this.isSmartWalletSwapParamsLoading) {
                        return waitCondition(() => !this.isSmartWalletSwapParamsLoading);
                    }
                });
        },
        waitEvmBalance() {
            // @TODO maybe keep different txServiceState instances
            // multiple instances of topup share same txServiceState, so only set steps when other instances deactivated (e.g. on WAIT_ETH finish)
            // this.addStepData(LOADING_STAGE.WAIT_ETH, {network: this.networkSlug});
            const [promise, canceler] = this.waitBalanceUpdate();
            this.evmWaitCanceler = canceler;

            return promise
                .then((updatedList) => {
                    // @TODO select best (it is rare that multiple coins will be topped up during polling tick, but may be)
                    this.updatedBalanceItem = updatedList[0];
                    // @TODO maybe emit earlier to cancel other waiters (now cancels on 'update:processing')
                    this.mode = MODE.AFTER_TOPUP;
                })
                // wait computed to recalculate
                .then(() => wait(100))
                .then(() => {
                    this.addStepData(LOADING_STAGE.WAIT_ETH, {
                        network: this.networkSlug,
                        coin: this.tokenSymbol,
                        amount: this.updatedBalanceItem.amount,
                        finished: true,
                    });
                });
        },
        depositFromEthereum() {
            this.$emit('update:processing', true);
            this.addStepData(LOADING_STAGE.SEND_TO_RELAY, {
                coin: this.tokenSymbol,
                amount: this.selectedAmount,
                relayParams: {
                    hubNetworkSlug: this.hubChainData.hubNetworkSlug,
                },
            }, true);

            return this.buildTxListAndCallSmartWallet()
                .then((result) => {
                    const [promise, canceler] = addStepDataRelay(this.hubChainData.chainId, result.hash);
                    this.relayWaitCanceler = canceler;
                    return promise;
                })
                .then((result) => {
                    return addStepDataBridgeDeposit(this.hubChainData.chainId, result.txHash, this.depositHubCoin.symbol, this.amountToDeposit, this.$store.getters.address);
                })
                .catch((error) => {
                    this.addStepData(this.currentLoadingStage, {error});
                    throw error;
                });
        },
        initWaitEvmTopup() {
            this.setStepList({});
            return this.hubInfoInitPromise
                // wait computed to recalculate
                .then(() => wait(100))
                .then(() => this.waitEvmBalance())
                .then(() => {
                    return this.depositFromEthereum();
                })
                .then((outputAmount) => {
                    const coinToDeposit = this.depositHubCoin.symbol;
                    if (this.minterCoinToGet) {
                        return this.sendMinterSwapTx({
                            initialTxParams: {
                                data: {
                                    coinToSell: coinToDeposit,
                                    coinToBuy: this.minterCoinToGet,
                                    valueToSell: outputAmount,
                                },
                            },
                            options: {
                                privateKey: this.$store.getters.privateKey,
                            },
                            prepare: () => this.prepareMinterSwapParams(outputAmount, coinToDeposit),
                        })
                            .then((tx) => {
                                this.finishTopup(tx.result.returnAmount, this.minterCoinToGet);
                            });
                    } else {
                        this.finishTopup(outputAmount, coinToDeposit);
                    }
                })
                .catch((error) => {
                    if (error.isCanceled) {
                        return;
                    }
                    console.error(error);
                    this.serverError = getErrorText(error);
                });
        },
        /*
        openDepositConfirmation() {
            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            this.serverError = '';
            this.isConfirmModalVisible = true;
        },
        */
        // cancel waiting and deposit existing balance
        deposit() {
            this.evmWaitCanceler();
            this.setStepList({});
            // this.isConfirmModalVisible = false;

            this.depositFromEthereum()
                .then((outputAmount) => {
                    this.finishTopup(outputAmount, this.tokenSymbol);
                })
                .catch((error) => {
                    console.error(error);
                    this.serverError = getErrorText(error);
                });
        },
        finishTopup(amount, coinSymbol) {
            // this.setStepList({});
            this.$emit('update:processing', false);
            this.$emit('topup', {amount: stripZeros(amount), coinSymbol});
        },
        async prepareMinterSwapParams(amount, coinToSell) {
            await this.$refs.estimation.refineFee();
            await this.$nextTick();

            const valueToSell = getAvailableSelectedBalance({
                coin: this.$store.state.explorer.coinMap[coinToSell],
                amount,
            }, this.fee);

            // @TODO maybe not perform initial estimation and estimate only here in prepare (need to disable check validations in SwapEstimation.getEstimation) (maybe not, because initial estimation is needed for SmartWalletWrap deposit form)
            return this.$refs.estimation.getEstimation(true, true, {
                valueToSell,
                gasCoin: this.fee.coin,
                // sellAll: isSellAll,
            })
                .then(() => {
                    return {
                        type: this.$refs.estimation.getTxType(),
                        data: {
                            ...this.txData,
                            valueToSell,
                        },
                        gasCoin: this.fee.coin,
                    };
                });
        },
    },
});
</script>

<template>
    <div v-if="showSomething">
        <div class="form-row" v-if="showLoader">
            <div>{{ $td('Waiting top-up transaction', 'topup.waiting-topup') }}</div>
            <div class="u-text-center">
                <BaseLoader :is-loading="true"/>
            </div>
        </div>
        <HubBuyTxListItem
            v-else-if="showTxList"
            class="hub__buy-stage form-row u-text-left"
            v-for="item in txServiceState.steps"
            :key="item.loadingStage"
            :step="item"
            :loadingStage="item.loadingStage"
        />
        <div class="form__error u-mt-10" v-if="serverError">{{ serverError }}</div>
        <div class="form-row u-text-medium u-fw-500" v-if="minterCoinToGet && currentLoadingStage && currentLoadingStage !== $options.LOADING_STAGE.FINISH">
            <span class="u-emoji">⚠️</span> {{ $td('Please keep this page active, otherwise progress may&nbsp;be&nbsp;lost.', 'index.keep-page-active') }}
        </div>

        <SwapEstimationWithFee
            class="u-text-medium form-row u-hidden"
            ref="estimation"
            idPreventConcurrency="swapAfterDeposit"
            :coin-to-sell="depositHubCoin?.symbol"
            :coin-to-buy="minterCoinToGet"
            :value-to-sell="amountAfterDeposit"
            :max-amount-to-spend="amountAfterDeposit"
            :force-sell-all="false"
            :is-use-max="false"
            :is-worst-route="true"
            @update:estimation="estimation = $event"
            @update:tx-data="txData = $event"
            @update:v$estimation="v$estimation = $event"
            @update:fetch-state="estimationFetchState = $event"
            @update:fee="fee = $event"
        />
    </div>
</template>
