import {reactive, computed, toRefs} from 'vue';
import {watchDebounced} from '@vueuse/core';
import {web3Utils, web3Abi, AbiEncoder, getProviderByChain} from '~/api/web3.js';
import {submitRelayTx} from '~/api/smart-wallet-relay.js';
import smartWalletABI from '~/assets/abi-smartwallet.js';
import smartWalletBin from '~/assets/abi-smartwallet-bin.js';
import smartWalletFactoryABI from '~/assets/abi-smartwallet-factory.js';
import smartWalletFactoryABILegacy from '~/assets/abi-smartwallet-factory-legacy.js';
import {SMART_WALLET_FACTORY_CONTRACT_ADDRESS, SMART_WALLET_FACTORY_LEGACY_BSC_CONTRACT_ADDRESS} from '~/assets/variables.js';


// index to derive wallet
const SMART_WALLET_INDEX = 0;

export default function useWeb3SmartWallet() {
    const props = reactive({
        privateKey: '',
        evmAccountAddress: '',
        walletIndex: SMART_WALLET_INDEX,
        // used only as overrideProps.extraNonce in callSmartWallet in PortfolioSellForm
        extraNonce: 0, // add to nonce for consequential txs
        /** @type {ChainId} */
        chainId: 0,
        isLegacy: false, // use legacy BSC factory
        gasPriceGwei: 0,
        gasLimit: 0,
        skipCheckExistence: false,
    });

    /**
     * @param {Partial<props>} newProps
     */
    function setProps(newProps) {
        Object.assign(props, newProps, {extraNonce: newProps.extraNonce > 0 ? newProps.extraNonce : 0});
    }

    const state = reactive({
        isSmartWalletExists: false,
        isSmartWalletExistenceLoading: false,
    });

    const smartWalletAddress = computed(() => getSmartWalletAddress(props.evmAccountAddress, {
        isLegacy: props.isLegacy,
        walletIndex: props.walletIndex ?? SMART_WALLET_INDEX,
    }));

    // @TODO watchDebounced because watchThrottled not working https://github.com/vueuse/vueuse/pull/2620
    watchDebounced([
        smartWalletAddress,
        () => props.chainId,
    ], async () => {
        if (props.skipCheckExistence) {
            return;
        }
        state.isSmartWalletExistenceLoading = true;
        state.isSmartWalletExists = await checkSmartWalletExists(props.chainId, smartWalletAddress.value, false);
        state.isSmartWalletExistenceLoading = false;
    }, {
        debounce: 50,
        maxWait: 50,
    });


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
     * @param {SmartWalletOverrideProps} [overrideProps]
     * @return {Promise<SmartWalletRelaySubmitTxPayload>}
     */
    async function preparePayload(txToList, txDataList, txValueList, overrideProps = {}) {
        const web3Eth = getProviderByChain(props.chainId);
        const smartWalletContract = new web3Eth.Contract(smartWalletABI, smartWalletAddress.value);
        // @TODO walletExists is not needed for non legacy
        const walletIndex = overrideProps.walletIndex ?? props.walletIndex ?? SMART_WALLET_INDEX;
        const walletExists = await checkSmartWalletExists(props.chainId, smartWalletAddress.value, true);

        // @TODO cache block
        const timeout = (await web3Eth.getBlockNumber()) + 1000;
        const walletNonce = walletExists ? (await smartWalletContract.methods.nonce().call()) : 0;
        const extraNonce = overrideProps.extraNonce ?? props.extraNonce;
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

        const gasPriceGwei = overrideProps.gasPriceGwei ?? props.gasPriceGwei;
        const gasPriceWei = web3Utils.toWei(gasPriceGwei.toString(), 'gwei');
        const gasLimit = Number(overrideProps.gasLimit ?? props.gasLimit);
        // const gasLimit = new Big(web3Utils.toWei(relayRewardAmount.value.toString(), 'ether')).div(gasPriceWei).round().toNumber();

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
     * @param {SmartWalletOverrideProps} [overrideProps]
     * @return {Promise<SmartWalletRelaySubmitTxPayload>}
     */
    function preparePayloadFromTxList(txList, overrideProps) {
        const toList = [];
        const dataList = [];
        const valueList = [];
        txList.forEach((tx, index) => {
            toList[index] = tx.to;
            dataList[index] = tx.data || '0x';
            valueList[index] = tx.value || '0';
        });

        return preparePayload(toList, dataList, valueList, overrideProps);
    }

    /**
     * @param {Array<SmartWalletTxParams>} txList
     * @param {SmartWalletOverrideProps} [overrideProps]
     * @return {Promise<SmartWalletRelaySubmitTxResult>}
     */
    function callSmartWallet(txList, overrideProps) {
        return preparePayloadFromTxList(txList, overrideProps)
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
        preparePayload,
        preparePayloadFromTxList,
        callSmartWallet,
    };
}


/**
 * @pure
 * @nosideeffects
 * @param {string} evmAccountAddress
 * @param {object} [options]
 * @param {boolean} [options.isLegacy]
 * @param {number} [options.walletIndex]
 * @return {string}
 */
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

/**
 * @typedef {object} SmartWalletOverrideProps
 * @property {number} [extraNonce]
 * @property {number} [walletIndex]
 * @property {number|string} [gasPriceGwei]
 * @property {number} [gasLimit]
 */

