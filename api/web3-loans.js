import Big from 'minterjs-util/src/big.js';
import {fromErcDecimals} from 'minter-js-web3-sdk/src/web3-abi.js';
import {getProviderByChain} from 'minter-js-web3-sdk/src/web3.js';
import {LOANS_BSC_CONTRACT_ADDRESS_LIST} from '~/assets/variables.js';
import loansABI from '~/assets/abi/loans.json';

/** @typedef {import('web3-eth-contract').Contract} Contract */

export const LEND_COIN = 'BNB';
// minimalLoanableAmount
export const LOAN_MIN_AMOUNT = 0.001;
// maximalLoanableAmount
export const LOAN_MAX_AMOUNT = 100;
// same as 1 / LTV
// baseCollateralRate / rateDenom
export const COLLATERAL_RATE = 2;





const web3Eth = getProviderByChain(56);

/**
 * @param {LoansCollateralCoin} collateralCoin
 * @return {Contract}
 */
function getLoansContract(collateralCoin) {
    const contractAddress = LOANS_BSC_CONTRACT_ADDRESS_LIST[collateralCoin];
    return new web3Eth.Contract(loansABI, contractAddress);
}

/**
 * @param {LoansCollateralCoin} collateralCoin
 * @return {Promise<string|number>}
 */
export function getCollateralPrice(collateralCoin) {
    return getLoansContract(collateralCoin).methods.price().call()
        .then((price) => {
            // const priceDenom = await contract.methods.priceDenom().call();
            const priceDenom = 1e8;
            return new Big(price).div(priceDenom).toString();
        });
}

/**
 * @param {LoansCollateralCoin} collateralCoin
 * @return {Promise<string|number>}
 */
export function getAvailableAmountToBorrow(collateralCoin) {
    return getLoansContract(collateralCoin).methods.lendsTotalAmountLeft().call()
        .then((amount) => {
            return fromErcDecimals(amount);
        });
}

/**
 * @param {LoansCollateralCoin} collateralCoin
 * @param {number|string} id
 * @return {Promise<MinterLoansLoan>}
 */
export function getLoan(collateralCoin, id) {
    return getLoansContract(collateralCoin).methods.getLoan(id).call()
        .then((item) => {
            item.id = Number(id);
            item.collateralCoin = collateralCoin;
            item.borrowingTime = item.borrowingTime * 1000;
            item.borrowedAmount = fromErcDecimals(item.borrowedAmount);
            item.collateralAmount = fromErcDecimals(item.collateralAmount);
            item.amountToRepay = fromErcDecimals(item.amountToRepay);
            item.borrower = item.borrower.toLowerCase();
            item.lender = item.lender.toLowerCase();
            console.log('loan', collateralCoin, item);
            return item;
        });
}

/**
 * @param {LoansCollateralCoin} collateralCoin
 * @param {number|string} id
 * @return {Promise<MinterLoansLend>}
 */
export function getLend(collateralCoin, id) {
    return getLoansContract(collateralCoin).methods.lends(id).call()
        .then((lend) => {
            lend.id = Number(id);
            lend.collateralCoin = collateralCoin;
            lend.lender = lend.lender.toLowerCase();
            lend.prev = Number(lend.prev);
            lend.next = Number(lend.next);
            lend.initialAmount = fromErcDecimals(lend.initialAmount);
            lend.leftAmount = fromErcDecimals(lend.leftAmount);
            console.log('lend', collateralCoin, lend);
            return lend;
        });
}

/**
 * @param {LoansCollateralCoin} collateralCoin
 * @return {Promise<Array<MinterLoansLoan>>}
 */
export async function getLoanList(collateralCoin) {
    const loans = [];

    for (let id = 0; id < 1000; id++) {
        let item;
        try {
            item = await getLoan(collateralCoin, id);
        } catch(e) {
            break;
        }

        loans.push(item);
    }

    return loans.reverse();
}


/**
 * @param {LoansCollateralCoin} collateralCoin
 * @return {Promise<Array<MinterLoansLend>>}
 */
export async function getLendList(collateralCoin) {
    const contract = getLoansContract(collateralCoin);
    let head = await contract.methods.lendsHead().call();
    let tail = await contract.methods.lendsTail().call();
    head = parseInt(head);
    tail = parseInt(tail);

    let list = [];
    let current = head;
    for (;;) {
        let lend;
        try {
            lend = await getLend(collateralCoin, current);
        } catch (e) {
            break;
        }

        list.push(lend);

        if (current === tail || lend.next === 0) {
            break;
        }

        current = lend.next;
    }

    return list.reverse();
}

/**
 * @typedef {object} MinterLoansLoan
 * # populated
 * @property {number} id
 * @property {LoansCollateralCoin} collateralCoin
 * # from contract
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
 * # populated
 * @property {number} id
 * @property {LoansCollateralCoin} collateralCoin
 * # from contract
 * @property {string} lender
 * @property {number} prev
 * @property {number} next
 * @property {string} initialAmount
 * @property {string} leftAmount
 * @property {boolean} dropped - consumed or withdrawn
 */
