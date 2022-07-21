<script>
import QrcodeVue from 'qrcode.vue';
import {validationMixin} from 'vuelidate';
import required from 'vuelidate/lib/validators/required.js';
import maxValue from 'vuelidate/lib/validators/maxValue.js';
import minLength from 'vuelidate/lib/validators/minLength.js';
import withParams from 'vuelidate/lib/withParams.js';
import autosize from 'v-autosize';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {web3Utils, AbiEncoder, toErcDecimals} from '~/api/web3.js';
import Big from '~/assets/big.js';
import initRampPurchase, {fiatRampPurchaseNetwork} from '~/assets/fiat-ramp.js';
import {pretty, prettyPrecise, prettyRound, prettyExact, decreasePrecisionSignificant, getExplorerTxUrl, getEvmTxUrl, shortHashFilter} from '~/assets/utils.js';
import erc20ABI from '~/assets/abi-erc20.js';
import hubABI from '~/assets/abi-hub.js';
import wethAbi from '~/assets/abi-weth.js';
import debounce from '~/assets/lodash5-debounce.js';
import {NETWORK, MAINNET, ETHEREUM_CHAIN_ID, BSC_CHAIN_ID, HUB_TRANSFER_STATUS, SWAP_TYPE, HUB_BUY_STAGE as LOADING_STAGE, HUB_CHAIN_DATA, HUB_CHAIN_ID, HUB_CHAIN_BY_ID} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import checkEmpty from '~/assets/v-check-empty.js';
import useEstimateSwap from '~/composables/use-estimate-swap.js';
import useHubDiscount from '~/composables/use-hub-discount.js';
import useHubTokenData from '~/composables/use-hub-token-data.js';
import useWeb3TokenBalance from '~/composables/use-web3-token-balance.js';
import useWeb3Deposit from '~/composables/use-web3-deposit.js';
import useTxService from '~/composables/use-tx-service.js';
import useTxMinterPresets from '~/composables/use-tx-minter-presets.js';
import BaseAmountEstimation from '@/components/base/BaseAmountEstimation.vue';
import Loader from '~/components/base/BaseLoader.vue';
import Modal from '@/components/base/Modal.vue';
import ButtonCopyIcon from '~/components/base/BaseButtonCopyIcon.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import FieldSelect from '~/components/base/FieldSelect.vue';
import HubBuyTxListItem from '@/components/HubBuyTxListItem.vue';
import HubBuySpeedup from '@/components/HubBuySpeedup.vue';


const FIAT_RAMP_NETWORK = 'fiat-ramp';

const PROMISE_FINISHED = 'finished';
const PROMISE_REJECTED = 'rejected';
const PROMISE_PENDING = 'pending';

const TX_UNWRAP = 'unwrap';
const TX_APPROVE = 'approve';
const TX_TRANSFER = 'transfer';

const GAS_LIMIT_SWAP = 200000;
const GAS_LIMIT_WRAP = 50000;
const GAS_LIMIT_UNWRAP = 50000;
const GAS_LIMIT_UNLOCK = 75000;
const GAS_LIMIT_BRIDGE = 75000;

let waitingCancel;

let timer;


const DEPOSIT_COIN_DATA = {
    ETH: {
        testnetSymbol: 'TESTETH',
        smallAmount: 0.0001,
    },
    BNB: {
        testnetSymbol: 'TESTBNB',
        smallAmount: 0.001,
    },
    USDTE: {
        testnetSymbol: 'USDC',
        smallAmount: 0.1,
    },
    HUB: {
        testnetSymbol: 'TESTHUB',
        smallAmount: 0.01,
    },
};

const isValidAmount = withParams({type: 'validAmount'}, (value) => {
    return parseFloat(value) >= 0;
});

export default {
    FIAT_RAMP_NETWORK,
    TX_UNWRAP,
    TX_APPROVE,
    TX_TRANSFER,
    LOADING_STAGE,
    HUB_CHAIN_DATA,
    HUB_CHAIN_ID,
    components: {
        QrcodeVue,
        BaseAmountEstimation,
        Loader,
        Modal,
        ButtonCopyIcon,
        FieldCombined,
        FieldSelect,
        HubBuyTxListItem,
        HubBuySpeedup,
    },
    directives: {
        autosize,
        checkEmpty,
    },
    mixins: [validationMixin],
    fetch() {
        // replace deprecated query with params
        if (this.$route.query.coin) {
            const newPath = this.$route.path.replace(/\/*$/, `/${this.$route.query.coin}`);
            this.$router.replace(newPath);
        }
    },
    emits: [
        'success',
        'success-modal-close',
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
    setup(props, context) {
        // just `estimation` refers to minter swap estimation
        const {
            estimation,
            estimationRoute,
            estimationError,
            isEstimationWaiting,
            handleInputBlur,
            estimateSwap,
        } = useEstimateSwap({
            $td: context.root.$td,
            idPreventConcurrency: 'hubBuy',
        });
        const { discount, discountUpsidePercent, setDiscountProps } = useHubDiscount();
        const {hubTokenList: hubCoinList, hubPriceList: priceList} = useHubTokenData({subscribePriceList: true});

        const {
            tokenData: externalToken,
            tokenContractAddress: coinContractAddress,
            tokenDecimals: coinDecimals,
            isNativeToken: isEthSelected,
            nativeBalance: selectedNative,
            wrappedBalance: selectedWrapped,
            balance: selectedBalance,
            tokenAllowance: coinToDepositUnlocked,
            setTokenProps,
            updateTokenBalance,
            updateTokenAllowance,
            waitEnoughTokenBalance,
        } = useWeb3TokenBalance();
        const {
            setDepositProps,
            depositFromEthereum,
            amountToUnwrap,
            isUnwrapRequired,
            gasPriceGwei: ethGasPriceGwei,
            gasTotalFee: ethTotalFee,
            depositAmountAfterGas: formAmountAfterGas,
        } = useWeb3Deposit();
        const {txServiceState, currentLoadingStage, setTxServiceProps, sendEthTx, estimateTxGas, waitPendingStep, addStepData} = useTxService();
        const {sendMinterSwapTx} = useTxMinterPresets();

        return {
            estimation,
            estimationRoute,
            estimationError,
            isEstimationWaiting,
            handleInputBlur,
            estimateSwap,

            discount,
            discountUpsidePercent,
            setDiscountProps,

            hubCoinList,
            priceList,

            externalToken, coinContractAddress, coinDecimals, isEthSelected, selectedNative, selectedWrapped, selectedBalance, coinToDepositUnlocked,
            setTokenProps,
            updateTokenBalance,
            updateTokenAllowance,
            waitEnoughTokenBalance,

            setDepositProps, depositFromEthereum, amountToUnwrap, isUnwrapRequired, ethGasPriceGwei, ethTotalFee, formAmountAfterGas,

            txServiceState, currentLoadingStage, setTxServiceProps, sendEthTx, estimateTxGas, waitPendingStep, addStepData,

            sendMinterSwapTx,
        };
    },
    data() {
        return {
            form: {
                selectedHubNetwork: HUB_CHAIN_ID.BSC,
                amountEth: '',
                coinToGet: this.params.coinToGet?.toUpperCase() || '',
                amountToGet: '',
            },
            isFormSending: false,
            serverError: '',
            isConfirmModalVisible: false,
            recovery: null,
        };
    },
    validations() {
        return {
            form: {
                amountEth: {
                    required,
                    validAmount: isValidAmount,
                    // maxValue: maxValue(this.maxAmount || 0),
                    minValue: (value) => value > 0,
                    enoughToPayFee: (value) => value >= this.ethTotalFee,
                },
                coinToGet: {
                    required,
                    minLength: minLength(3),
                    // supported: (symbol) => this.suggestionList.includes(symbol),
                },
                amountToGet: {},
            },
        };
    },
    computed: {
        isConnected() {
            return !!this.ethAddress;
        },
        ethAddress() {
            return this.$store.getters.address.replace('Mx', '0x');
        },
        isFiatRampSelected() {
            return this.form.selectedHubNetwork === FIAT_RAMP_NETWORK;
        },
        chainId() {
            let network;
            if (this.isFiatRampSelected) {
                network = fiatRampPurchaseNetwork;
            } else {
                network = this.form.selectedHubNetwork;
            }
            return HUB_CHAIN_DATA[network]?.chainId;
        },
        /** @type {HubChainDataItem} */
        hubChainData() {
            return HUB_CHAIN_BY_ID[this.chainId];
        },
        hubAddress() {
            return this.hubChainData?.hubContractAddress;
        },
        wrappedNativeContractAddress() {
            return this.hubChainData?.wrappedNativeContractAddress;
        },
        externalTokenMainnetSymbol() {
            return this.hubChainData?.coinSymbol;
        },
        externalTokenSymbol() {
            return NETWORK === MAINNET ? this.externalTokenMainnetSymbol : DEPOSIT_COIN_DATA[this.externalTokenMainnetSymbol].testnetSymbol;
        },
        ethFeeImpact() {
            if (!(this.form.amountEth > 0)) {
                return 0;
            }
            return new Big(this.ethTotalFee).div(this.form.amountEth).times(100);
        },
        // only manual deposits considered (fiat top-up not affects it)
        ethToTopUp() {
            let amount = new Big(this.form.amountEth || 0).minus(this.selectedBalance);
            amount = amount.gt(0) ? amount.toString() : 0;
            return amount;
        },
        hubFeeRate() {
            const discountModifier = 1 - this.discount;
            // commission to deposit is taken from external token data (e.g. chainId: 'ethereum')
            return new Big(this.externalToken?.commission || 0.01).times(discountModifier).toString();
        },
        hubFeeRatePercent() {
            return new Big(this.hubFeeRate).times(100).toString();
        },
        // fee to HUB bridge calculated in COIN
        hubFee() {
            const input = this.formAmountAfterGas;
            return new Big(input || 0).times(this.hubFeeRate).toString();
        },
        coinAmountAfterBridge() {
            const input = this.formAmountAfterGas;
            return new Big(input || 0).minus(this.hubFee).toString();
        },
        maxAmount() {
            return this.selectedBalance;
        },
        isCoinApproved() {
            const selectedUnlocked = new Big(this.coinToDepositUnlocked);
            return selectedUnlocked.gt(0) && selectedUnlocked.gt(this.form.amountEth || 0);
        },
        isApproveRequired() {
            return !this.isEthSelected && !this.isCoinApproved;
        },
        suggestionList() {
            if (this.params.coinToGet) {
                return [];
            }
            return [this.$store.getters.BASE_COIN, 'HUB', 'BEE'];
        },
        // stage() {
        //     if (!this.isCoinApproved) {
        //         return TX_APPROVE;
        //     }
        //     return TX_TRANSFER;
        // },
        minterGasCoin() {
            return this.externalTokenSymbol;
        },
        isEstimationErrorVisible() {
            return this.estimationError && !this.isEstimationWaiting;
        },
        currentPrice() {
            if (this.$v.form.$invalid || !this.estimation || this.isEstimationWaiting || this.estimationError) {
                return 0;
            }
            const priceItem = this.priceList.find((item) => item.name === this.externalTokenSymbol.toLowerCase());
            if (!priceItem) {
                return 0;
            }
            const ethPrice = priceItem.value;
            return this.form.amountEth * ethPrice / this.estimation;
        },
        /** @type {Array<SequenceStepItem>} */
        //@TODO
        stepsOrdered() {
            const stages = Object.values(LOADING_STAGE).reverse();
            let result = [];
            stages.forEach((stageName) => {
                if (this.txServiceState.steps[stageName]) {
                    result.push(this.txServiceState.steps[stageName]);
                }
            });

            return result;
        },
        deepLink() {
            // eip-681
            return `ethereum:${this.ethAddress}@${this.chainId}?value=${this.ethToTopUp*1e18}&amount=${this.ethToTopUp}`;
        },
        depositProps() {
            return {
                destinationMinterAddress: this.$store.getters.address,
                accountAddress: this.ethAddress,
                chainId: this.chainId,
                amount: this.form.amountEth,
                tokenSymbol: this.externalTokenSymbol,
                // @TODO maybe use hub data directly from useHubTokenData composable (need handle disable polling gasPrice)
                /** @type Array<HubCoinItem> */
                hubCoinList: this.hubCoinList,
                priceList: this.priceList,
                isDisableUpdateProps: this.isFormSending,
            };
        },
        txServiceProps() {
            return {
                privateKey: this.$store.getters.privateKey,
                accountAddress: this.ethAddress,
                chainId: this.chainId,
                form: this.form,
            };
        },
    },
    watch: {
        'form.selectedHubNetwork': {
            handler() {
                // set valid test data
                if (this.form.selectedHubNetwork === FIAT_RAMP_NETWORK && NETWORK !== MAINNET) {
                    this.form.amountEth = '0.002';
                    this.form.coinToGet = this.$store.getters.BASE_COIN;
                }
            },
        },
        'form.coinToGet': {
            handler() {
                this.watchEstimation();
            },
        },
        coinAmountAfterBridge: {
            handler() {
                this.watchEstimation();
            },
        },
        depositProps: {
            handler(newVal) {
                // disable updating priceList > gasPriceGwei > coinAmountAfterBridge, which will triggers watchEstimation
                if (newVal.isDisableUpdateProps) {
                    return;
                }
                this.setDepositProps(newVal);
                this.setTokenProps(newVal);
            },
            deep: true,
            immediate: true,
        },
        txServiceProps: {
            handler(newVal) {
                this.setTxServiceProps(newVal);
            },
            deep: true,
            immediate: true,
        },
    },
    mounted() {
        this.setDiscountProps({minterAddress: this.$store.getters.address});

        const recoveryJson = window.localStorage.getItem('hub-buy-recovery');
        if (recoveryJson) {
            try {
                const recovery = JSON.parse(recoveryJson);
                if (recovery?.address === this.$store.getters.address) {
                    this.recovery = Object.freeze(recovery);
                }
            } catch (error) {
                console.log(error);
            }
        }

        timer = setInterval(() => {
            if (this.isFormSending) {
                return;
            }
            this.updateTokenBalance();
            this.updateTokenAllowance();
        }, 60 * 1000);
    },
    destroyed() {
        clearInterval(timer);
    },
    methods: {
        pretty,
        prettyPrecise,
        prettyExact,
        prettyRound,
        decreasePrecisionSignificant,
        getExplorerTxUrl,
        getEvmTxUrl,
        shortHashFilter,
        /*
        ensureNetworkData() {
            if (!this.hubCoinList.length || !this.priceList.length) {
                return Promise.all([this.fetchHubTokenList(), this.fetchHubPriceList()]);
            }

            // const uniswapPairPromise = this.uniswapPair ? Promise.resolve() : this.fetchUniswapPair();
            //@TODO handle change to composable (maybe promises should be exposed in web3Allowance?)
            const allowancePromise = this.allowanceRequest && this.allowanceRequest.promiseStatus !== PROMISE_REJECTED ? this.allowanceRequest.promise : this.updateTokenAllowance();

            return Promise.all([/!*uniswapPairPromise, *!/allowancePromise]);
        },
*/
        async recoverPurchase() {
            if (!this.$store.state.onLine) {
                return;
            }
            this.form = this.recovery.form;
            this.txServiceState.steps = this.recovery.steps;
            this.recovery = null;

            // ensure watchers on computed to run (chainId change web3 provider)
            await this.$nextTick();

            //@TODO consider saving old gasPrice to recovery and use it later
            //@TODO check if current gasPrice differ from recovery gasPrice
            //@TODO txs may be forked
            return this.submit({fromRecovery: true});
        },
        fiatRampPurchase() {
            return initRampPurchase({
                userAddress: this.ethAddress,
                swapAmount: toErcDecimals(this.form.amountEth, this.coinDecimals),
            });
        },
        waitEnoughExternalBalance({isTopUpRequired} = {}) {
            const targetAmount = isTopUpRequired ? new Big(this.selectedBalance).plus(this.form.amountEth).toString() : this.form.amountEth;
            // don't show modal if balance already enough
            if (new Big(this.selectedBalance).gte(targetAmount)) {
                return Promise.resolve();
            } else {
                this.addStepData(LOADING_STAGE.WAIT_ETH, {waitAmount: targetAmount});

                const promise = this.waitEnoughTokenBalance(targetAmount);
                waitingCancel = () => {
                    promise.canceler();
                    waitingCancel = null;
                };
                return promise;
            }
        },
        submitConfirm() {
            if (this.isFormSending || !this.$store.state.onLine) {
                return;
            }
            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            if (this.ethToTopUp > 0) {
                // confirm not needed because user action required here
                this.submit();
            } else {
                this.isConfirmModalVisible = true;
            }
        },
        submit({fromRecovery} = {}) {
            if (!this.$store.state.onLine) {
                return;
            }
            if (!fromRecovery && this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            this.isConfirmModalVisible = false;
            this.isFormSending = true;
            this.serverError = '';
            if (!fromRecovery) {
                this.txServiceState.steps = {};
            }

            // fiat recovery only triggered when fiat part is already done and crypto deposited, so no need to make another fiat purchase
            const fiatRampPurchasePromise = this.isFiatRampSelected && !fromRecovery ? this.fiatRampPurchase() : Promise.resolve();

            // don't wait eth if next steps already exists
            const waitEnoughEthPromise = fromRecovery ? Promise.resolve() : this.waitEnoughExternalBalance({isTopUpRequired: this.isFiatRampSelected});

            return Promise.all([fiatRampPurchasePromise, waitEnoughEthPromise/*, this.ensureNetworkData()*/])
                .then(() => this.depositFromEthereum())
                .then((outputAmount) => {
                    return this.sendMinterSwapTx({
                        initialTxParams: {
                            data: {
                                coinToSell: this.externalTokenSymbol,
                                coinToBuy: this.form.coinToGet,
                                valueToSell: outputAmount,
                            },
                        },
                        prepare: () => this.prepareMinterSwapParams(outputAmount),
                    });
                })
                .then((tx) => {
                    this.addStepData(LOADING_STAGE.FINISH, {coin: this.form.coinToGet, amount: tx.result.returnAmount, finished: true}, true);

                    this.$emit('success');

                    this.$v.$reset();
                    // reset form
                    this.form.amountEth = '';
                    this.form.coinToGet = '';
                    this.form.amountToGet = '';
                    this.estimation = null;

                    // don't close modal, it will be closed by user click on 'Close' button
                    // this.finishSending();
                })
                .catch((error) => {
                    if (!error.isCanceled) {
                        this.serverError = getErrorText(error);
                        // Error returned when rejected
                        console.error(error);
                    } else {
                        console.debug(error);
                    }

                    // don't close modal, user will decide if he wants retry or finish
                    if (this.currentLoadingStage === LOADING_STAGE.WAIT_ETH) {
                        // only close for WAIT_ETH because there is no recovery for such loadingStage
                        this.finishSending();
                    }
                });
        },
        retrySending() {
            // @TODO not working: remove errored tx from steps (e.g. underpriced)
            this.submit({fromRecovery: true});
        },
        finishSending() {
            this.isFormSending = false;
            if (typeof waitingCancel === 'function') {
                waitingCancel();
            }
            this.txServiceState.steps = {};
            window.localStorage.removeItem('hub-buy-recovery');
        },
        /*
        sendWrapTx({nonce, gasPrice} = {}) {
            return this.sendEthTx({
                to: WETH_CONTRACT_ADDRESS,
                value: this.formAmountAfterGas,
                data: wethDepositAbiData,
                nonce,
                gasPrice,
                gasLimit: GAS_LIMIT_WRAP,
            }, LOADING_STAGE.WRAP_ETH);
        },
*/
        unwrapToNativeCoin({nonce, gasPrice} = {}) {
            const amountToUnwrap = toErcDecimals(this.amountToUnwrap, this.coinDecimals);
            const data = AbiEncoder(wethAbi)('withdraw', amountToUnwrap);
            return this.sendEthTx({
                to: this.wrappedNativeContractAddress,
                data,
                nonce,
                gasPrice,
                gasLimit: GAS_LIMIT_UNWRAP,
            }, LOADING_STAGE.UNWRAP_ETH);
            // .then((hash) => {
            //     this.waitUnwrapConfirmation = true;
            //
            //     return hash;
            // });
        },
        sendApproveTx({nonce, gasPrice} = {}) {
            let amountToUnlock = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
            let data = AbiEncoder(erc20ABI)('approve', this.hubAddress, amountToUnlock);

            return this.sendEthTx({to: this.coinContractAddress, data, nonce, gasPrice, gasLimit: GAS_LIMIT_UNLOCK}, LOADING_STAGE.APPROVE_BRIDGE);
        },
        sendCoinTx({nonce}) {
            const address = Buffer.concat([Buffer.alloc(12), Buffer.from(web3Utils.hexToBytes(this.$store.getters.address.replace("Mx", "0x")))]);
            const destinationChain = Buffer.from('minter', 'utf-8');
            let txParams;
            if (this.isEthSelected) {
                txParams = {
                    value: this.formAmountAfterGas,
                    data: AbiEncoder(hubABI)(
                        'transferETHToChain',
                        destinationChain,
                        address,
                        0,
                    ),
                };
            } else {
                txParams = {
                    data: AbiEncoder(hubABI)(
                        'transferToChain',
                        destinationChain,
                        address,
                        toErcDecimals(this.formAmountAfterGas, this.coinDecimals),
                        0,
                    ),
                };
            }

            return this.sendEthTx({
                to: this.hubAddress,
                ...txParams,
                nonce,
                gasLimit: GAS_LIMIT_BRIDGE,
            }, LOADING_STAGE.SEND_BRIDGE);
        },
        speedup({txParams, loadingStage}) {
            return this.sendEthTx(txParams, loadingStage, true);
        },
        prepareMinterSwapParams(amount) {
            const coinBalanceItem = this.$store.state.balance.find((item) => item.coin.symbol === this.externalTokenSymbol);
            const balanceAmount = coinBalanceItem?.amount || 0;
            const smallAmount = DEPOSIT_COIN_DATA[this.externalTokenMainnetSymbol].smallAmount;
            // sell all externalTokenSymbol if user has no or very small amount of it
            const isSellAll = balanceAmount - amount < smallAmount;

            return this.forceEstimation({sellAll: isSellAll})
                .then(() => {
                    return {
                        type: isSellAll ? TX_TYPE.SELL_ALL_SWAP_POOL : TX_TYPE.SELL_SWAP_POOL,
                        data: {
                            coins: this.estimationRoute
                                ? this.estimationRoute.map((coin) => coin.id)
                                : [this.externalTokenSymbol, this.form.coinToGet],
                            valueToSell: amount,
                            minimumValueToBuy: 0,
                        },
                        gasCoin: this.minterGasCoin,
                    };
                });
        },
        watchEstimation() {
            if (!this.$store.state.onLine) {
                return;
            }
            if (this.$v.form.$invalid) {
                return;
            }
            this.getEstimation();
        },
        getEstimation(params) {
            if (!this.$store.state.onLine) {
                return;
            }
            if (this.$v.form.$invalid) {
                return;
            }

            return this.estimateSwap({
                coinToSell: this.externalTokenSymbol,
                valueToSell: this.coinAmountAfterBridge,
                coinToBuy: this.form.coinToGet,
                swapFrom: SWAP_TYPE.POOL,
                gasCoin: this.minterGasCoin,
                isSelling: true,
                ...params,
            });
        },
        forceEstimation({sellAll} = {}) {
            return this.getEstimation({sellAll, force: true});
        },
        cancelRecovery() {
            this.recovery = null;
            window.localStorage.removeItem('hub-buy-recovery');
        },
    },
};


</script>

<template>
    <div>
        <div class="u-grid u-grid--vertical-margin--small" v-if="recovery">
            <div class="u-cell u-text-center">{{ $td('You have unfinished purchase, do you want to continue?', 'form.unfinished-purchase') }}</div>
            <div class="u-cell">
                <button class="button button--main button--full" type="button" @click="recoverPurchase()">{{ $td('Continue', 'common.continue') }}</button>
            </div>
            <div class="u-cell">
                <button class="button button--ghost button--full" type="button" @click="cancelRecovery()">{{ $td('Cancel', 'form.submit-cancel-button') }}</button>
            </div>
        </div>

        <template v-else>
            <form @submit.prevent="submitConfirm()">
                <div class="form-row">
                    <FieldSelect
                        v-model="form.selectedHubNetwork"
                        :label="$td('Select network', 'form.select-network')"
                        :suggestion-list="[
                            /*
                            {
                                value: $options.FIAT_RAMP_NETWORK,
                                name: 'Bank card',
                                shortName: 'Bank card',
                                icon: `/img/icon-network-fiat.svg`,
                            },
                            */
                            {
                                value: $options.HUB_CHAIN_ID.ETHEREUM,
                                name: $options.HUB_CHAIN_DATA[$options.HUB_CHAIN_ID.ETHEREUM].name,
                                shortName: $options.HUB_CHAIN_DATA[$options.HUB_CHAIN_ID.ETHEREUM].shortName,
                                icon: `/img/icon-network-${$options.HUB_CHAIN_ID.ETHEREUM}.svg`,
                            },
                            {
                                value: $options.HUB_CHAIN_ID.BSC,
                                name: $options.HUB_CHAIN_DATA[$options.HUB_CHAIN_ID.BSC].name,
                                shortName: $options.HUB_CHAIN_DATA[$options.HUB_CHAIN_ID.BSC].shortName,
                                icon: `/img/icon-network-${$options.HUB_CHAIN_ID.BSC}.svg`,
                            },
                        ]"
                    />
                </div>
                <div class="form-row">
                    <FieldCombined
                        :coin="externalTokenSymbol"
                        :fallback-to-full-list="false"
                        :amount.sync="form.amountEth"
                        :$amount="$v.form.amountEth"
                        :label="$td('You spend', 'form.you-spend')"
                        :max-value="maxAmount"
                        @blur="handleInputBlur(); $v.form.buyAmount.$touch()"
                    />
                    <span class="form-field__error" v-if="$v.form.amountEth.$dirty && !$v.form.amountEth.required">{{ $td('Enter amount', 'form.enter-amount') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.amountEth.$dirty && (!$v.form.amountEth.validAmount || !$v.form.amountEth.minValue)">{{ $td('Invalid amount', 'form.invalid-amount') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.amountEth.$dirty && !$v.form.amountEth.enoughToPayFee">{{ $td('Not enough to pay fee', 'form.not-enough-to-pay-fee') }}</span>
                    <!--                        <span class="form-field__error" v-else-if="$v.form.amountEth.$dirty && !$v.form.amountEth.maxValue">{{ $td('Not enough', 'form.not-enough') }} {{ form.coinToGet }} ({{ $td('max.', 'form.max') }} {{ pretty(maxAmount) }})</span>-->
                </div>
                <div class="form-row">
                    <FieldCombined
                        :coin.sync="form.coinToGet"
                        :$coin="$v.form.coinToGet"
                        :amount="decreasePrecisionSignificant(form.coinToGet && estimation ? estimation : 0)"
                        :label="$td('You receive', 'form.you-receive')"
                        :coin-list="suggestionList"
                        :fallback-to-full-list="false"
                        :is-estimation="true"
                        :isLoading="isEstimationWaiting"
                        @blur="handleInputBlur(); $v.form.buyAmount.$touch()"
                    />

                    <span class="form-field__error" v-if="$v.form.coinToGet.$dirty && !$v.form.coinToGet.required">{{ $td('Enter coin symbol', 'form.enter-coin-symbol') }}</span>
                    <span class="form-field__error" v-else-if="$v.form.coinToGet.$dirty && !$v.form.coinToGet.minLength">{{ $td('Min. 3 characters', 'form.min-3-chars') }}</span>
                    <!--                        <span class="form-field__error" v-else-if="$v.form.coinToGet.$dirty && !$v.form.coinToGet.supported">{{ $td('Not supported to buy', 'form.not-supported-to-buy') }}</span>-->

                    <div class="u-text-center u-text-small u-fw-400 u-text-muted u-mt-10" v-if="!isEstimationErrorVisible">
                        {{ $td('The final amount depends on the exchange rate at the moment of transaction.', 'form.swap-confirm-note') }}
                    </div>
                    <span class="form-field__error u-text-center u-mt-10" v-else>{{ estimationError }}</span>
                </div>

                <div class="estimation form-row form__error" v-if="serverError">
                    {{ serverError }}
                </div>
                <div class="estimation form-row" v-else>
                    <h3 class="estimation__title">{{ $td('Estimated price', 'form.swap-confirm-price-estimation') }}</h3>
                    <div class="estimation__item">
                        <div class="estimation__coin">
                            <div class="estimation__coin-symbol">
                                <template v-if="form.coinToGet">{{ form.coinToGet }}</template>
                                <template v-else>Coin</template>
                                rate
                            </div>
                        </div>
                        <div class="estimation__value">≈ ${{ pretty(currentPrice) }}</div>
                    </div>
                </div>


                <button
                    type="submit"
                    class="form-row button button--main button--full"
                    :class="{'is-loading': isFormSending, 'is-disabled': ($v.$invalid || !$store.state.onLine)}"
                >
                    <span class="button__content">{{ $td('Buy', 'form.buy-button') }}</span>
                    <Loader class="button__loader" :isLoading="true"/>
                </button>

                <p class="form-row u-text-center u-text-muted u-text-small">{{ $td('By clicking this button, you confirm that you’ve read and understood the disclaimer in the footer.', 'form.read-understood') }}</p>
            </form>

            <!--
            <div class="u-grid u-grid--small u-grid--vertical-margin--small">
                <div class="u-cell u-cell--large--1-4 u-cell--small--1-2">
                    <div class="form-field form-field--dashed">
                        <div class="form-field__input is-not-empty">≈{{ pretty(ethTotalFee) }} {{externalTokenSymbol}}</div>
                        <div class="form-field__label">{{ $td('Ethereum fee', 'form.ethereum-fee') }}</div>
                    </div>
                </div>
                <div class="u-cell u-cell--large--1-4 u-cell--small--1-2">
                    <div class="form-field form-field--dashed">
                        <div class="form-field__input is-not-empty">{{ pretty(ethToSwap) }} {{externalTokenSymbol}}</div>
                        <div class="form-field__label">{{externalTokenSymbol}} to swap</div>
                    </div>
                </div>
                <div class="u-cell u-cell--large--1-4 u-cell--small--1-2">
                    <div class="form-field form-field--dashed">
                        <div class="form-field__input is-not-empty">≈{{ pretty(uniswapEstimation.price) }} {{ coinEthereumName }}</div>
                        <div class="form-field__label">{{externalTokenSymbol}} rate</div>
                    </div>
                </div>
                <div class="u-cell u-cell--large--1-4 u-cell--small--1-2">
                    <div class="form-field form-field--dashed">
                        <div class="form-field__input is-not-empty">≈{{ pretty(uniswapEstimation.output) }} {{ coinEthereumName }}</div>
                        <div class="form-field__label">Uniswap output</div>
                    </div>
                </div
                <div class="u-cell u-cell--large--1-4 u-cell--small--1-2">
                    <div class="form-field form-field--dashed">
                        <div class="form-field__input is-not-empty">≈{{ pretty(coinAmountAfterBridge) }} {{ externalTokenSymbol }}</div>
                        <span class="form-field__label">{{ $td('Bridge output', 'form.bridge-output') }}</span>
                    </div>
                </div>
                <div class="u-cell u-cell--large--1-4 u-cell--small--1-2">
                    <div class="form-field form-field--dashed">
                        <div class="form-field__input is-not-empty">≈{{ pretty(hubFee) }} {{ externalTokenSymbol }}</div>
                        <span class="form-field__label">
                                {{ $td('Bridge fee', 'form.bridge-fee') }}
                                ({{ prettyRound(hubFeeRate * 100) }}%)
                            </span>
                    </div>
                </div>

                <div class="u-cell u-cell&#45;&#45;large&#45;&#45;1-4 u-cell&#45;&#45;small&#45;&#45;1-2">
                    <div class="form-field form-field&#45;&#45;dashed">
                        <div class="form-field__input is-not-empty">{{ prettyPrecise(ethBalance) }}</div>
                        <div class="form-field__label">{{ $td('ETH balance', 'form.buy-eth-balance') }}</div>
                    </div>
                </div>
                <div class="u-cell u-cell&#45;&#45;large&#45;&#45;1-4 u-cell&#45;&#45;small&#45;&#45;1-2">
                    <div class="form-field form-field&#45;&#45;dashed">
                        <div class="form-field__input is-not-empty">{{ prettyPrecise(coinToDepositBalance) }}</div>
                        <div class="form-field__label">{{ externalTokenSymbol }} {{ $td('balance', 'form.buy-deposit-balance') }}</div>
                    </div>
                </div>
            </div>
            -->
        </template>

        <!-- Confirm modal -->
        <Modal :isOpen.sync="isConfirmModalVisible">
            <h2 class="u-h3 form-row">
                {{ $td('Buy', 'form.buy-button') }} {{ form.coinToGet }}
            </h2>

            <div class="estimation form-row">
                <h3 class="estimation__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                <BaseAmountEstimation :coin="externalTokenSymbol" :amount="form.amountEth" format="exact"/>

                <h3 class="estimation__title">{{ $td('You will get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                <BaseAmountEstimation :coin="form.coinToGet" :amount="estimation" format="approx"/>

                <h3 class="estimation__title">{{ $td('Estimated price', 'form.swap-confirm-price-estimation') }}</h3>
                <div class="estimation__item">
                    <div class="estimation__coin">
                        <div class="estimation__coin-symbol">{{ form.coinToGet }} rate</div>
                    </div>
                    <div class="estimation__value">≈ ${{ pretty(currentPrice) }}</div>
                </div>
            </div>

            <!--
            <div class="form-row">
                <div class="form-field form-field--dashed">
                    <BaseAmount class="form-field__input is-not-empty" :coin="externalTokenSymbol" :amount="ethTotalFee"/>
                    <div class="form-field__label">{{ $td('Ethereum fee', 'form.ethereum-fee') }}</div>
                </div>
            </div>
            -->

            <div class="form-row u-fw-700" v-if="ethFeeImpact > 10">
                <span class="u-emoji">⚠️</span>
                {{ $td(`High ${hubChainData.shortName} fee, it will consume`, 'form.high-eth-fee', {network: hubChainData.shortName}) }}
                {{ prettyRound(ethFeeImpact) }}%
                {{ $td(`of your ${externalTokenSymbol}`, 'form.high-eth-fee-percentage', {symbol: externalTokenSymbol}) }}
            </div>

            <div class="form-row">
                <button
                    class="button button--main button--full" type="button" data-focus-on-open
                    @click="submit()"
                >
                    {{ $td('Confirm', 'form.submit-confirm-button') }}
                </button>
                <button class="button button--ghost-main button--full u-mt-05" type="button" @click="isConfirmModalVisible = false">
                    {{ $td('Cancel', 'form.submit-cancel-button') }}
                </button>
            </div>
        </Modal>

        <!-- Loading modal -->
        <Modal :isOpen.sync="isFormSending" :disable-outside-click="true">
            <h2 class="u-h3 u-mb-10">
                <template v-if="currentLoadingStage === $options.LOADING_STAGE.WAIT_ETH">
                    <Loader class="hub__buy-title-loader" :is-loading="true"/>
                    <template v-if="!isFiatRampSelected">
                        {{ $td(`Waiting ${externalTokenSymbol} deposit`, 'form.eth-waiting', {symbol: externalTokenSymbol}) }}
                    </template>
                    <template v-else>
                        {{ $td(`Waiting ${externalTokenSymbol} purchase`, 'form.eth-purchase-waiting', {symbol: externalTokenSymbol}) }}
                    </template>
                </template>
                <template v-else-if="currentLoadingStage === $options.LOADING_STAGE.FINISH">
                    {{ $td('Success', 'form.success-title') }}!
                </template>
                <template v-else>{{ $td('Buy', 'form.buy-button') }} {{ form.coinToGet }}</template>
            </h2>

            <template v-if="currentLoadingStage === $options.LOADING_STAGE.WAIT_ETH">
                <template v-if="!isFiatRampSelected">
                    <div class="form-row">
                        <div class="form-field form-field--dashed form-field--with-icon">
                            <div class="form-field__input is-not-empty">{{ prettyExact(ethToTopUp) }} {{ externalTokenSymbol }}</div>
                            <span class="form-field__label">{{ $td('Send', 'form.wallet-send-button') }}</span>
                            <ButtonCopyIcon class="form-field__icon form-field__icon--copy" :copy-text="ethToTopUp.toString()"/>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field form-field--dashed form-field--with-icon">
                            <div class="form-field__input is-not-empty">{{ ethAddress }}</div>
                            <span class="form-field__label">{{ $td('To the address', 'form.to-address') }}</span>
                            <ButtonCopyIcon class="form-field__icon form-field__icon--copy" :copy-text="ethAddress"/>
                        </div>
                    </div>
                    <div class="form-row u-fw-700" v-if="ethFeeImpact > 10">
                        <span class="u-emoji">⚠️</span>
                        {{ $td(`High ${hubChainData.shortName} fee, it will consume`, 'form.high-eth-fee', {network: hubChainData.shortName}) }}
                        {{ prettyRound(ethFeeImpact) }}%
                        {{ $td(`of your ${externalTokenSymbol}`, 'form.high-eth-fee-percentage', {symbol: externalTokenSymbol}) }}
                    </div>
                    <div class="form-row">
                        <QrcodeVue class="u-mb-10 u-text-center" :value="deepLink" :size="160" level="L"/>
                        <a class="link--default u-text-wrap" :href="deepLink" target="_blank">Open in external wallet</a>
                    </div>
                    <!--                    <div class="" v-if="ethBalance > 0">
                        <div class="form-field__input is-not-empty">{{ prettyExact(ethBalance) }} {{externalTokenSymbol}}</div>
                            <span class="form-field__label">{{ $td('Current balance', 'form.current-balance') }}</span>

                           <div class="form-field__input is-not-empty">{{ prettyExact(form.amountEth) }} {{externalTokenSymbol}}</div>
                           <span class="form-field__label">{{ $td('Required balance', 'form.required-balance') }}</span>
                    </div>-->
                </template>
                <div class="form-row">
                    <button class="button button--ghost-main button--full" type="button" @click="finishSending()">
                        {{ $td('Cancel', 'form.submit-cancel-button') }}
                    </button>
                </div>
            </template>
            <HubBuyTxListItem
                v-else
                class="hub__buy-stage form-row"
                v-for="item in stepsOrdered"
                :key="item.loadingStage"
                :step="item"
                :loadingStage="item.loadingStage"
            />
            <div class="form-row" v-if="serverError || !$store.state.onLine">
                <div class="u-grid u-grid--small u-grid--vertical-margin--small">
                    <div class="u-cell form__error">
                        <template v-if="!$store.state.onLine">{{ $td('No Internet connection', 'error.no-internet-connection') }}</template>
                        <template v-else>{{ serverError }}</template>
                    </div>
                    <div class="u-cell u-cell--1-2">
                        <button class="button button--main button--full" type="button" :class="{'is-disabled': !$store.state.onLine}" @click="retrySending()">
                            {{ $td('Retry', 'common.retry') }}
                        </button>
                    </div>
                    <div class="u-cell u-cell--1-2">
                        <button class="button button--ghost button--full" type="button" @click="finishSending()">
                            {{ $td('Finish', 'common.finish') }}
                        </button>
                    </div>
                </div>
                <HubBuySpeedup :steps-ordered="stepsOrdered" @speedup="speedup($event)"/>
            </div>
            <div class="form-row u-text-medium u-fw-500" v-if="currentLoadingStage !== $options.LOADING_STAGE.WAIT_ETH && currentLoadingStage !== $options.LOADING_STAGE.FINISH">
                <span class="u-emoji">⚠️</span> {{ $td('Please keep this page active, otherwise progress may&nbsp;be&nbsp;lost.', 'index.keep-page-active') }}
            </div>
            <div class="form-row" v-if="currentLoadingStage === $options.LOADING_STAGE.FINISH">
                <button class="button button--ghost-main button--full" type="button" @click="finishSending(); $emit('success-modal-close')">
                    {{ $td('Close', 'common.close') }}
                </button>
            </div>
        </Modal>
    </div>
</template>
