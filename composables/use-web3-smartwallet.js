import {reactive, computed, toRefs, watch} from 'vue';
import {watchThrottled, watchDebounced} from '@vueuse/core';
// import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
// import {PAYLOAD_MAX_LENGTH} from 'minterjs-util/src/variables.js';
import {web3Utils, web3Abi, AbiEncoder, getProviderByChain, toErcDecimals, fromErcDecimals, getFeeAmount} from '~/api/web3.js';
import {ParaSwapSwapSide} from '~/api/swap-paraswap-models.d.ts';
// import {buildTxForSwap as buildTxForParaSwap, getEstimationLimit as getParaSwapEstimationLimit} from '~/api/swap-paraswap.js';
import {buildTxForSwap as buildTxForZeroExSwap, getEstimationLimit as getZeroExEstimationLimit} from '~/api/swap-0x.js';
// import {getTokenSymbolForNetwork} from '~/api/hub.js';
import {submitRelayTx} from '~/api/smart-wallet-relay.js';
import smartWalletABI from '~/assets/abi-smartwallet.js';
import smartWalletBin from '~/assets/abi-smartwallet-bin.js';
import smartWalletFactoryABI from '~/assets/abi-smartwallet-factory.js';
import smartWalletFactoryABILegacy from '~/assets/abi-smartwallet-factory-legacy.js';
import Big from '~/assets/big.js';
import {SMART_WALLET_RELAY_MINTER_ADDRESS, SMART_WALLET_FACTORY_CONTRACT_ADDRESS, SMART_WALLET_FACTORY_LEGACY_BSC_CONTRACT_ADDRESS, SMART_WALLET_RELAY_BROADCASTER_ADDRESS, NATIVE_COIN_ADDRESS, HUB_CHAIN_BY_ID, BSC_CHAIN_ID} from '~/assets/variables.js';
import {getErrorText} from '~/assets/server-error.js';
import {wait} from '~/assets/utils/wait.js';
import useHubOracle from '~/composables/use-hub-oracle.js';

const GAS_PRICE_BSC = 5; // in gwei
const SLIPPAGE_PERCENT = 5;
// gas limits of:
// base extra fee added for each tx to cover unexpected costs, also covers:
// - native coin transfer to relay 21000-35000
// - smart-wallet broadcast expenses up to 100000
// - transferToBridge 75000 (if complexity:0)
export const RELAY_REWARD_AMOUNT_BASE_GAS_LIMIT = 500000; // equivalent of 0.0025 BNB
// fee for smart-wallet contract creation via factory
export const RELAY_REWARD_AMOUNT_CREATE_GAS_LIMIT = 1000000; // equivalent of 0.005 BNB
// @TODO use transferToBridge 75000 gas limit if no swap required
// fee for each swap inside combined tx
export const RELAY_REWARD_AMOUNT_SWAP_GAS_LIMIT = 500000; // equivalent of 0.0025 BNB


// @TODO estimate actual gas price if token already exists on smart-wallet
export default function useWeb3SmartWallet({estimationThrottle = 100} = {}) {
    const {networkGasPrice, setHubOracleProps} = useHubOracle({
        subscribePriceList: true,
    });

    const props = reactive({
        privateKey: '',
        evmAccountAddress: '',
        extraNonce: 0, // add to nonce for consequential txs
        /** @type {ChainId} */
        chainId: 0,
        isLegacy: false, // use legacy BSC factory
        gasTokenAddress: '',
        gasTokenDecimals: 0,
        // amount of swap tx combined into smart-wallet tx (e.g. several swaps for portfolio buy)
        complexity: 1,
        estimationComplexity: undefined,
        estimationSkip: false,
    });

    /**
     * @param {Partial<props>} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps, {extraNonce: newProps.extraNonce > 0 ? newProps.extraNonce : 0});
    }

    watch(() => props.chainId, () => {
        setHubOracleProps({
            hubNetworkSlug: HUB_CHAIN_BY_ID[props.chainId]?.hubNetworkSlug || '',
            fixInvalidGasPriceWithDummy: false,
        });
    }, {immediate: true});

    const state = reactive({
        isSmartWalletExists: false,
        isSmartWalletExistenceLoading: false,
        isEstimationLimitForRelayRewardsLoading: false,
        estimationLimitForRelayRewardsError: '',
        /** @type {number|string} */
        amountEstimationLimitForRelayReward: 0,
        /** @type {number|string} - used only in estimationComplexity mode */
        maxAmountEstimationLimitForRelayReward: 0,
    });

    const smartWalletAddress = computed(() => getSmartWalletAddress(props.evmAccountAddress, {isLegacy: props.isLegacy}));
    // in gwei
    const gasPrice = computed(() => {
        if (props.chainId === BSC_CHAIN_ID) {
            return GAS_PRICE_BSC;
        }
        return networkGasPrice.value;
    });
    const relayRewardAmount = computed(() => getRelayRewardAmount(props.complexity));
    const estimationComplexity = computed(() => {
        return typeof props.estimationComplexity !== 'undefined' ? props.estimationComplexity : props.complexity;
    });
    // estimation of reward
    // it's named 'max' because in portfolioBuy we estimate max possible complexity (which is equal to number of coins to buy)
    const maxRelayRewardAmount = computed(() => getRelayRewardAmount(estimationComplexity.value));
    function getRelayRewardAmount(complexity = 1) {
        const baseRewardGasLimit = RELAY_REWARD_AMOUNT_BASE_GAS_LIMIT;
        const createRewardGasLimit = state.isSmartWalletExists ? 0 : RELAY_REWARD_AMOUNT_CREATE_GAS_LIMIT;
        const gasSwapRewardGasLimit = props.gasTokenAddress === NATIVE_COIN_ADDRESS ? 0 : RELAY_REWARD_AMOUNT_SWAP_GAS_LIMIT;
        const swapRewardGasLimit = complexity * RELAY_REWARD_AMOUNT_SWAP_GAS_LIMIT;
        const totalGasLimit = baseRewardGasLimit + createRewardGasLimit + gasSwapRewardGasLimit + swapRewardGasLimit;
        return getFeeAmount(gasPrice.value, totalGasLimit);
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
        const baseRewardSingle = getFeeAmount(gasPrice.value, RELAY_REWARD_AMOUNT_BASE_GAS_LIMIT);
        const createRewardSingle = getFeeAmount(gasPrice.value, RELAY_REWARD_AMOUNT_CREATE_GAS_LIMIT);
        const gasSwapRewardSingle = getFeeAmount(gasPrice.value, RELAY_REWARD_AMOUNT_SWAP_GAS_LIMIT);
        const swapRewardSingle = getFeeAmount(gasPrice.value, RELAY_REWARD_AMOUNT_SWAP_GAS_LIMIT);
        const baseRewardPart = new Big(baseRewardSingle).div(maxRelayRewardAmount.value);
        const createRewardPart = state.isSmartWalletExists ? new Big(0) : new Big(createRewardSingle).div(maxRelayRewardAmount.value);
        const gasSwapRewardPart = props.gasTokenAddress === NATIVE_COIN_ADDRESS ? new Big(0) : new Big(gasSwapRewardSingle).div(maxRelayRewardAmount.value);
        const swapRewardPart = new Big(swapRewardSingle).div(maxRelayRewardAmount.value);

        const baseReward = baseRewardPart.times(state.maxAmountEstimationLimitForRelayReward);
        const createReward = createRewardPart.times(state.maxAmountEstimationLimitForRelayReward);
        const gasSwapReward = gasSwapRewardPart.times(state.maxAmountEstimationLimitForRelayReward);
        const swapReward = swapRewardPart.times(complexity).times(state.maxAmountEstimationLimitForRelayReward);

        return baseReward.plus(createReward).plus(gasSwapReward).plus(swapReward).toNumber();
    }

    // gas token will be used to reward relay service
    const swapToRelayRewardParams = computed(() => {
        return swapZeroExParams.value;
        // return swapParaSwapParams.value;
    });
    const swapToRelayRewardEstimationParams = computed(() => {
        return {
            ...swapToRelayRewardParams.value,
            buyAmount: toErcDecimals(maxRelayRewardAmount.value, 18),
        };
    });
    const swapZeroExParams = computed(() => {
        return {
            sellToken: props.gasTokenAddress,
            // sellTokenDecimals: props.gasTokenDecimals,
            buyToken: NATIVE_COIN_ADDRESS,
            // destToken: HUB_CHAIN_BY_ID[props.chainId]?.wrappedNativeContractAddress,
            // buyTokenDecimals: 18,
            buyAmount: toErcDecimals(relayRewardAmount.value, 18),
            slippagePercentage: SLIPPAGE_PERCENT / 100, // part of 1
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
            slippage: SLIPPAGE_PERCENT * 100, // in bp
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


    //@TODO maybe check isEqual
    watchDebounced([
        swapToRelayRewardEstimationParams,
        smartWalletAddress,
        () => state.isSmartWalletExistenceLoading,
    ], (newVal, oldVal) => {
        if (props.estimationSkip) {
            return;
        }
        if (!smartWalletAddress.value || state.isSmartWalletExistenceLoading) {
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
        debounce: estimationThrottle,
        maxWait: estimationThrottle,
        // throttle: estimationThrottle,
        // leading: false,
        // trailing: true,
    });

    // @TODO watchDebounced because watchThrottled not working https://github.com/vueuse/vueuse/pull/2620
    watchDebounced([
        smartWalletAddress,
        () => props.chainId,
    ], async () => {
        state.isSmartWalletExistenceLoading = true;
        state.isSmartWalletExists = await checkSmartWalletExists(props.chainId, smartWalletAddress.value, false);
        state.isSmartWalletExistenceLoading = false;
    }, {
        debounce: 50,
        maxWait: 50,
    });

    /**
     * maxAmountEstimationLimitForRelayReward is only used in estimationComplexity mode
     * @param {number|string} value
     */
    function setAmountEstimationLimitForRelayReward(value) {
        if (props.estimationComplexity > props.complexity) {
            state.maxAmountEstimationLimitForRelayReward = value;
        } else {
            state.amountEstimationLimitForRelayReward = value;
        }
    }

    //@TODO sometimes goes to infinite loop
    /**
     * @return {Promise<string|number>}
     */
    function estimateSpendLimitForRelayReward() {
        if (props.gasTokenAddress === NATIVE_COIN_ADDRESS) {
            return Promise.resolve(maxRelayRewardAmount.value);
        } else {
            return getZeroExEstimationLimit(props.chainId, swapToRelayRewardEstimationParams.value)
                .then((swapLimit) => {
                    return fromErcDecimals(swapLimit, props.gasTokenDecimals);
                });
            // return getParaSwapEstimationLimit(swapToRelayRewardEstimationParams.value);
        }
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
            return buildTxForZeroExSwap(props.chainId, swapToRelayRewardParams.value)
                .then((result) => {
                    return {
                        txList: result.txList,
                        swapLimit: fromErcDecimals(result.swapLimit, props.gasTokenDecimals),
                    };
                });
            // return buildTxForParaSwap(props.chainId, swapToRelayRewardParams.value);
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
     * @param {number} chainId
     * @param {string} address
     * @param {boolean} [throwOnError]
     * @returns {Promise<boolean>}
     */
    function checkSmartWalletExists(chainId, address, throwOnError) {
        const web3Eth = getProviderByChain(props.chainId);
        return web3Eth.getCode(address)
            .then((code) => {
                return code !== '0x';
            })
            .catch((error) => {
                if (throwOnError) {
                    throw error;
                } else {
                    return false;
                }
            });
    }

    /**
     * @param {Array<string>} txToList - list of recipients
     * @param {Array<string>} txDataList - list of tx data
     * @param {Array<string>} txValueList - list of wei values
     * @param {object} [options]
     * @param {number} [options.overrideExtraNonce]
     * @param {number} [options.walletIndex]
     * @return {Promise<SmartWalletRelaySubmitTxPayload>}
     */
    // @ts-expect-error @TODO https://github.com/microsoft/TypeScript/issues/50286
    async function preparePayload(txToList, txDataList, txValueList, {overrideExtraNonce, walletIndex = SMART_WALLET_INDEX} = {}) {
        const web3Eth = getProviderByChain(props.chainId);
        const smartWalletContract = new web3Eth.Contract(smartWalletABI, smartWalletAddress.value);
        // @TODO walletExists is not needed for non legacy
        const walletExists = await checkSmartWalletExists(props.chainId, smartWalletAddress.value, true);

        // @TODO cache block
        const timeout = (await web3Eth.getBlockNumber()) + 1000;
        const walletNonce = walletExists ? (await smartWalletContract.methods.nonce().call()) : 0;
        const extraNonce = overrideExtraNonce ?? props.extraNonce;
        const finalNonce = Number(walletNonce) + extraNonce;

        let msg = web3Utils.keccak256(web3Abi.encodeParameters(
            ["address", "uint256", "address[]", "bytes[]", "uint256[]", "uint256"],
            [smartWalletAddress.value, finalNonce, txToList, txDataList, txValueList, timeout],
        ));
        let sign = web3Eth.accounts.sign(msg, props.privateKey);

        let callDestination;
        let callPayload;

        if (!props.isLegacy) {
            callDestination = SMART_WALLET_FACTORY_CONTRACT_ADDRESS;
            callPayload = AbiEncoder(smartWalletFactoryABI)('call', props.evmAccountAddress, walletIndex, txToList, txDataList, txValueList, timeout, sign.v, sign.r, sign.s);
        } else if (walletExists || props.extraNonce > 0) {
            callDestination = smartWalletAddress.value;
            callPayload = smartWalletContract.methods.call(txToList, txDataList, txValueList, timeout, sign.v, sign.r, sign.s).encodeABI();
        } else {
            callDestination = SMART_WALLET_FACTORY_LEGACY_BSC_CONTRACT_ADDRESS;
            callPayload = AbiEncoder(smartWalletFactoryABILegacy)('createAndCall', props.evmAccountAddress, txToList, txDataList, txValueList, timeout, sign.v, sign.r, sign.s);
        }
        console.log('to', txToList);
        console.log('data', txDataList);
        console.log('value', txValueList);
        console.log({walletNonce, finalNonce, walletExists, callDestination});
        console.log('callPayload', callPayload);

        const gasPriceWei = web3Utils.toWei(gasPrice.value.toString(), 'gwei');
        const gasLimit = new Big(web3Utils.toWei(relayRewardAmount.value.toString(), 'ether')).div(gasPriceWei).round().toNumber();

        return {
            a: callDestination,
            d: hexToBase64(callPayload.slice(2)),
            gp: gasPriceWei,
            gl: gasLimit,
            // if send via minter payload
            // type: `send_to_${HUB_CHAIN_BY_ID[props.chainId].hubNetworkSlug}`,
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
     * @param {object} [options]
     * @param {number} [options.overrideExtraNonce]
     * @return {Promise<SmartWalletRelaySubmitTxPayload>}
     */
    // @ts-expect-error @TODO https://github.com/microsoft/TypeScript/issues/50286
    function preparePayloadFromTxList(txList, {overrideExtraNonce} = {}) {
        const toList = [];
        const dataList = [];
        const valueList = [];
        txList.forEach((tx, index) => {
            toList[index] = tx.to;
            dataList[index] = tx.data || '0x';
            valueList[index] = tx.value || '0';
        });

        return preparePayload(toList, dataList, valueList, {overrideExtraNonce});
    }

    /**
     * @param {Array<SmartWalletTxParams>} txList
     * @param {object} [options]
     * @param {number} [options.overrideExtraNonce]
     * @return {Promise<SmartWalletRelaySubmitTxResult>}
     */
    // @ts-expect-error @TODO https://github.com/microsoft/TypeScript/issues/50286
    function callSmartWallet(txList, {overrideExtraNonce} = {}) {
        return preparePayloadFromTxList(txList, {overrideExtraNonce})
            .then((payload) => {
                return submitRelayTx(props.chainId, payload);
            })
            .then(({hash}) => {
                return {
                    hash,
                    callCount: txList.length,
                };
            });
    }

    return {
        ...toRefs(state),
        setSmartWalletProps: setProps,
        smartWalletAddress,
        relayRewardAmount,
        maxRelayRewardAmount,
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
 * @pure
 * @nosideeffects
 * @param {string} evmAccountAddress
 * @param {object} [options]
 * @param {boolean} [options.isLegacy]
 * @param {number} [options.walletIndex]
 * @return {string}
 */
// @ts-expect-error @TODO https://github.com/microsoft/TypeScript/issues/50286
function getSmartWalletAddress(evmAccountAddress, {isLegacy, walletIndex = SMART_WALLET_INDEX} = {}) {
    if (!evmAccountAddress) {
        return '';
    }
    const factoryContractAddress = isLegacy ? SMART_WALLET_FACTORY_LEGACY_BSC_CONTRACT_ADDRESS : SMART_WALLET_FACTORY_CONTRACT_ADDRESS;
    const salt = web3Utils.keccak256(web3Abi.encodeParameters(["address", "uint256"], [evmAccountAddress, walletIndex]));
    const byteCode = smartWalletBin + web3Abi.encodeParameter('address', evmAccountAddress).slice(2);
    return buildCreate2Address(factoryContractAddress, salt, byteCode);

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

