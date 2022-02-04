<script>
import axios from 'axios';
import QrcodeVue from 'qrcode.vue';
import {validationMixin} from 'vuelidate';
import required from 'vuelidate/lib/validators/required.js';
import maxValue from 'vuelidate/lib/validators/maxValue.js';
import minLength from 'vuelidate/lib/validators/minLength.js';
import withParams from 'vuelidate/lib/withParams.js';
import { ChainId, Token, WETH as WETH_TOKEN_DATA, Fetcher, Route, Trade, TokenAmount, TradeType } from '@uniswap/sdk';
import IUniswapV2Router from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';
import {CloudflareProvider, JsonRpcProvider} from '@ethersproject/providers';
import autosize from 'v-autosize';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {convertFromPip} from 'minterjs-util/src/converter.js';
import * as web3 from '@/api/web3.js';
import {fromErcDecimals, subscribeTransaction, toErcDecimals} from '@/api/web3.js';
import {getOracleCoinList, getOraclePriceList, subscribeTransfer} from '@/api/hub.js';
import {getTransaction} from '@/api/explorer.js';
import {estimateCoinSell, postTx} from '@/api/gate.js';
import Big from '~/assets/big.js';
import {pretty, prettyPrecise, prettyRound, prettyExact, decreasePrecisionSignificant, getExplorerTxUrl, getEvmTxUrl, shortHashFilter} from '~/assets/utils.js';
import erc20ABI from '~/assets/abi-erc20.js';
import hubABI from '~/assets/abi-hub.js';
import wethAbi from '~/assets/abi-weth.js';
import debounce from '~/assets/lodash5-debounce.js';
import {NETWORK, MAINNET, ETHEREUM_CHAIN_ID, ETHEREUM_API_URL, BSC_CHAIN_ID, BSC_API_URL, HUB_TRANSFER_STATUS, SWAP_TYPE, HUB_BUY_STAGE as LOADING_STAGE, WETH_CONTRACT_ADDRESS, HUB_CHAIN_DATA, HUB_CHAIN_ID, HUB_CHAIN_BY_ID} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import checkEmpty from '~/assets/v-check-empty.js';
import useHubDiscount from '@/composables/use-hub-discount.js';
import BaseAmountEstimation from '@/components/base/BaseAmountEstimation.vue';
import Loader from '~/components/base/BaseLoader.vue';
import Modal from '@/components/base/Modal.vue';
import ButtonCopyIcon from '~/components/base/ButtonCopyIcon.vue';
import FieldCombined from '~/components/base/FieldCombined.vue';
import FieldSelect from '~/components/base/FieldSelect.vue';
import HubBuyTxListItem from '@/components/HubBuyTxListItem.vue';
import HubBuySpeedup from '@/components/HubBuySpeedup.vue';


const uniswapV2Abi = IUniswapV2Router.abi;

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

let estimationCancel;
let waitingCancel;
const CANCEL_MESSAGE = 'Canceled';

//@TODO timer2 triggers watchEstimation
let timer;
let timer2;

function coinContract(coinContractAddress) {
    return new web3.eth.Contract(erc20ABI, coinContractAddress);
}

const wethContract = new web3.eth.Contract(wethAbi, WETH_CONTRACT_ADDRESS);
const wethDepositAbiData = wethContract.methods.deposit().encodeABI();

const wethToken = WETH_TOKEN_DATA[ETHEREUM_CHAIN_ID];
const DEPOSIT_COIN_DATA = {
    ETH: {
        testnetSymbol: 'TESTWETH',
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

        return Promise.all([getOracleCoinList(), getOraclePriceList()])
            .then(([coinList, priceList]) => {
                this.hubCoinList = Object.freeze(coinList);
                this.priceList = Object.freeze(priceList);
            })
            // wait for computed coinContractAddress to recalculate
            .then(() => wait(1))
            .then(() => Promise.all([
                this.updateBalance(),
                this.getAllowance(),
                // this.fetchUniswapPair(),
            ]));
    },
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
        const { discount, discountProps, discountUpsidePercent } = useHubDiscount();

        return {
            discount,
            discountProps,
            discountUpsidePercent,
        };
    },
    data() {
        return {
            balances: {},
            uniswapPair: null,
            balanceRequest: null,
            coinToDepositUnlocked: 0,
            allowanceRequest: null,
            form: {
                selectedHubNetwork: HUB_CHAIN_ID.ETHEREUM,
                amountEth: '',
                coinToGet: this.params.coinToGet?.toUpperCase() || '',
                amountToGet: '',
            },
            /** @type Array<HubCoinItem> */
            hubCoinList: [],
            priceList: [],
            steps: {},
            loadingStage: '',
            isFormSending: false,
            serverError: '',
            isConfirmModalVisible: false,
            recovery: null,

            // just `estimation` refers to minter swap estimation
            estimation: null,
            estimationRoute: null,
            isEstimationLoading: false,
            estimationError: false,
            isEstimationPending: false,
            debouncedGetEstimation: null,
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
        chainId() {
            return HUB_CHAIN_DATA[this.form.selectedHubNetwork]?.chainId;
        },
        hubChainData() {
            return HUB_CHAIN_BY_ID[this.chainId];
        },
        hubAddress() {
            return this.hubChainData?.hubContractAddress;
        },
        wrappedNativeContractAddress() {
            return this.hubChainData?.wrappedNativeContractAddress;
        },
        externalTokenSymbol() {
            return this.hubChainData?.coinSymbol;
        },
        externalToken() {
            const coinItem = this.hubCoinList.find((item) => item.symbol === this.externalTokenSymbol);
            return coinItem?.[this.hubChainData?.hubChainId];
        },
        isEthSelected() {
            return (this.coinContractAddress || '').toLowerCase() === this.wrappedNativeContractAddress;
        },
        // @TODO gasPrice not updated during isFormSending and may be too low/high after waiting pin gasPrice on submit
        // @TODO use *network*_fee instead of 'prices'
        ethGasPriceGwei() {
            const priceItem = this.priceList.find((item) => item.name === `${this.selectedHubNetwork}/gas`);
            let gasPriceGwei;
            if (!priceItem) {
                gasPriceGwei = 100;
            } else {
                gasPriceGwei = priceItem.value;
            }

            return NETWORK === MAINNET ? gasPriceGwei : gasPriceGwei * 10;
        },
        ethTotalFee() {
            const unwrapGasLimit = this.isUnwrapRequired ? GAS_LIMIT_UNWRAP : 0;
            const unlockGasLimit = this.isApproveRequired ? GAS_LIMIT_UNLOCK : 0;
            const totalGasLimit = /*GAS_LIMIT_SWAP + */unwrapGasLimit + unlockGasLimit + GAS_LIMIT_BRIDGE;
            // gwei to ether
            const gasPrice = web3.utils.fromWei(web3.utils.toWei(this.ethGasPriceGwei.toString(), 'gwei'), 'ether');

            return new Big(gasPrice).times(totalGasLimit).toString();
        },
        ethFeeImpact() {
            if (!(this.form.amountEth > 0)) {
                return 0;
            }
            return new Big(this.ethTotalFee).div(this.form.amountEth).times(100);
        },
        ethToTopUp() {
            let amount = new Big(this.form.amountEth || 0).minus(this.selectedBalance);
            amount = amount.gt(0) ? amount.toString() : 0;
            return amount;
        },
        formAmountAfterGas() {
            let amount = new Big(this.form.amountEth || 0).minus(this.ethTotalFee);
            amount = amount.gt(0) ? amount.toString() : 0;
            return amount;
        },
        /*
        ethToSwap() {
            let amount = new Big(this.form.amountEth || 0).minus(this.ethTotalFee);
            amount = amount.gt(0) ? amount.toString() : 0;
            return amount;
        },
        uniswapEstimation() {
            const pair = this.uniswapPair;
            const decimals = this.coinDecimals;
            const amountEth = toErcDecimals(this.ethToSwap, 18);
            if (!pair || !(amountEth > 0)) {
                return {
                    price: 0,
                    output: 0,
                };
            }
            try {
                const route = new Route([pair], wethToken);
                const trade = new Trade(route, new TokenAmount(wethToken, amountEth), TradeType.EXACT_INPUT);
                return {
                    price: trade.executionPrice.toFixed(decimals),
                    output: trade.outputAmount.toFixed(decimals),
                };
            } catch (error) {
                console.log(error);
                return {
                    price: 0,
                    output: 0,
                };
            }
        },
        */
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
            // const input = this.uniswapEstimation?.output;
            const input = this.formAmountAfterGas;
            return new Big(input || 0).times(this.hubFeeRate).toString();
        },
        coinAmountAfterBridge() {
            // const input = this.uniswapEstimation?.output;
            const input = this.formAmountAfterGas;
            return new Big(input || 0).minus(this.hubFee).toString();
        },
        maxAmount() {
            return this.selectedBalance;
        },
        coinEthereumName() {
            return this.externalTokenSymbol;
        },
        coinContractAddress() {
            return this.externalToken?.externalTokenId;
        },
        coinDecimals() {
            return this.externalToken ? Number(this.externalToken.externalDecimals) : undefined;
        },
        isCoinApproved() {
            const selectedUnlocked = new Big(this.coinToDepositUnlocked);
            // uniswap not used anymore
            return selectedUnlocked.gt(0) && selectedUnlocked.gt(this.form.amountEth || 0);
            // compare with large number instead of uniswapEstimation to eliminate circular dependency (uniswapEstimation > isCoinApproved > ethTotalFee > ethToSwap > uniswapEstimation)
            // eslint-disable-next-line no-unreachable
            return selectedUnlocked.gt(1e15);
            // сравниваем эстимейт с запасом
            // return selectedUnlocked.gt(0) && selectedUnlocked.gt(this.uniswapEstimation?.output * 2);
        },
        isApproveRequired() {
            return !this.isEthSelected && !this.isCoinApproved;
        },
        selectedBalance() {
            if (this.isEthSelected) {
                return new Big(this.selectedWrapped).plus(this.selectedNative).toString();
            } else {
                return this.balances[this.chainId]?.[this.externalTokenSymbol] || 0;
            }
        },
        selectedWrapped() {
            if (this.isEthSelected) {
                return this.balances[this.chainId]?.[this.externalTokenSymbol] || 0;
            }

            return 0;
        },
        selectedNative() {
            if (this.isEthSelected) {
                return this.balances[this.chainId]?.[0] || 0;
            }

            return 0;
        },
        amountToUnwrap() {
            const amountToUnwrapMinimum = new Big(this.form.amountEth || 0).minus(this.selectedNative).toString();
            if (amountToUnwrapMinimum <= 0) {
                return 0;
            }
            return /*this.form.isUnwrapAll ? this.selectedWrapped : */amountToUnwrapMinimum;
        },
        /**
         * Disabled sending wrapped ERC-20 WETH directly
         * it may save 5-10k of gas ($1-2), but not worth it, because of complicated codebase and need of native ETH predictions to pay fee
         * @return {boolean}
         */
        isUnwrapRequired() {
            if (!this.isEthSelected) {
                return false;
            }

            return this.amountToUnwrap > 0;
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
        currentEstimation() {
            if (this.$v.form.$invalid || !this.estimation || this.isEstimationWaiting || this.estimationError) {
                return 0;
            }

            return this.estimation;
        },
        isEstimationWaiting() {
            return this.isEstimationPending || this.isEstimationLoading;
        },
        isEstimationErrorVisible() {
            return this.estimationError && !this.isEstimationWaiting;
        },
        currentPrice() {
            if (!this.currentEstimation) {
                return 0;
            }
            const priceItem = this.priceList.find((item) => item.name === this.externalTokenSymbol.toLowerCase());
            if (!priceItem) {
                return 0;
            }
            const ethPrice = priceItem.value;
            return this.form.amountEth * ethPrice / this.currentEstimation;
        },
        stepsOrdered() {
            const stages = Object.values(LOADING_STAGE).reverse();
            let result = [];
            stages.forEach((stageName) => {
                if (this.steps[stageName]) {
                    result.push({step: this.steps[stageName], loadingStage: stageName});
                }
            });

            return result;
        },
        deepLink() {
            // eip-681
            return `ethereum:${this.ethAddress}?value=${this.ethToTopUp*1e18}&amount=${this.ethToTopUp}`;
        },
        whatAffectsBalance() {
            return this.chainId.toString() + this.coinContractAddress;
        },
    },
    watch: {
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
        whatAffectsBalance: {
            handler() {
                if (this.chainId === ETHEREUM_CHAIN_ID) {
                    web3.eth.setProvider(ETHEREUM_API_URL);
                }
                if (this.chainId === BSC_CHAIN_ID) {
                    web3.eth.setProvider(BSC_API_URL);
                }
                this.serverError = '';

                if (this.chainId === ETHEREUM_CHAIN_ID || this.chainId === BSC_CHAIN_ID) {
                    this.updateBalance();
                    this.getAllowance();
                }
            },
        },
    },
    mounted() {
        this.discountProps.minterAddress = this.$store.getters.address;

        this.debouncedGetEstimation = debounce(this.getEstimation, 1000);

        const recoveryJson = window.localStorage.getItem('hub-buy-recovery');
        if (recoveryJson) {
            try {
                const recovery = JSON.parse(recoveryJson);
                if (recovery?.address === this.$store.getters.address) {
                    this.recovery = recovery;
                }
            } catch (error) {
                console.log(error);
            }
        }

        timer = setInterval(() => {
            if (this.isFormSending) {
                return;
            }
            this.updateBalance();
            this.getAllowance();
            // this.fetchUniswapPair();
        }, 60 * 1000);
        timer2 = setInterval(() => {
            if (this.isFormSending) {
                return;
            }
            getOraclePriceList()
                .then((priceList) => {
                    this.priceList = Object.freeze(priceList);
                });
        }, 15 * 1000);
    },
    destroyed() {
        clearInterval(timer);
        clearInterval(timer2);
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
        updateBalance() {
            const chainId = this.chainId;
            const contractAddress = this.coinContractAddress;

            if (!this.coinContractAddress) {
                return Promise.reject();
            }

            if (this.balanceRequest?.contractAddress === contractAddress && this.balanceRequest?.chainId === chainId && this.balanceRequest?.promiseStatus === PROMISE_PENDING) {
                return this.balanceRequest.promise;
            }

            const coinSymbol = this.externalTokenSymbol;
            const decimals = this.coinDecimals;
            const balancePromise = Promise.all([
                coinContract(this.coinContractAddress).methods.balanceOf(this.ethAddress).call(),
                this.isEthSelected ? web3.eth.getBalance(this.ethAddress) : Promise.resolve(),
            ])
                .then(([balance, ethBalance]) => {
                    if (!this.balances[chainId]) {
                        this.$set(this.balances, chainId, {});
                    }
                    this.$set(this.balances[chainId], coinSymbol, fromErcDecimals(balance, decimals));
                    if (ethBalance) {
                        this.$set(this.balances[chainId], 0, web3.utils.fromWei(ethBalance));
                    }
                    if (this.chainId === chainId && this.coinContractAddress === contractAddress) {
                        this.balanceRequest = {
                            chainId,
                            contractAddress,
                            promiseStatus: PROMISE_FINISHED,
                            promise: balancePromise,
                        };
                    }
                })
                .catch((error) => {
                    console.log(error);
                    if (this.chainId === chainId && this.coinContractAddress === contractAddress) {
                        this.balanceRequest = {
                            chainId,
                            contractAddress,
                            promiseStatus: PROMISE_REJECTED,
                            promise: balancePromise,
                        };
                        this.serverError = 'Can\'t get balance';
                    }
                });

            this.balanceRequest = {
                chainId,
                contractAddress,
                promiseStatus: PROMISE_PENDING,
                promise: balancePromise,
            };

            return balancePromise;
        },
        getAllowance() {
            const chainId = this.chainId;
            const contractAddress = this.coinContractAddress;

            if (!this.coinContractAddress) {
                return;
            }
            // allowance not needed for native coins
            if (this.isEthSelected) {
                return;
            }
            if (this.allowanceRequest.contractAddress === contractAddress && this.allowanceRequest.chainId === chainId && this.allowanceRequest?.promiseStatus === PROMISE_PENDING) {
                return this.allowanceRequest.promise;
            }

            const allowancePromise = coinContract(this.coinContractAddress).methods.allowance(this.ethAddress, this.hubAddress).call()
                .then((allowanceValue) => {
                    // @TODO store allowance for each chainId
                    // this.$set(this.allowanceList, selectedCoin, allowanceValue);
                    // coin not changed
                    if (this.chainId === chainId && this.coinContractAddress === contractAddress) {
                        this.coinToDepositUnlocked = fromErcDecimals(allowanceValue, this.coinDecimals);
                        this.allowanceRequest = {
                            chainId,
                            contractAddress,
                            promiseStatus: PROMISE_FINISHED,
                            promise: allowancePromise,
                        };
                    }

                })
                .catch((error) => {
                    console.log(error);
                    // this.$set(this.allowanceList, selectedCoin, null);
                    // coin not changed
                    if (this.chainId === chainId && this.coinContractAddress === contractAddress) {
                        this.coinToDepositUnlocked = 0;
                        this.allowanceRequest = {
                            chainId,
                            contractAddress,
                            promiseStatus: PROMISE_REJECTED,
                            promise: allowancePromise,
                        };
                        this.serverError = 'Can\'t get allowance';
                    }
                });

            this.allowanceRequest = {
                chainId,
                contractAddress,
                promiseStatus: PROMISE_PENDING,
                promise: allowancePromise,
            };

            return allowancePromise;
        },
        fetchUniswapPair() {
            if (!this.coinContractAddress || ! this.coinDecimals) {
                return;
            }
            return _fetchUniswapPair(this.coinContractAddress, this.coinDecimals)
                .then((pair) => {
                    this.uniswapPair = pair;
                });
        },
        ensureNetworkData() {
            if (!this.hubCoinList.length || !this.priceList.length) {
                return this.$fetch();
            }

            // const uniswapPairPromise = this.uniswapPair ? Promise.resolve() : this.fetchUniswapPair();
            const allowancePromise = this.allowanceRequest && this.allowanceRequest.promiseStatus !== PROMISE_REJECTED ? this.allowanceRequest.promise : this.getAllowance();

            return Promise.all([/*uniswapPairPromise, */allowancePromise]);
        },
        async recoverPurchase() {
            if (!this.$store.state.onLine) {
                return;
            }
            this.form = this.recovery.form;
            this.steps = this.recovery.steps;
            this.recovery = null;

            // ensure watchers on computed to run (chainId change web3 provider)
            await this.$nextTick();

            //@TODO consider saving old gasPrice to recovery and use it later
            //@TODO check if current gasPrice differ from recovery gasPrice
            //@TODO txs may be forked
            return this.submit({fromRecovery: true});
        },
        waitEnoughEth() {
            // save request if balance already enough
            if (this.selectedBalance >= this.form.amountEth) {
                return Promise.resolve();
            } else {
                this.loadingStage = LOADING_STAGE.WAIT_ETH;
                return new Promise((resolve, reject) => {
                    let isCanceled = {value: false};
                    waitingCancel = () => {
                        reject(new Error(CANCEL_MESSAGE));
                        isCanceled.value = true;
                        waitingCancel = null;
                    };
                    this._waitEnoughEth(isCanceled).then(resolve).catch(reject);
                });
            }
        },
        _waitEnoughEth(isCanceled) {
            return this.updateBalance()
                .then(() => {
                    // Sending was canceled
                    if (isCanceled.value) {
                        return Promise.reject(new Error(CANCEL_MESSAGE));
                    }
                    if (this.selectedBalance >= this.form.amountEth) {
                        return true;
                    } else {
                        return wait(10000).then(() => this._waitEnoughEth(isCanceled));
                    }
                });
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
                this.steps = {};
            }

            // don't wait eth if next steps already exists
            const waitEnoughEthPromise = fromRecovery ? Promise.resolve() : this.waitEnoughEth();

            return Promise.all([waitEnoughEthPromise, this.ensureNetworkData()])
                .then(() => this.depositFromEthereum())
                .then((transfer) => {
                    if (transfer.status !== HUB_TRANSFER_STATUS.batch_executed) {
                        throw new Error(`Unsuccessful bridge transfer: ${transfer.status}`);
                    }
                    console.log({transfer});
                    return getTransaction(transfer.outTxHash);
                })
                .then((minterTx) => {
                    console.log('minterTx');
                    console.log(minterTx);

                    if (!minterTx.data.list) {
                        throw new Error('Minter tx transfer has invalid data');
                    }
                    const multisendItem = minterTx.data.list.find((item) => item.to === this.$store.getters.address && item.coin.symbol === this.externalTokenSymbol);
                    if (!multisendItem) {
                        throw new Error(`Minter tx transfer does not include ${this.externalTokenSymbol} deposit to the current user`);
                    }

                    const outputAmount = multisendItem.value;
                    this.addStepData(LOADING_STAGE.WAIT_BRIDGE, {amount: outputAmount, tx: minterTx, finished: true});

                    this.loadingStage = LOADING_STAGE.SWAP_MINTER;
                    this.addStepData(LOADING_STAGE.SWAP_MINTER, {coin0: this.externalTokenSymbol, amount0: outputAmount, coin1: this.form.coinToGet});
                    return this.sendMinterSwapTx(outputAmount)
                        .then((tx) => {
                            this.addStepData(LOADING_STAGE.SWAP_MINTER, {tx, amount1: convertFromPip(tx.tags['tx.return']), finished: true});

                            this.loadingStage = LOADING_STAGE.FINISH;
                            this.addStepData(LOADING_STAGE.FINISH, {coin: this.form.coinToGet, amount: convertFromPip(tx.tags['tx.return']), finished: true});
                        });
                })
                .then(() => {
                    this.$v.$reset();
                    // reset form
                    this.form.amountEth = '';
                    this.form.coinToGet = '';
                    this.form.amountToGet = '';

                    // don't close modal, it will be closed by user click on 'Close' button
                    // this.finishSending();
                })
                .catch((error) => {
                    if (error.message !== CANCEL_MESSAGE) {
                        this.serverError = getErrorText(error);
                        // Error returned when rejected
                        console.error(error);
                    }

                    // don't close modal, user will decide if he wants retry or finish
                    if (this.loadingStage === LOADING_STAGE.WAIT_ETH) {
                        // only close for WAIT_ETH because there is no recovery for such loadingStage
                        this.finishSending();
                    }
                });
        },
        retrySending() {
            this.submit({fromRecovery: true});
        },
        finishSending() {
            this.isFormSending = false;
            if (typeof waitingCancel === 'function') {
                waitingCancel();
            }
            this.steps = {};
            window.localStorage.removeItem('hub-buy-recovery');
            // reload everything, because polling was stopped during isFormSending
            this.$fetch();
        },
        async depositFromEthereum() {
            //@TODO properly work with nonce via queue service
            let nonce = await web3.eth.getTransactionCount(this.ethAddress, 'latest');

            // this.loadingStage = LOADING_STAGE.SWAP_ETH;
            // this.addStepData(LOADING_STAGE.SWAP_ETH, {coin0: 'ETH', amount0: this.ethToSwap, coin1: this.coinEthereumName});

            let unwrapPromise;
            if (this.isUnwrapRequired) {
                this.loadingStage = LOADING_STAGE.UNWRAP_ETH;
                this.addStepData(LOADING_STAGE.UNWRAP_ETH, {amount: this.amountToUnwrap});
                this.unwrapToNativeCoin({nonce, gasPrice: this.ethGasPriceGwei});
                unwrapPromise = this.waitPendingStep(LOADING_STAGE.UNWRAP_ETH);
            }

            // const swapPromise = this.sendUniswapTx({nonce, gasPrice: this.ethGasPriceGwei});

            // if `approve` step exists, then process sendApproveTx to ensure it finished
            // if (!this.isCoinApproved || this.steps[LOADING_STAGE.APPROVE_BRIDGE]) {
            //     if (!this.loadingStage) {
            //         this.loadingStage = LOADING_STAGE.APPROVE_BRIDGE;
            //     }
            //     this.addStepData(LOADING_STAGE.APPROVE_BRIDGE, {coin: this.coinEthereumName});
            //     nonce = nonce + 1;
            //     this.sendApproveTx({nonce, gasPrice: this.ethGasPriceGwei + 1});
            // }

            const unwrapReceipt = unwrapPromise ? await unwrapPromise : Promise.resolve({nonce: nonce - 1});
            // const swapReceipt = await swapPromise;
            // const outputAmount = getSwapOutput(swapReceipt);
            // if (!(outputAmount > 0)) {
            //     throw new Error(`Received 0 ${this.coinEthereumName} from uniswap`);
            // }
            // const outputAmountHumanReadable = fromErcDecimals(outputAmount, this.coinDecimals);
            // this.addStepData(LOADING_STAGE.SWAP_ETH, {amount1: outputAmountHumanReadable});

            this.loadingStage = LOADING_STAGE.SEND_BRIDGE;
            this.addStepData(LOADING_STAGE.SEND_BRIDGE, {coin: this.externalTokenSymbol, amount: this.formAmountAfterGas});
            const depositNonce = this.steps[LOADING_STAGE.APPROVE_BRIDGE] ? unwrapReceipt.nonce + 2 : unwrapReceipt.nonce + 1;
            this.sendCoinTx({nonce: depositNonce});
            const depositReceipt = await this.waitPendingStep(LOADING_STAGE.SEND_BRIDGE);

            this.loadingStage = LOADING_STAGE.WAIT_BRIDGE;
            this.addStepData(LOADING_STAGE.WAIT_BRIDGE, {coin: this.externalTokenSymbol /* calculate receive amount? */});
            return subscribeTransfer(depositReceipt.transactionHash);
        },
        sendUniswapTx({nonce, gasPrice} = {}) {
            const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
            const poolAddress = this.uniswapPair.liquidityToken.address;
            const poolContract = new web3.eth.Contract(uniswapV2Abi, poolAddress);
            const amountOutMin = toErcDecimals(new Big(this.uniswapEstimation.output).times(0.97).toString(), this.coinDecimals);
            // console.log('amountOutMin', new Big(this.uniswapEstimation.output).times(0.97).toString(), amountOutMin)
            const deadline = Math.floor(Date.now() / 1000) + 60 * 30; // 30min
            const data = poolContract.methods.swapExactETHForTokens(amountOutMin, [wethToken.address, this.coinContractAddress], this.ethAddress, deadline).encodeABI();

            return this.sendEthTx({to: routerAddress, data, value: this.ethToSwap, nonce, gasPrice, gasLimit: GAS_LIMIT_SWAP}, LOADING_STAGE.SWAP_ETH);
        },
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
        unwrapToNativeCoin({nonce, gasPrice} = {}) {
            const amountToUnwrap = toErcDecimals(this.amountToUnwrap, this.coinDecimals);
            const wrappedNativeContract = new web3.eth.Contract(wethAbi, this.wrappedNativeContractAddress);
            const data = wrappedNativeContract.methods.withdraw(amountToUnwrap).encodeABI();
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
            let data = coinContract(this.coinContractAddress).methods.approve(this.hubAddress, amountToUnlock).encodeABI();

            return this.sendEthTx({to: this.coinContractAddress, data, nonce, gasPrice, gasLimit: GAS_LIMIT_UNLOCK}, LOADING_STAGE.APPROVE_BRIDGE);
        },
        sendCoinTx({nonce}) {
            const address = Buffer.concat([Buffer.alloc(12), Buffer.from(web3.utils.hexToBytes(this.$store.getters.address.replace("Mx", "0x")))]);
            const destinationChain = Buffer.from('minter', 'utf-8');
            const hubContract = new web3.eth.Contract(hubABI, this.hubAddress);
            let txParams;
            if (this.isEthSelected) {
                txParams = {
                    value: this.formAmountAfterGas,
                    data: hubContract.methods.transferETHToChain(
                        destinationChain,
                        address,
                        0,
                    ).encodeABI(),
                };
            } else {
                txParams = {
                    data: hubContract.methods.transferToChain(
                        this.coinContractAddress,
                        destinationChain,
                        address,
                        toErcDecimals(this.formAmountAfterGas, this.coinDecimals),
                        0,
                    ).encodeABI(),
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
        async sendEthTx({to, value, data, nonce, gasPrice, gasLimit}, loadingStage, isSpeedup = false) {
            // @TODO check recovery earlier
            const currentStep = this.steps[loadingStage];
            if (currentStep?.finished) {
                return currentStep.tx;
            } else if (currentStep?.tx && !isSpeedup) {
                return subscribeTransaction(currentStep.tx.hash, {confirmationCount: 0})
                    .then((receipt) => {
                        console.log('subscribeTransaction', receipt);
                        this.addStepData(loadingStage, {tx: receipt, finished: true});
                        return this.steps[loadingStage].tx;
                    });
            }

            nonce = (nonce || nonce === 0) ? nonce : await web3.eth.getTransactionCount(this.ethAddress, 'latest');
            // force estimation to prevent smart contract errors
            const forceGasLimitEstimation = loadingStage === LOADING_STAGE.SEND_BRIDGE && !isSpeedup;
            gasLimit = gasLimit && !forceGasLimitEstimation ? gasLimit : await this.estimateTxGas({to, value, data});
            gasPrice = (gasPrice || this.ethGasPriceGwei || 1).toString();
            const txParams = {
                to,
                value: value ? toErcDecimals(value, 18) : "0x00",
                data,
                nonce,
                gasPrice: web3.utils.toWei(gasPrice, 'gwei'),
                gas: gasLimit,
                chainId: this.chainId,
            };
            console.log('send', txParams);
            const { rawTransaction } = await web3.eth.accounts.signTransaction(txParams, this.$store.getters.privateKey);

            let txHash;
            // @TODO return tx from `steps` so it will have full data, instead of just receipt
            return web3.eth.sendSignedTransaction(rawTransaction)
                .on('transactionHash', (hash) => {
                    txHash = hash;
                    console.log(txHash);
                    const tx = {
                        hash: txHash,
                        timestamp: (new Date()).toISOString(),
                        params: {to, value, data, nonce, gasPrice, gasLimit},
                    };
                    this.addStepData(loadingStage, {tx});
                })
                .on('receipt', (receipt) => {
                    console.log("receipt:", receipt);
                    this.addStepData(loadingStage, {tx: receipt, finished: true});
                })
                // .on('confirmation', function (confirmationNumber, receipt) {
                //     if (confirmationNumber < 2) {
                //         console.log("confirmationNumber:" + confirmationNumber + " receipt:", receipt);
                //     }
                // })
                .on('error', (error) => {
                    console.log(error);
                    this.addStepData(loadingStage, {tx: {hash: txHash, error}});
                });
        },
        estimateTxGas({to, value, data}) {
            const txParams = {
                from: this.ethAddress,
                to,
                value: value ? toErcDecimals(value) : "0x00",
                data,
            };

            return web3.eth.estimateGas(txParams)
                .then((gasLimit) => {
                    if (gasLimit > 1000000) {
                        throw new Error(`Gas limit estimate is too high: ${gasLimit}. Probably tx will be failed.`);
                    }
                    return gasLimit;
                });
        },
        sendMinterSwapTx(amount) {
            return this.forceEstimation()
                .then(() => {
                    const coinBalanceItem = this.$store.state.balance.find((item) => item.coin.symbol === this.externalTokenSymbol);
                    const balanceAmount = coinBalanceItem?.amount || 0;
                    const smallAmount = DEPOSIT_COIN_DATA[this.externalTokenSymbol].smallAmount;

                    let txParams = {
                        // sell all externalTokenSymbol if user has no or very small amount of it
                        type: balanceAmount - amount < smallAmount ? TX_TYPE.SELL_ALL_SWAP_POOL : TX_TYPE.SELL_SWAP_POOL,
                        data: {
                            coins: this.estimationRoute
                                ? this.estimationRoute.map((coin) => coin.id)
                                : [this.externalTokenSymbol, this.form.coinToGet],
                            valueToSell: amount,
                            minimumValueToBuy: 0,
                        },
                        gasCoin: this.externalTokenSymbol,
                    };

                    return postTx(txParams, {privateKey: this.$store.getters.privateKey});
                })
                .then((tx) => {
                    tx = Object.freeze({...tx, timestamp: (new Date()).toISOString()});
                    return tx;
                });
        },
        inputBlur() {
            // force estimation after blur if estimation was delayed
            if (this.debouncedGetEstimation.pending()) {
                this.debouncedGetEstimation.flush();
            }
        },
        watchEstimation() {
            if (!this.$store.state.onLine) {
                return;
            }
            if (this.$v.form.$invalid) {
                return;
            }
            this.debouncedGetEstimation();
            this.isEstimationPending = true;
        },
        getEstimation() {
            this.isEstimationPending = false;
            if (this.isEstimationLoading && typeof estimationCancel === 'function') {
                estimationCancel(CANCEL_MESSAGE);
            }
            if (!this.$store.state.onLine) {
                return;
            }
            if (this.$v.form.$invalid) {
                return;
            }
            this.isEstimationLoading = true;
            this.estimationError = false;
            return estimateCoinSell({
                coinToSell: this.externalTokenSymbol,
                valueToSell: this.coinAmountAfterBridge,
                coinToBuy: this.form.coinToGet,
                swapFrom: SWAP_TYPE.POOL,
                findRoute: true,
                // gasCoin: 0,
            }, {
                cancelToken: new axios.CancelToken((cancelFn) => estimationCancel = cancelFn),
            })
                .then((result) => {
                    this.estimation = result.will_get;
                    this.estimationRoute = result.route;
                    this.isEstimationLoading = false;
                })
                .catch((error) => {
                    if (error.message === CANCEL_MESSAGE) {
                        return;
                    }
                    this.isEstimationLoading = false;
                    this.estimationError = getErrorText(error, 'Estimation error: ');
                });
        },
        forceEstimation() {
            // force new estimation without delay
            this.debouncedGetEstimation();
            return this.debouncedGetEstimation.flush();
        },
        waitPendingStep(loadingStage) {
            if (!this.steps[loadingStage]) {
                return Promise.reject();
            }
            //@TODO store error in tx and reject on it
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    const step = this.steps[loadingStage];
                    const txList = step?.txList || step?.tx ? [step.tx] : [];
                    // reject
                    const erroredTxList = txList.filter((item) => item.error);
                    if (txList.length && erroredTxList.length === txList.length) {
                        if (txList.length > 1) {
                            reject(txList.slice().sort((a, b) => b.gasPrice - a.gasPrice)[0].error);
                        } else {
                            reject(txList[0].error);
                        }
                        clearInterval(interval);
                        return;
                    }
                    // resolve
                    const finishedTx = txList.find((item) => item.blockHash);
                    if (finishedTx) {
                        resolve(finishedTx);
                        clearInterval(interval);
                    }
                }, 1000);
            });
        },
        addStepData(loadingStage, data) {
            let {tx: newTx, ...otherData} = data;
            let txData;
            if (newTx) {
                const step = this.steps[loadingStage];
                let txList = step?.txList || step?.tx ? [step.tx] : [];
                const oldMatchingTxIndex = txList.findIndex((item) => {
                    const newTxHash = newTx.hash || newTx.transactionHash;
                    return item?.hash === newTxHash;
                });
                if (oldMatchingTxIndex > -1) {
                    newTx = {...txList[oldMatchingTxIndex], ...newTx};
                }
                if (data.finished) {
                    txList = [newTx];
                } else if (oldMatchingTxIndex > -1) {
                    txList[oldMatchingTxIndex] = newTx;
                } else {
                    txList.push(newTx);
                }
                if (txList.length > 1) {
                    const fastestTx = txList.slice().sort((a, b) => b.params?.gasPrice - a.params?.gasPrice)[0];
                    txData = {
                        txList,
                        tx: fastestTx,
                    };
                } else if (txList.length === 1) {
                    txData = {
                        tx: txList[0],
                        // it overwrite old value
                        txList: undefined,
                    };
                }
            }
            this.$set(this.steps, loadingStage, Object.freeze({...this.steps[loadingStage], ...txData, ...otherData}));
            const needSaveRecovery = loadingStage !== LOADING_STAGE.FINISH;
            console.log({loadingStage, needSaveRecovery}, {...this.steps[loadingStage], ...txData, ...otherData});
            if (needSaveRecovery) {
                window.localStorage.setItem('hub-buy-recovery', JSON.stringify({
                    steps: this.steps,
                    form: this.form,
                    address: this.$store.getters.address,
                }));
            } else {
                window.localStorage.removeItem('hub-buy-recovery');
            }
        },
        cancelRecovery() {
            this.recovery = null;
            window.localStorage.removeItem('hub-buy-recovery');
        },
    },
};

function wait(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

function _fetchUniswapPair(coinContractAddress, coinDecimals) {
    // const token = new Token(ETHEREUM_CHAIN_ID, '0xdbc941fec34e8965ebc4a25452ae7519d6bdfc4e', 6)
    const token = new Token(ETHEREUM_CHAIN_ID, coinContractAddress, coinDecimals);
    const provider = NETWORK === MAINNET ? new CloudflareProvider('homestead') : new JsonRpcProvider(ETHEREUM_API_URL, 'ropsten');

    return Fetcher.fetchPairData(token, wethToken, provider)
        .then((pair) => {
            return Object.freeze(pair);
        });
}

function getSwapOutput(receipt) {
    const logIndex = 5 - 1;
    const dataIndex = 3 - 1;
    const amount0StartIndex = 2 + 64 * dataIndex;
    const amount1StartIndex = 2 + 64 * (dataIndex + 1);
    // @TODO logs pruned from tx for now to save storage space
    const amount0OutHex = receipt.logs[logIndex].data.slice(amount0StartIndex, amount0StartIndex + 64);
    const amount1OutHex = receipt.logs[logIndex].data.slice(amount1StartIndex, amount1StartIndex + 64);
    const amount0Out = web3.eth.abi.decodeParameter('uint256', '0x' + amount0OutHex);
    const amount1Out = web3.eth.abi.decodeParameter('uint256', '0x' + amount1OutHex);

    // received coin maybe 0 or 1, depending on position in uniswap pair
    return Math.max(amount0Out, amount1Out);
}
</script>

<template>
    <div>
        <h1 class="u-h3 u-mb-10">
            <!-- @TODO get title from card -->
            {{ params.coinToGet ? `Buy ${params.coinToGet} with ETH` : action.title }}
        </h1>

        <div class="u-grid u-grid--small u-grid--vertical-margin--small" v-if="recovery">
            <div class="u-cell">{{ $td('You have unfinished purchase, do you want to continue?', 'form.unfinished-purchase') }}</div>
            <div class="u-cell u-cell--medium--1-4">
                <button class="button button--main button--full" type="button" @click="recoverPurchase()">{{ $td('Continue', 'common.continue') }}</button>
            </div>
            <div class="u-cell u-cell--medium--1-4">
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
                        @blur="inputBlur(); $v.form.buyAmount.$touch()"
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
                        :amount="decreasePrecisionSignificant(estimation || 0)"
                        :label="$td('You receive', 'form.you-receive')"
                        :coin-list="suggestionList"
                        :fallback-to-full-list="false"
                        :is-estimation="true"
                        :isLoading="isEstimationWaiting"
                        @blur="inputBlur(); $v.form.buyAmount.$touch()"
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
                        <div class="u-fw-600 u-text-number">≈ ${{ pretty(currentPrice) }}</div>
                    </div>
                </div>


                <button
                    class="form-row button button--main button--full"
                    :class="{'is-loading': isFormSending, 'is-disabled': ($v.$invalid || !$store.state.onLine)}"
                >
                    <span class="button__content">{{ $td('Buy', 'form.buy-button') }}</span>
                    <Loader class="button__loader" :isLoading="true"/>
                </button>
            </form>

            <!--
            <div class="u-grid u-grid--small u-grid--vertical-margin--small">
                <div class="u-cell u-cell--large--1-4 u-cell--small--1-2">
                    <div class="form-field form-field--dashed">
                        <div class="form-field__input is-not-empty">≈{{ pretty(ethTotalFee) }} ETH</div>
                        <div class="form-field__label">{{ $td('Ethereum fee', 'form.ethereum-fee') }}</div>
                    </div>
                </div>
                <div class="u-cell u-cell--large--1-4 u-cell--small--1-2">
                    <div class="form-field form-field--dashed">
                        <div class="form-field__input is-not-empty">{{ pretty(ethToSwap) }} ETH</div>
                        <div class="form-field__label">ETH to swap</div>
                    </div>
                </div>
                <div class="u-cell u-cell--large--1-4 u-cell--small--1-2">
                    <div class="form-field form-field--dashed">
                        <div class="form-field__input is-not-empty">≈{{ pretty(uniswapEstimation.price) }} {{ coinEthereumName }}</div>
                        <div class="form-field__label">ETH rate</div>
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
        <Modal v-bind:isOpen.sync="isConfirmModalVisible">
            <h2 class="u-h3 form-row">
                {{ $td('Buy', 'form.buy-button') }} {{ form.coinToGet }}
            </h2>

            <div class="estimation form-row">
                <h3 class="estimation__title">{{ $td('You will spend', 'form.you-will-spend') }}</h3>
                <BaseAmountEstimation :coin="externalTokenSymbol" :amount="form.amountEth" format="exact"/>

                <h3 class="estimation__title">{{ $td('You will get approximately', 'form.swap-confirm-receive-estimation') }}</h3>
                <BaseAmountEstimation :coin="form.coinToGet" :amount="currentEstimation" format="approx"/>

                <h3 class="estimation__title">{{ $td('Estimated price', 'form.swap-confirm-price-estimation') }}</h3>
                <div class="estimation__item">
                    <div class="estimation__coin">
                        <div class="estimation__coin-symbol">{{ form.coinToGet }} rate</div>
                    </div>
                    <div class="u-fw-600 u-text-number">≈ ${{ pretty(currentPrice) }}</div>
                </div>
            </div>

            <!--
            <div class="form-row">
                <div class="form-field form-field--dashed">
                    <BaseAmount class="form-field__input is-not-empty" coin="ETH" :amount="ethTotalFee"/>
                    <div class="form-field__label">{{ $td('Ethereum fee', 'form.ethereum-fee') }}</div>
                </div>
            </div>
            -->
            <div class="form-row u-fw-700" v-if="ethFeeImpact > 10"><span class="u-emoji">⚠️</span> {{ $td('High Ethereum fee, it will consume', 'form.high-eth-fee') }} {{ prettyRound(ethFeeImpact) }}% {{ $td('of your ETH', 'form.high-eth-fee-percentage') }}</div>

            <div class="form-row">
                <button class="button button--main button--full" type="button" data-focus-on-open
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
        <Modal v-bind:isOpen.sync="isFormSending" :disable-outside-click="true">
            <h2 class="u-h3 u-mb-10">
                <template v-if="loadingStage === $options.LOADING_STAGE.WAIT_ETH">
                    <Loader class="hub__buy-title-loader" :is-loading="true"/>
                    {{ $td('Waiting ETH deposit', 'form.eth-waiting') }}
                </template>
                <template v-else-if="loadingStage === $options.LOADING_STAGE.FINISH">
                    {{ $td('Success', 'form.success-title') }}!
                </template>
                <template v-else>{{ $td('Buy', 'form.buy-button') }} {{ form.coinToGet }}</template>
            </h2>

            <template v-if="loadingStage === $options.LOADING_STAGE.WAIT_ETH">
                <div class="form-row">
                    <div class="form-field form-field--dashed form-field--with-icon">
                        <div class="form-field__input is-not-empty">{{ prettyExact(ethToTopUp) }} ETH</div>
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
                    <span class="u-emoji">⚠️</span> {{ $td('High Ethereum fee, it will consume', 'form.high-eth-fee') }} {{ prettyRound(ethFeeImpact) }}% {{ $td('of your ETH', 'form.high-eth-fee-percentage') }}
                </div>
                <div class="form-row">
                    <QrcodeVue class="u-mb-10 u-text-center" :value="deepLink" :size="160" level="L"/>
                    <a class="link--default u-text-wrap" :href="deepLink" target="_blank">{{ deepLink }}</a>
                </div>
                <!--                    <div class="" v-if="ethBalance > 0">
                    <div class="form-field__input is-not-empty">{{ prettyExact(ethBalance) }} ETH</div>
                        <span class="form-field__label">{{ $td('Current balance', 'form.current-balance') }}</span>

                       <div class="form-field__input is-not-empty">{{ prettyExact(form.amountEth) }} ETH</div>
                       <span class="form-field__label">{{ $td('Required balance', 'form.required-balance') }}</span>
                </div>-->
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
                :step="item.step"
                :loadingStage="item.loadingStage"
            />
            <div class="form-row" v-if="serverError || !$store.state.onLine">
                <div class="u-grid u-grid--small u-grid--vertical-margin--small">
                    <div class="u-cell u-text-error u-fw-500">
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
                <HubBuySpeedup :steps-ordered="stepsOrdered" @speedup="speedup"/>
            </div>
            <div class="form-row panel__section panel__section--tint u-fw-500" v-if="loadingStage !== $options.LOADING_STAGE.WAIT_ETH && loadingStage !== $options.LOADING_STAGE.FINISH">
                <span class="u-emoji">⚠️</span> {{ $td('Please keep this page active, otherwise progress may&nbsp;be&nbsp;lost.', 'index.keep-page-active') }}
            </div>
            <div class="form-row panel__section" v-if="loadingStage === $options.LOADING_STAGE.FINISH">
                <button class="button button--ghost-main button--full" type="button" @click="finishSending()">
                    {{ $td('Close', 'common.close') }}
                </button>
            </div>
        </Modal>
    </div>
</template>
