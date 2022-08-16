import Big from 'big.js';
import stripZeros from 'pretty-num/src/strip-zeros.js';

export const BIG_ROUND_DOWN = 0;
export const BIG_ROUND_HALF_EVEN = 2;

// set defaults
// precision
Big.DP = 18;
// ROUND_HALF_EVEN (same as in minter-node)
Big.RM = BIG_ROUND_HALF_EVEN;

// fix toString method, by default toFixed doesn't consider global Big.DP value
Big.prototype.toString = function(dp = Big.DP, rm = Big.RM) {
    return stripZeros(this.toFixed(dp, rm));
};

export default Big;
