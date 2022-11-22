import {reactive, computed} from '@vue/composition-api';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {PAYLOAD_MAX_LENGTH} from 'minterjs-util/src/variables.js';
import {web3Utils, web3Abi, getProviderByChain} from '~/api/web3.js';
import {getTokenSymbolForNetwork} from '~/api/hub.js';
import {postTx} from '~/api/gate.js';
import smartWalletABI from '~/assets/abi-smartwallet.js';
import smartWalletBin from '~/assets/abi-smartwallet-bin.js';
import smartWalletFactoryABI from '~/assets/abi-smartwallet-factory.js';


import {SMART_WALLET_RELAY_MINTER_ADDRESS, SMART_WALLET_FACTORY_CONTRACT_ADDRESS} from '~/assets/variables.js';


export default function useWeb3SmartWallet() {
    const props = reactive({
        privateKey: '',
        evmAccountAddress: '',
        chainId: 0,
    });

    function setProps(newProps) {
        Object.assign(props, newProps);
    }

    const smartWalletAddress = computed(() => getSmartWalletAddress(props.evmAccountAddress));
    // tx params suitable for fee estimation (fake payload, need to prepare later)
    const feeTxParams = computed(() => {
        const coin = getTokenSymbolForNetwork('BNB');
        return {
            // chainId: 1,
            type: TX_TYPE.SEND,
            data: {
                to: SMART_WALLET_RELAY_MINTER_ADDRESS,
                // @TODO 0.005 if wallet exists
                // @TODO estimate precise value
                value: '0.01',
                coin,
            },
            gasCoin: coin,
            // gasPrice: 1,
            payload: Array.from({length: PAYLOAD_MAX_LENGTH}).fill('0').join(''),
        };
    });

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

        return JSON.stringify({
            "a": callDestination,
            "d": hexToBase64(callPayload.slice(2)),
            "gp": "5000000000", // gas price
        });

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

    async function callSmartWallet(txToList, txDataList, txValueList) {
        const payload = await preparePayload(txToList, txDataList, txValueList);
        return postTx({
            ...feeTxParams.value,
                chainId: 1,
                gasPrice: 1,
                payload,
            }, {privateKey: props.privateKey})
            .then(async (tx) => {
                console.log("Crosschain Call", tx);

                return tx;


                // wait for tx to execute
                // let waiter = async function() {
                //     if ((await web3Eth.getCode(smartWalletAddress.value)) !== '0x') {
                //         if ((await smartWalletContract.methods.nonce().call()) > walletNonce) {
                //             that.loading = false;
                //             refresh();
                //             return;
                //         }
                //     }
                //
                //     setTimeout(waiter, 1000);
                // };
                //
                // waiter();

            }).catch((error) => {
            console.error(error);
            // alert(error.response.data.error.message);
            // that.loading = false;
                throw error;
        });
    }

    return {
        setSmartWalletProps: setProps,
        smartWalletAddress,
        feeTxParams,
        preparePayload,
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



