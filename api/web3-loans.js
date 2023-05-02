import Big from 'minterjs-util/src/big.js';
import {fromErcDecimals, getProviderByChain} from 'minter-js-web3-sdk/src/web3.js';
import {LOANS_BSC_CONTRACT_ADDRESS_LIST} from '~/assets/variables.js';
import loansABI from '~/assets/abi/loans.json';

export const LEND_COIN = 'BNB';
export const COLLATERAL_COIN = 'METAGARDEN';
export const LOANS_CONTRACT_ADDRESS = LOANS_BSC_CONTRACT_ADDRESS_LIST[COLLATERAL_COIN];
// minimalLoanableAmount
export const LOAN_MIN_AMOUNT = 0.001;
// same as 1 / LTV
// baseCollateralRate / rateDenom
export const COLLATERAL_RATE = 2;





const web3Eth = getProviderByChain(56);
const contract = new web3Eth.Contract(loansABI, LOANS_CONTRACT_ADDRESS);


export function getCollateralPrice() {
    return contract.methods.price().call()
        .then((price) => {
            // const priceDenom = await contract.methods.priceDenom().call();
            const priceDenom = 1e8;
            return new Big(price).div(priceDenom).toString();
        });
}

/**
 * @param {number|string} id
 * @return {Promise<MinterLoansLoan>}
 */
export function getLoan(id) {
    return contract.methods.getLoan(id).call()
        .then((item) => {
            item.id = Number(id);
            item.borrowingTime = item.borrowingTime * 1000;
            item.borrowedAmount = fromErcDecimals(item.borrowedAmount);
            item.collateralAmount = fromErcDecimals(item.collateralAmount);
            item.amountToRepay = fromErcDecimals(item.amountToRepay);
            item.borrower = item.borrower.toLowerCase();
            item.lender = item.lender.toLowerCase();
            console.log('loan', item);
            return item;
        });
}

/**
 * @param {number|string} id
 * @return {Promise<MinterLoansLend>}
 */
export function getLend(id) {
    return contract.methods.lends(id).call()
        .then((lend) => {
            lend.id = Number(id);
            lend.lender = lend.lender.toLowerCase();
            lend.prev = Number(lend.prev);
            lend.next = Number(lend.next);
            lend.initialAmount = fromErcDecimals(lend.initialAmount);
            lend.leftAmount = fromErcDecimals(lend.leftAmount);
            console.log('lend', lend);
            return lend;
        });
}

/**
 * @typedef {object} MinterLoansLoan
 * @property {number} id
 * @property {number} borrowingTime
 * @property {string} borrowedAmount
 * @property {string} collateralAmount
 * @property {string} amountToRepay
 * @property {string} borrower
 * @property {string} lender
 * @property {boolean} closed
 * @property {boolean} mayBeLiquidated
 */

/**
 * @typedef {object} MinterLoansLend
 * @property {number} id
 * @property {string} lender
 * @property {number} prev
 * @property {number} next
 * @property {string} initialAmount
 * @property {string} leftAmount
 * @property {boolean} dropped - consumed or withdrawn
 */
