import {getAvailableSelectedBalance} from '~/components/base/FieldCombinedBaseAmount.vue';

/**
 *
 * @param {boolean} isUseMax
 * @param {boolean} isSwap
 * @param {function(): BalanceItem} getBalanceItem - coin to direct spend without swap (direct send, direct lock, etc.)
 * @return {PrepareTxParams|undefined}
 */
export function prepareSpendMaxOrAfterSwap(isUseMax, isSwap, getBalanceItem) {
    const isDirectSpend = !isSwap;
    if (isDirectSpend) {
        if (!isUseMax) {
            return undefined;
        }
        // isDirectSpend && isUseMax
        return function prepareSpendMax(dummyTx, prevPrepareGasCoin) {
            const selectedBalanceItem = getBalanceItem();
            const value = getAvailableSelectedBalance(selectedBalanceItem, prevPrepareGasCoin.extra.fee);

            return {
                data: {
                    value,
                },
            };
        };
    }

    // isSwap
    return function prepareAfterSwap(swapTx, prevPrepareGasCoin) {
        const coinToBuy = swapTx.data.coin_to_buy || swapTx.data.coins.find((item) => item.id === swapTx.tags['tx.coin_to_buy']);
        // @TODO if user had some coinToBuy on balance, it's better to deduct fee from old balance, than from swapTx.returnAmount
        const value = getAvailableSelectedBalance({
            coin: coinToBuy,
            amount: swapTx.returnAmount,
        }, prevPrepareGasCoin.extra.fee);

        return {
            data: {
                value,
            },
        };
    };
}
