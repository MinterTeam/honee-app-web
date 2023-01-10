import {reactive, computed, toRefs} from '@vue/composition-api';
import {watchThrottled} from '@vueuse/core';
// import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
// import {PAYLOAD_MAX_LENGTH} from 'minterjs-util/src/variables.js';
import {web3Utils, web3Abi, getProviderByChain, toErcDecimals, fromErcDecimals} from '~/api/web3.js';
import {ParaSwapSwapSide} from '~/api/swap-paraswap-models.d.ts';
// import {buildTxForSwap as buildTxForParaSwap, getEstimationLimit as getParaSwapEstimationLimit} from '~/api/swap-paraswap.js';
import {buildTxForSwap as buildTxForZeroXSwap, getEstimationLimit as getZeroXEstimationLimit} from '~/api/swap-0x.js';
// import {getTokenSymbolForNetwork} from '~/api/hub.js';
import {submitRelayTx} from '~/api/smart-wallet-relay.js';
import smartWalletABI from '~/assets/abi-smartwallet.js';
import smartWalletBin from '~/assets/abi-smartwallet-bin.js';
import smartWalletFactoryABI from '~/assets/abi-smartwallet-factory.js';
import Big from '~/assets/big.js';
import {SMART_WALLET_RELAY_MINTER_ADDRESS, SMART_WALLET_FACTORY_CONTRACT_ADDRESS, SMART_WALLET_RELAY_BROADCASTER_ADDRESS, NATIVE_COIN_ADDRESS} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {wait} from '~/assets/utils/wait.js';


// (fees in BNB)
// base extra fee added for each tx (to cover unexpected costs)
export const RELAY_REWARD_AMOUNT_BASE = 0.0025;
// fee for smart-wallet contract creation via factory
export const RELAY_REWARD_AMOUNT_CREATE = 0.005;
// fee for each swap inside combined tx
export const RELAY_REWARD_AMOUNT_SWAP = 0.0025;


export default function useWeb3SmartWallet({estimationThrottle = 50} = {}) {
    const props = reactive({
        privateKey: '',
        evmAccountAddress: '',
        chainId: 0,
        gasTokenAddress: '',
        gasTokenDecimals: '',
        // amount of swap tx combined into smart-wallet tx (e.g. several swaps for portfolio buy)
        complexity: 1,
        estimationComplexity: undefined,
        estimationSkip: false,
    });

    function setProps(newProps) {
        Object.assign(props, newProps);
    }

    const state = reactive({
        isEstimationLimitForRelayRewardsLoading: false,
        estimationLimitForRelayRewardsError: '',
        amountEstimationLimitForRelayReward: 0,
        // used only in estimationComplexity mode
        maxAmountEstimationLimitForRelayReward: 0,
    });

    const smartWalletAddress = computed(() => getSmartWalletAddress(props.evmAccountAddress));
    const relayRewardAmount = computed(() => getRelayRewardAmount(props.complexity));
    const estimationComplexity = computed(() => {
        return typeof props.estimationComplexity !== 'undefined' ? props.estimationComplexity : props.complexity;
    });
    const maxRelayRewardAmount = computed(() => getRelayRewardAmount(estimationComplexity.value));
    function getRelayRewardAmount(complexity = 1) {
        // @TODO fee for swap via zeroEx for relay reward not taken into account
        // @TODO exclude createReward if wallet already created
        const baseReward = RELAY_REWARD_AMOUNT_BASE;
        const createReward = RELAY_REWARD_AMOUNT_CREATE;
        const swapReward = complexity * RELAY_REWARD_AMOUNT_SWAP;
        return baseReward + createReward + swapReward;
    }
    function recalculateAmountEstimationLimit(complexity, useDirectRelayReward) {
        if (useDirectRelayReward) {
            return state.amountEstimationLimitForRelayReward;
        }
        if (props.estimationSkip) {
            return 0;
        }
        if (props.gasTokenAddress === NATIVE_COIN_ADDRESS) {
            return getRelayRewardAmount(complexity);
        }
        if (complexity === estimationComplexity.value) {
            return state.maxAmountEstimationLimitForRelayReward;
        }
        const baseRewardPart = new Big(RELAY_REWARD_AMOUNT_BASE).div(maxRelayRewardAmount.value);
        const createRewardPart = new Big(RELAY_REWARD_AMOUNT_CREATE).div(maxRelayRewardAmount.value);
        const swapRewardPart = new Big(RELAY_REWARD_AMOUNT_SWAP).div(maxRelayRewardAmount.value);
        const baseReward = baseRewardPart.times(state.maxAmountEstimationLimitForRelayReward);
        const createReward = createRewardPart.times(state.maxAmountEstimationLimitForRelayReward);
        const swapReward = swapRewardPart.times(complexity).times(state.maxAmountEstimationLimitForRelayReward);
        return baseReward.plus(createReward).plus(swapReward).toNumber();
    }

    // gas token will be used to reward relay service
    const swapToRelayRewardParams = computed(() => {
        return swapZeroXParams.value;
        // return swapParaSwapParams.value;
    });
    const swapToRelayRewardEstimationParams = computed(() => {
        return {
            ...swapToRelayRewardParams.value,
            buyAmount: toErcDecimals(maxRelayRewardAmount.value, 18),
        };
    });
    const swapZeroXParams = computed(() => {
        return {
            sellToken: props.gasTokenAddress,
            // sellTokenDecimals: props.gasTokenDecimals,
            buyToken: NATIVE_COIN_ADDRESS,
            // destToken: HUB_CHAIN_BY_ID[props.chainId]?.wrappedNativeContractAddress,
            // buyTokenDecimals: 18,
            buyAmount: toErcDecimals(relayRewardAmount.value, 18),
            slippagePercentage: 0.05, // 5%
            skipValidation: true,
            intentOnFilling: false,
            takerAddress: smartWalletAddress.value,
            receiver: SMART_WALLET_RELAY_BROADCASTER_ADDRESS,
        };
    });
    const swapParaSwapParams = computed(() => {
        return {
            network: props.chainId,
            srcToken: props.gasTokenAddress,
            srcDecimals: props.gasTokenDecimals,
            destToken: NATIVE_COIN_ADDRESS,
            // destToken: HUB_CHAIN_BY_ID[props.chainId]?.wrappedNativeContractAddress,
            destDecimals: 18,
            amount: toErcDecimals(relayRewardAmount.value, 18),
            side: ParaSwapSwapSide.BUY,
            slippage: 5 * 100, // 5%
            maxImpact: 50, // 50% (default 15% can be exceeded on "bipx to 0.01bnb swap" despite it has 10k liquidity)
            userAddress: smartWalletAddress.value,
            txOrigin: SMART_WALLET_RELAY_BROADCASTER_ADDRESS,
            receiver: SMART_WALLET_RELAY_BROADCASTER_ADDRESS,
        };
    });

    // tx params suitable for fee estimation (fake payload, need to prepare later)
    /*
    const feeTxParams = computed(() => {
        const coin = getTokenSymbolForNetwork('BNB');
        return {
            // chainId: 1,
            type: TX_TYPE.SEND,
            data: {
                to: SMART_WALLET_RELAY_MINTER_ADDRESS,
                // @TODO estimate precise value
                value: relayRewardAmount.value,
                coin,
            },
            gasCoin: coin,
            // gasPrice: 1,
            payload: Array.from({length: PAYLOAD_MAX_LENGTH}).fill('0').join(''),
        };
    });
    */


    watchThrottled(swapToRelayRewardEstimationParams, () => {
        if (props.estimationSkip) {
            return;
        }
        //@TODO maybe wait until whole form will be filled by user
        if (props.gasTokenAddress && props.gasTokenDecimals) {
            state.isEstimationLimitForRelayRewardsLoading = true;
            state.estimationLimitForRelayRewardsError = '';
            estimateSpendLimitForRelayReward()
                .then((spendLimit) => {
                    state.isEstimationLimitForRelayRewardsLoading = false;
                    setAmountEstimationLimitForRelayReward(spendLimit);
                })
                .catch((error) => {
                    setAmountEstimationLimitForRelayReward(0);
                    state.isEstimationLimitForRelayRewardsLoading = false;
                    state.estimationLimitForRelayRewardsError = getErrorText(error);
                });
        } else {
            setAmountEstimationLimitForRelayReward(0);
        }
    }, {
        throttle: estimationThrottle,
        leading: false,
        trailing: true,
    });

    /**
     * maxAmountEstimationLimitForRelayReward is only used in estimationComplexity mode
     * @param value
     */
    function setAmountEstimationLimitForRelayReward(value) {
        if (props.estimationComplexity > props.complexity) {
            state.maxAmountEstimationLimitForRelayReward = value;
        } else {
            state.amountEstimationLimitForRelayReward = value;
        }
    }

    function getEstimationLimit() {
        return getZeroXEstimationLimit(props.chainId, swapToRelayRewardEstimationParams.value)
            .then((swapLimit) => {
                return fromErcDecimals(swapLimit, props.gasTokenDecimals);
            });
        // return getParaSwapEstimationLimit(swapToRelayRewardEstimationParams.value);
    }

    /**
     * @return {Promise<string|number>}
     */
    function estimateSpendLimitForRelayReward() {
        if (props.gasTokenAddress === NATIVE_COIN_ADDRESS) {
            return Promise.resolve(maxRelayRewardAmount.value);
        } else {
            return getEstimationLimit();
        }
    }

    function buildTxForSwap() {
        return buildTxForZeroXSwap(props.chainId, swapToRelayRewardParams.value)
            .then((result) => {
                return {
                    txList: result.txList,
                    swapLimit: fromErcDecimals(result.swapLimit, props.gasTokenDecimals),
                };
            });
        // return buildTxForParaSwap(props.chainId, swapToRelayRewardParams.value);
    }

    /**
     * @return {Promise<ParaSwapTransactionsBuildCombined>}
     */
    function _buildTxForRelayReward() {
        if (props.gasTokenAddress === NATIVE_COIN_ADDRESS) {
            return Promise.resolve({
                swapLimit: relayRewardAmount.value,
                txList: [{
                    to: SMART_WALLET_RELAY_BROADCASTER_ADDRESS,
                    value: toErcDecimals(relayRewardAmount.value, 18),
                    data: '0x',
                }],
            });
        } else {
            return buildTxForSwap();
        }
    }

    /**
     * @return {Promise<ParaSwapTransactionsBuildCombined>}
     */
    function buildTxForRelayReward() {
        return _buildTxForRelayReward()
            .then((result) => {
                state.amountEstimationLimitForRelayReward = result.swapLimit;
                // wait for recalculate computed (e.g. amountToSellForSwapToHub)
                return wait(50, result);
            });
    }

    /**
     * @param {Array<string>} txToList - list of recipients
     * @param {Array<string>} txDataList - list of tx data
     * @param {Array<string>} txValueList - list of wei values
     * @return {Promise<SmartWalletRelaySubmitTxPayload>}
     */
    async function preparePayload(txToList, txDataList, txValueList) {
        const web3Eth = getProviderByChain(props.chainId);
        const smartWalletFactoryContract = new web3Eth.Contract(smartWalletFactoryABI);
        const smartWalletContract = new web3Eth.Contract(smartWalletABI, smartWalletAddress.value);
        let walletExists = (await web3Eth.getCode(smartWalletAddress.value)) !== '0x';

        // @TODO cache block
        const timeout = (await web3Eth.getBlockNumber()) + 1000;
        const walletNonce = walletExists ? (await smartWalletContract.methods.nonce().call()) : 0;

        let msg = web3Utils.keccak256(web3Abi.encodeParameters(
            ["address", "uint256", "address[]", "bytes[]", "uint256[]", "uint256"],
            [smartWalletAddress.value, walletNonce, txToList, txDataList, txValueList, timeout],
        ));
        let sign = web3Eth.accounts.sign(msg, props.privateKey);

        let callDestination;
        let callPayload;

        if (walletExists) {
            callDestination = smartWalletAddress.value;
            callPayload = smartWalletContract.methods.call(txToList, txDataList, txValueList, timeout, sign.v, sign.r, sign.s).encodeABI();
        } else {
            callDestination = SMART_WALLET_FACTORY_CONTRACT_ADDRESS;
            callPayload = smartWalletFactoryContract.methods.createAndCall(props.evmAccountAddress, txToList, txDataList, txValueList, timeout, sign.v, sign.r, sign.s).encodeABI();
        }
        console.log('to', txToList);
        console.log('data', txDataList);
        console.log('value', txValueList);
        console.log(callPayload);

        const gasPrice = web3Utils.toWei('5', 'gwei');
        const gasLimit = new Big(web3Utils.toWei(relayRewardAmount.value.toString(), 'ether')).div(gasPrice).round().toNumber();

        return {
            a: callDestination,
            d: hexToBase64(callPayload.slice(2)),
            gp: gasPrice,
            gl: gasLimit,
        };

        function hexToBase64(str) {
            return Buffer.from(str, 'hex').toString('base64');
            /*
            return btoa(String.fromCharCode.apply(
                null,
                str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "),
            ));
            */
        }
    }

    /**
     * @param {Array<SmartWalletTxParams>} txList
     * @return {Promise<SmartWalletRelaySubmitTxPayload>}
     */
    function preparePayloadFromTxList(txList) {
        const toList = [];
        const dataList = [];
        const valueList = [];
        txList.forEach((tx, index) => {
            toList[index] = tx.to;
            dataList[index] = tx.data || '0x';
            valueList[index] = tx.value || '0';
        });

        return preparePayload(toList, dataList, valueList);
    }

    /**
     * @param {Array<SmartWalletTxParams>} txList
     * @return {Promise<SmartWalletRelaySubmitTxResult>}
     */
    function callSmartWallet(txList) {
        return preparePayloadFromTxList(txList)
            .then((payload) => {
                return submitRelayTx(payload);
            });
    }

    return {
        ...toRefs(state),
        setSmartWalletProps: setProps,
        smartWalletAddress,
        swapToRelayRewardParams,
        // feeTxParams,
        estimateSpendLimitForRelayReward,
        recalculateAmountEstimationLimit,
        buildTxForRelayReward,
        preparePayload,
        preparePayloadFromTxList,
        callSmartWallet,
    };
}


// index to derive wallet
const SMART_WALLET_INDEX = 0;

/**
 * @param {string} evmAccountAddress
 * @return {string}
 */
function getSmartWalletAddress(evmAccountAddress) {
    if (!evmAccountAddress) {
        return '';
    }
    const salt = web3Utils.keccak256(web3Abi.encodeParameters(["address", "uint256"], [evmAccountAddress, SMART_WALLET_INDEX]));
    const byteCode = smartWalletBin + web3Abi.encodeParameter('address', evmAccountAddress).slice(2);
    return buildCreate2Address(SMART_WALLET_FACTORY_CONTRACT_ADDRESS, salt, byteCode);

    /**
     * @param {string} creatorAddress
     * @param {string} saltHex
     * @param {string} byteCode
     * @return {string}
     */
    function buildCreate2Address(creatorAddress, saltHex, byteCode) {
        const parts = [
            'ff',
            creatorAddress.slice(2),
            saltHex.slice(2),
            web3Utils.keccak256(byteCode).slice(2),
        ];

        const partsHash = web3Utils.keccak256(`0x${parts.join('')}`);
        return `0x${partsHash.slice(-40)}`.toLowerCase();
    }
}

/**
 * @typedef {object} SmartWalletTxParams
 * @property {string} to
 * @property {string} data
 * @property {string} value
 */

