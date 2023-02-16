<script>
import {defineComponent} from 'vue';
import stripZeros from 'pretty-num/src/strip-zeros.js';
import Big from '~/assets/big.js';
import {HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_BY_ID, HUB_CHAIN_DATA, HUB_CHAIN_ID, HUB_NETWORK} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {wait} from '~/assets/utils/wait.js';
import {pretty} from '~/assets/utils.js';
import {findHubCoinItemByTokenAddress, findTokenInfo} from '~/api/hub.js';
import useHubDiscount from '~/composables/use-hub-discount.js';
import useHubOracle from '~/composables/use-hub-oracle.js';
import useHubToken from '~/composables/use-hub-token.js';
import useWeb3TokenBalance from '~/composables/use-web3-token-balance.js';
import useWeb3AddressBalance from '~/composables/use-web3-address-balance';
import useWeb3Deposit from '~/composables/use-web3-deposit.js';
import useWeb3SmartWalletSwap, {ERROR_NOT_ENOUGH_PAY_REWARD} from '~/composables/use-web3-smartwallet-swap.js';
import useTxService from '~/composables/use-tx-service.js';
import {TOP_UP_NETWORK} from '~/components/Topup.vue';
import BaseAmountEstimation from '~/components/base/BaseAmountEstimation.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';
import Modal from '~/components/base/Modal.vue';
import HubBuyTxListItem from '~/components/HubBuyTxListItem.vue';
import HubFeeImpact from '~/components/HubFeeImpact.vue';

export default defineComponent({
    LOADING_STAGE,
    components: {
        BaseAmountEstimation,
        BaseLoader,
        Modal,
        HubBuyTxListItem,
        HubFeeImpact,
    },
    props: {
        /** @type {HUB_CHAIN_ID} */
        networkSlug: {
            type: String,
            required: true,
        },
        showWaitIndicator: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        'update:processing',
        'topup',
    ],
    setup() {
        const { discount, discountUpsidePercent, setDiscountProps } = useHubDiscount();

        const {
            initPromise: hubInfoInitPromise,
            networkNativeCoin,
            hubTokenList,
            setHubOracleProps,
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
            nativeBalance,
            wrappedBalance,
            balance,
            setWeb3TokenProps,
            waitEnoughTokenBalance,
        } = useWeb3TokenBalance();

        const {
            balance: addressBalance,
            setWeb3AddressBalanceProps,
            waitBalanceUpdate,
        } = useWeb3AddressBalance();

        const {
            setDepositProps,
            depositFromEthereum,
            amountToUnwrap,
            isUnwrapRequired,
            gasPriceGwei: evmGasPriceGwei,
            gasTotalFee: evmTotalFee,
            depositAmountAfterGas,
        } = useWeb3Deposit();

        const {
            // discountUpsidePercent,
            // destinationFeeInCoin,
            // hubFeeRate,
            // hubFeeRatePercent,
            // hubFee,
            // withdrawAmountToReceive,
            // minAmountToWithdraw,
            // withdrawTxParams,
            // withdrawFeeTxParams,

            amountEstimationLimitForRelayReward: smartWalletRelayReward,
            amountToSellForSwapToHub,
            amountEstimationAfterSwapToHub: depositAmountToReceive,
            isSmartWalletSwapParamsLoading,
            smartWalletSwapParamsError,
            smartWalletAddress,
            /*feeTxParams: smartWalletTxParams,*/
            buildTxListAndCallSmartWallet,
            setSmartWalletSwapProps,
        } = useWeb3SmartWalletSwap();

        const {txServiceState, currentLoadingStage, setTxServiceProps, setStepList, estimateTxGas, waitPendingStep, addStepData} = useTxService();

        return {
            discount,
            discountUpsidePercent,
            setDiscountProps,

            hubInfoInitPromise,
            networkNativeCoin,
            hubTokenList,
            setHubOracleProps,

            // tokenData,
            // isNativeToken,
            // setHubTokenProps,

            // nativeBalance,
            // wrappedBalance,
            balance,
            // setWeb3TokenProps,
            // waitEnoughTokenBalance,

            addressBalance,
            setWeb3AddressBalanceProps,
            waitBalanceUpdate,

            // setDepositProps,
            // depositFromEthereum,
            // amountToUnwrap,
            // isUnwrapRequired,
            // evmGasPriceGwei,
            // evmTotalFee,
            // depositAmountAfterGas,

            smartWalletRelayReward,
            amountToSellForSwapToHub,
            depositAmountToReceive,
            isSmartWalletSwapParamsLoading,
            smartWalletSwapParamsError,
            smartWalletAddress,
            /*feeTxParams: smartWalletTxParams,*/
            buildTxListAndCallSmartWallet,
            setSmartWalletSwapProps,

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
        return this.initWaitEvmTopup();
    },
    data() {
        return {
            /** @type {TokenBalance|null} */
            updatedBalanceItem: null,
            evmWaitCanceler: () => {},
            serverError: '',
            isConfirmModalVisible: false,
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
        /** @type {HubCoinItem|undefined} */
        hubCoin() {
            return findHubCoinItemByTokenAddress(this.hubTokenList, this.updatedBalanceItem?.tokenContractAddress, this.hubChainData.chainId);
        },
        tokenSymbol() {
            return this.hubCoin?.symbol || this.updatedBalanceItem?.tokenContractAddress;
        },
        usdtSymbol() {
            if (this.networkSlug === HUB_NETWORK.ETHEREUM) {
                return 'USDTE';
            }
            if (this.networkSlug === HUB_NETWORK.BSC) {
                return 'USDTBSC';
            }
            return '';
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
        coinAmountAfterBridge() {
            return this.depositAmountToReceive;
            // const input = this.depositAmountAfterGas;
            // return new Big(input || 0).minus(this.hubFee).toString();
        },
        totalFeeImpact() {
            const totalSpend = this.balance;
            const totalResult = this.coinAmountAfterBridge;
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
            return this.depositAmountToReceive > 0 && !this.isEvmToppedUp && !this.isDepositStarted;
        },
        showLoader() {
            return this.showWaitIndicator && this.currentLoadingStage === LOADING_STAGE.WAIT_ETH;
        },
        showTxList() {
            return !this.showLoader && !this.isWaitingEvmTopup;
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
            () => ({
                privateKey: this.$store.getters.privateKey,
                evmAccountAddress: this.$store.getters.evmAddress,
                chainId: this.hubChainData.chainId,
                // will be set after balance update
                // valueToSell: this.withdrawValue,
                // tokenToSellContractAddress: this.withdrawCoin,
                // tokenToBuyContractAddress: this.form.coinToBuy,
                skipEstimation: true,
                idPreventConcurrency: 'estimateSwsSwap',
            }),
            (newVal) => this.setSmartWalletSwapProps(newVal),
            {deep: true, immediate: true},
        );

        // depositProps
        // tokenProps
        this.$watch(
            () => ({
                // destinationMinterAddress: this.$store.getters.address,
                accountAddress: this.smartWalletAddress,
                chainId: this.hubChainData.chainId,
                // @TODO don't unwrap micro WETH balance
                // amount: this.balance,
                // tokenSymbol: this.tokenSymbol,
                // disable updating gasPriceGwei > coinAmountAfterBridge, which will triggers watchEstimation
                // freezeGasPrice: false,
            }),
            (newVal) => {
                this.setWeb3AddressBalanceProps(newVal);
                // this.setDepositProps(newVal);
                this.setHubOracleProps({
                    hubNetworkSlug: HUB_CHAIN_BY_ID[newVal.chainId]?.hubNetworkSlug,
                });
                // this.setHubTokenProps(newVal);
                // this.setWeb3TokenProps(newVal);
            },
            {deep: true, immediate: true},
        );

        // txServiceProps
        // this.$watch(
        //     () => ({
        //         privateKey: this.$store.getters.privateKey,
        //         accountAddress: this.$store.getters.evmAddress,
        //         chainId: this.hubChainData.chainId,
        //     }),
        //     (newVal) => this.setTxServiceProps(newVal),
        //     {deep: true, immediate: true},
        // );

        // discountProps
        this.$watch(
            () => ({
                minterAddress: this.$store.getters.address,
                ethAddress: this.$store.getters.evmAddress,
            }),
            (newVal) => this.setDiscountProps(newVal),
            {deep: true, immediate: true},
        );
    },
    destroyed() {
        this.evmWaitCanceler();
    },
    methods: {
        pretty,
        waitEvmBalance() {
            this.addStepData(LOADING_STAGE.WAIT_ETH, {network: this.networkSlug});
            const promise = this.waitBalanceUpdate()
                .then((updatedList) => {
                    const updatedBalanceItem = updatedList[0];
                    this.updatedBalanceItem = updatedBalanceItem;

                    this.$nextTick()
                        .then(() => {
                            this.addStepData(LOADING_STAGE.WAIT_ETH, {
                                coin: this.tokenSymbol,
                                amount: this.updatedBalanceItem.amount,
                                finished: true,
                            });
                        });

                    return updatedBalanceItem;
                });
            this.evmWaitCanceler = promise.canceler || (() => {});
            return promise;
        },
        depositFromEthereum() {
            const tokenBalance = this.updatedBalanceItem;
            const usdtHubToken = findTokenInfo(this.hubTokenList, this.usdtSymbol, this.hubChainData.chainId);
            const tokenToDeposit = this.hubCoin
                ? {
                    tokenToBuyContractAddress: tokenBalance.tokenContractAddress,
                    tokenToBuyDecimals: tokenBalance.decimals,
                }
                : {
                    tokenToBuyContractAddress: usdtHubToken.externalTokenId,
                    tokenToBuyDecimals: usdtHubToken.externalDecimals,
                };
            this.setSmartWalletSwapProps({
                valueToSell: tokenBalance.amount,
                tokenToSellContractAddress: tokenBalance.tokenContractAddress,
                tokenToSellDecimals: tokenBalance.decimals,
                ...tokenToDeposit,
            });

            this.addStepData(LOADING_STAGE.SEND_BRIDGE, {coin: this.tokenSymbol, amount: tokenBalance.amount}, true);

            // wait computed to recalculate
            return wait(100)
                .then(() => this.buildTxListAndCallSmartWallet())
                .then((result) => {
                    window.alert(`https://explorer.minter.network/smart-wallet-relay/${result.hash}`);
                    this.addStepData(LOADING_STAGE.SEND_BRIDGE, {finished: true});
                    // @TODO subscribe hub deposit
                })
                .catch((error) => {
                    this.addStepData(LOADING_STAGE.SEND_BRIDGE, {error}, true);
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
                    this.$emit('update:processing', true);
                    return this.depositFromEthereum();
                })
                .then((outputAmount) => {
                    this.finishTopup(outputAmount, this.tokenSymbol);
                })
                .catch((error) => {
                    if (error.isCanceled) {
                        return;
                    }
                    console.error(error);
                    this.serverError = getErrorText(error);
                });
        },
        // cancel waiting and deposit existing balance
        // deposit() {
        //     this.evmWaitCanceler();
        //     this.setStepList({});
        //     this.isConfirmModalVisible = false;
        //     this.$emit('update:processing', true);
        //
        //     this.depositFromEthereum()
        //         .then((outputAmount) => {
        //             this.finishTopup(outputAmount, this.tokenSymbol);
        //         })
        //         .catch((error) => {
        //             console.error(error);
        //             this.serverError = getErrorText(error);
        //         });
        // },
        finishTopup(amount, coinSymbol) {
            // this.setStepList({});
            this.$emit('update:processing', false);
            this.$emit('topup', {amount: stripZeros(amount), coinSymbol});
        },
    },
});
</script>

<template>
    <div v-if="showSomething">
        <div class="form-row" v-if="showExistingBalance">
            <p>{{ $td(`You have ${pretty(balance)} ${tokenSymbol} on you ${hubChainData.shortName} address. Do you want to deposit it?`, 'topup.deposit-evm-balance-description', {amount: pretty(balance), coin: tokenSymbol, network: hubChainData.shortName}) }}</p>
            <button type="button" class="button button--main button--full u-mt-10" @click="isConfirmModalVisible = true">
                {{ $td(`Deposit ${pretty(balance)} ${tokenSymbol}`, 'topup.deposit-evm-balance-button', {amount: pretty(balance), coin: tokenSymbol}) }}
            </button>
        </div>

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

        <!-- Confirm modal -->
        <Modal class="u-text-left" :isOpen.sync="isConfirmModalVisible">
            <h2 class="u-h3 form-row">
                {{ $td('Deposit', 'topup.confirm-deposit-title') }}
            </h2>

            <div class="information form-row">
                <h3 class="information__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                <BaseAmountEstimation :coin="tokenSymbol" :amount="balance" format="exact"/>

                <h3 class="information__title">{{ $td('You will get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                <BaseAmountEstimation :coin="tokenSymbol" :amount="coinAmountAfterBridge" format="approx"/>
            </div>

            <HubFeeImpact class="form-row" :coin="tokenSymbol" :fee-impact="totalFeeImpact" :network="hubChainData.shortName"/>

            <div class="form-row">
                <button
                    class="button button--main button--full" type="button" data-focus-on-open
                    @click="deposit()"
                >
                    {{ $td('Confirm', 'form.submit-confirm-button') }}
                </button>
                <button class="button button--ghost-main button--full u-mt-05" type="button" @click="isConfirmModalVisible = false">
                    {{ $td('Cancel', 'form.submit-cancel-button') }}
                </button>
            </div>
        </Modal>
    </div>
</template>
