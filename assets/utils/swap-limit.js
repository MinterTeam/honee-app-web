import Big, {BIG_ROUND_DOWN, BIG_ROUND_UP} from 'minterjs-util/src/big.js';

/**
 * Get max to spend amount
 * @param {string} estimationAmount - integer
 * @param {number|string} slippagePart - e.g. '0.01' for 1% slippage
 * @return {string}
 */
export function getMaxEstimationLimit(estimationAmount, slippagePart) {
    const slippageAmount = new Big(estimationAmount).times(slippagePart);
    // maxSrcAmount to spend
    return new Big(estimationAmount).plus(slippageAmount).round(0, BIG_ROUND_UP).toString();
}

/**
 * Get min to receive amount
 * @param {string} estimationAmount - integer
 * @param {number|string} slippagePart - e.g. '0.01' for 1% slippage
 * @return {string}
 */
export function getMinEstimationLimit(estimationAmount, slippagePart) {
    const slippageAmount = new Big(estimationAmount).times(slippagePart);
    // maxSrcAmount to spend
    return new Big(estimationAmount).minus(slippageAmount).round(0, BIG_ROUND_DOWN).toString();
}
