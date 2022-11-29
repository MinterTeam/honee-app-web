import {reactive, computed} from '@vue/composition-api';
// import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
// import {PAYLOAD_MAX_LENGTH} from 'minterjs-util/src/variables.js';
import {web3Utils, web3Abi, getProviderByChain, toErcDecimals} from '~/api/web3.js';
import {ParaSwapSwapSide} from '~/api/paraswap-models.d.ts';
import {buildTxForSwap as buildTxForParaSwap} from '~/api/paraswap.js';
// import {getTokenSymbolForNetwork} from '~/api/hub.js';
import {submitRelayTx} from '~/api/smart-wallet-relay.js';
import smartWalletABI from '~/assets/abi-smartwallet.js';
import smartWalletBin from '~/assets/abi-smartwallet-bin.js';
import smartWalletFactoryABI from '~/assets/abi-smartwallet-factory.js';
import Big from '~/assets/big.js';
import {SMART_WALLET_RELAY_MINTER_ADDRESS, SMART_WALLET_FACTORY_CONTRACT_ADDRESS, SMART_WALLET_RELAY_BROADCASTER_ADDRESS, NATIVE_COIN_ADDRESS} from '~/assets/variables.js';

export const RELAY_REWARD_AMOUNT = 0.01;

export default function useWeb3SmartWallet() {
    const props = reactive({
        privateKey: '',
        evmAccountAddress: '',
        chainId: 0,
        gasTokenAddress: '',
        gasTokenDecimals: '',
    });

    function setProps(newProps) {
        Object.assign(props, newProps);
    }

    const smartWalletAddress = computed(() => getSmartWalletAddress(props.evmAccountAddress));

    // gas token will be used to reward relay service
    const swapToRelayRewardParams = computed(() => {
        // paraswap params
        return {
            network: props.chainId,
            srcToken: props.gasTokenAddress,
            srcDecimals: props.gasTokenDecimals,
            // address recognized by 1inch/paraswap as native coin
            destToken: NATIVE_COIN_ADDRESS,
            // destToken: HUB_CHAIN_BY_ID[props.chainId]?.wrappedNativeContractAddress,
            destDecimals: 18,
            amount: toErcDecimals(RELAY_REWARD_AMOUNT, 18),
            side: ParaSwapSwapSide.BUY,
            slippage: 3 * 100, // 3%
            maxImpact: 30, // 30% (default 15% can be exceeded on "bipx to 0.01bnb swap" despite it has 10k liquidity)
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
                // @TODO 0.005 if wallet exists
                // @TODO estimate precise value
                value: RELAY_REWARD_AMOUNT,
                coin,
            },
            gasCoin: coin,
            // gasPrice: 1,
            payload: Array.from({length: PAYLOAD_MAX_LENGTH}).fill('0').join(''),
        };
    });
    */

    /**
     *
     * @return {Promise<ParaSwapTransactionsBuildCombined>}
     */
    function buildTxForRelayReward() {
        if (props.gasTokenAddress === NATIVE_COIN_ADDRESS) {
            return Promise.resolve({
                swapLimit: RELAY_REWARD_AMOUNT,
                txList: [{
                    to: SMART_WALLET_RELAY_BROADCASTER_ADDRESS,
                    value: toErcDecimals(RELAY_REWARD_AMOUNT, 18),
                    data: '0x',
                }],
            });
        } else {
            return buildTxForParaSwap(swapToRelayRewardParams.value);
        }
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
        const gasLimit = new Big(web3Utils.toWei(RELAY_REWARD_AMOUNT.toString(), 'ether')).div(gasPrice).round().toNumber();

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
        setSmartWalletProps: setProps,
        smartWalletAddress,
        swapToRelayRewardParams,
        // feeTxParams,
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

