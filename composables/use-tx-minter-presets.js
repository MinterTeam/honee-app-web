import {convertFromPip} from 'minterjs-util/src/converter.js';
import {HUB_BUY_STAGE as LOADING_STAGE} from '~/assets/variables.js';
import useTxService from '~/composables/use-tx-service.js';

const { txServiceState, sendMinterTx, addStepData } = useTxService();


// @TODO buy not supported
/**
 * @param {TxParams} [initialTxParams]
 * @param {function: TxParams} [prepare]
 * @return {Promise<PostTxResponse&{result: {returnAmount: string}}>}
 */
async function sendMinterSwapTx({initialTxParams, prepare} = {}) {
    initStepFromParams(initialTxParams);

    function initStepFromParams(txParams) {
        txParams.data = txParams.data || {};
        txServiceState.loadingStage = LOADING_STAGE.SWAP_MINTER;
        addStepData(LOADING_STAGE.SWAP_MINTER, {
            coin0: txParams.data.coinToSell || txParams.data.coins?.[0],
            amount0: txParams.data.valueToSell,
            coin1: txParams.data.coinToBuy ||  txParams.data.coins?.slice(-1),
        });
    }

    const txParams = {
        ...initialTxParams,
        ...(await prepare?.()),
    };

    return sendMinterTx(txParams)
        .then((tx) => {
            const returnAmount = convertFromPip(tx.tags['tx.return']);
            addStepData(LOADING_STAGE.SWAP_MINTER, {tx, amount1: returnAmount, finished: true});

            return {
                ...tx,
                result: {
                    returnAmount,
                },
            };
        });
}

export default function useTxMinterPresets() {
    return {
        sendMinterSwapTx,
    };
}
