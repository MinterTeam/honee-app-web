import {convertFromPip} from 'minterjs-util/src/converter.js';
import {HUB_BUY_STAGE as LOADING_STAGE} from '~/assets/variables.js';
import useTxService from '~/composables/use-tx-service.js';
import {waitRelayTxSuccess} from 'minter-js-web3-sdk/src/api/smart-wallet-relay.js';
import {subscribeTransfer, waitHubTransferToMinter} from '~/api/hub.js';

const { sendMinterTx, addStepData } = useTxService();


// @TODO buy not supported
/**
 * @param {object} [options]
 * @param {TxParams} [options.initialTxParams]
 * @param {function(): TxParams} [options.prepare]
 * @return {Promise<PostTxResponse&{result: {returnAmount: string}}>}
 */
async function sendMinterSwapTx({initialTxParams, prepare} = {}) {
    initStepFromParams(initialTxParams);

    function initStepFromParams(txParams) {
        txParams.data = txParams.data || {};
        addStepData(LOADING_STAGE.SWAP_MINTER, {
            coin0: txParams.data.coinToSell || txParams.data.coins?.[0],
            amount0: txParams.data.valueToSell,
            coin1: txParams.data.coinToBuy ||  txParams.data.coins?.slice(-1),
        }, true);
    }

    const txParams = {
        ...initialTxParams,
        ...(await prepare?.()),
    };

    return sendMinterTx(txParams)
        .then((tx) => {
            const returnAmount = convertFromPip(tx.tags['tx.return']);
            // @TODO prevent if component destroyed
            addStepData(LOADING_STAGE.SWAP_MINTER, {tx, amount1: returnAmount, finished: true});

            return {
                ...tx,
                result: {
                    returnAmount,
                },
            };
        });
}

/**
 *
 * @param {ChainId} chainId
 * @param {string} relayHash
 * @return {[Promise<SmartWalletRelayTxStatus>, (() => void)]}
 */
export function addStepDataRelay(chainId, relayHash) {
    addStepData(LOADING_STAGE.SEND_TO_RELAY, {
        tx: {
            hash: relayHash,
            timestamp: (new Date()).toISOString(),
        },
    });
    // @TODO throw if deposit already successful
    let [promise, canceler] = waitRelayTxSuccess(chainId, relayHash);
    promise = promise.then((result) => {
        // @TODO prevent if component destroyed
        addStepData(LOADING_STAGE.SEND_TO_RELAY, {finished: true});
        return result;
    });
    // @TODO automatically cancel on component destroy
    return [promise, canceler];
}

export function addStepDataBridgeDeposit(chainId, txHash, coinSymbol, amount, destinationAddress, index) {
    index = index || '';
    addStepData(LOADING_STAGE.SEND_BRIDGE + index, {
        coin: coinSymbol,
        // it is approximate amount based on estimation, maybe extract actual amount from tx
        amount,
        tx: {
            hash: txHash,
            params: {
                chainId,
            },
            timestamp: (new Date()).toISOString(),
        },
        finished: true, // is really finished here?
    });

    addStepData(LOADING_STAGE.WAIT_BRIDGE + index, {coin: coinSymbol /* calculate receive amount? */}, true);

    return waitHubTransferToMinter(txHash, destinationAddress, coinSymbol)
        .then(({ tx: minterTx, outputAmount}) => {
            // @TODO prevent if component destroyed
            addStepData(LOADING_STAGE.WAIT_BRIDGE + index, {amount: outputAmount, tx: minterTx, finished: true});

            return outputAmount;
        });

}

export function addStepDataBridgeWithdraw(chainId, txHash, coinSymbol, amount, index) {
    index = index || '';
    addStepData(LOADING_STAGE.SEND_BRIDGE + index, {
        coin: coinSymbol,
        // it is approximate amount based on estimation, maybe extract actual amount from tx
        amount,
        tx: {
            hash: txHash,
            params: {
                chainId,
            },
            timestamp: (new Date()).toISOString(),
        },
        finished: true, // is really finished here?
    });

    addStepData(LOADING_STAGE.WAIT_BRIDGE + index, {coin: coinSymbol /* calculate receive amount? */}, true);

    return subscribeTransfer(txHash)
        .then((result) => {
            // @TODO prevent if component destroyed
            addStepData(LOADING_STAGE.WAIT_BRIDGE + index, {/*amount: outputAmount, */tx: result.outTxHash, finished: true});

            return result;
        });

}

export default function useTxMinterPresets() {
    return {
        sendMinterSwapTx,
    };
}
