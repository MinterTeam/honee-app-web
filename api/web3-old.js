import {HUB_CHAIN_BY_ID, HUB_DEPOSIT_TX_PURPOSE} from '~/assets/variables.js';
import Utils from 'web3-utils';
import {fromErcDecimals} from 'minter-js-web3-sdk/src/web3-abi.js';
import {getProviderByChain, web3Abi} from 'minter-js-web3-sdk/src/web3.js';
import {getExternalCoinList, getTokenDecimals} from '~/api/web3.js';

/**
 * May be no transactions depending on the eth node settings
 * @param {string} address
 * @param {number} chainId
 * @return {Promise<Array<import('web3-eth').Transaction>>}
 */
export function getAddressPendingTransactions(address, chainId) {
    return getProviderByChain(chainId).getPendingTransactions()
        .then((txList) => {
            return txList.filter((tx) => tx.from === address);
        })
        .catch((error) => {
            // The method eth_pendingTransactions may be not available
            console.log(error);
            return [];
        });
}

/**
 * @TODO refactor to find by method id https://stackoverflow.com/a/55258775/4936667
 * @param {HubDeposit} tx
 * @param {number} chainId
 * @param {Array<HubCoinItem>} [hubCoinList]
 * @param {boolean} [skipAmount]
 * @return {Promise<HubDepositTxInfo>}
 */
export async function getDepositTxInfo(tx, chainId, hubCoinList, skipAmount) {
    chainId = Number(tx.chainId || chainId);
    // remove 0x and function selector
    const input = tx.input.slice(2 + 8);
    const itemCount = input.length / 64;
    const hubContractAddress = HUB_CHAIN_BY_ID[chainId]?.hubContractAddress;
    const wrappedNativeContractAddress = HUB_CHAIN_BY_ID[chainId]?.wrappedNativeContractAddress;

    let type;
    // first item
    let tokenContract;
    // 2nd for `unlock`, 4th for `transferToChain`, 'tx.to' in `wrap` and `sendETHToChain`
    let amount;
    if (itemCount === 2) {
        // unlock
        const beneficiaryHex = '0x' + input.slice(0, 64);
        const beneficiaryAddress = web3Abi.decodeParameter('address', beneficiaryHex);
        const isUnlockedForBridge = beneficiaryAddress.toLowerCase() === hubContractAddress;
        if (isUnlockedForBridge) {
            type = HUB_DEPOSIT_TX_PURPOSE.UNLOCK;
            tokenContract = tx.to;
            amount = skipAmount ? 0 : await getAmountFromInputValue(input.slice((itemCount - 1) * 64), tokenContract, chainId, hubCoinList);
        } else {
            return {
                type: HUB_DEPOSIT_TX_PURPOSE.OTHER,
            };
        }
    } else if (tx.to.toLowerCase() === hubContractAddress && itemCount === 5) {
        // transferToChain
        type = HUB_DEPOSIT_TX_PURPOSE.SEND;
        const tokenContractHex = '0x' + input.slice(0, 64);
        tokenContract = web3Abi.decodeParameter('address', tokenContractHex);
        amount = skipAmount ? 0 : await getAmountFromInputValue(input.slice((itemCount - 2) * 64), tokenContract, chainId, hubCoinList);
    } else if (tx.to.toLowerCase() === hubContractAddress && itemCount === 3) {
        // transferETHToChain
        type = HUB_DEPOSIT_TX_PURPOSE.SEND;
        tokenContract = wrappedNativeContractAddress;
        amount = Utils.fromWei(tx.value);
    } else if (tx.to.toLowerCase() === wrappedNativeContractAddress && itemCount === 1) {
        // unwrap
        type = HUB_DEPOSIT_TX_PURPOSE.UNWRAP;
        tokenContract = tx.to;
        amount = skipAmount ? 0 : await getAmountFromInputValue(input, tokenContract, chainId, hubCoinList);
    } else if (tx.to.toLowerCase() === wrappedNativeContractAddress && itemCount === 0) {
        // wrap
        type = HUB_DEPOSIT_TX_PURPOSE.WRAP;
        tokenContract = tx.to;
        amount = Utils.fromWei(tx.value);
    } else {
        return {
            type: HUB_DEPOSIT_TX_PURPOSE.OTHER,
        };
    }

    tokenContract = tokenContract?.toLowerCase();
    const coinItem = getExternalCoinList(hubCoinList, chainId)
        .find((item) => item.externalTokenId === tokenContract);
    const tokenName = coinItem?.denom.toUpperCase();

    return {
        type,
        tokenContract,
        tokenName,
        amount,
    };
}


/**
 *
 * @param {string} hex
 * @param {string} tokenContract
 * @param {ChainId} chainId
 * @param {Array<HubCoinItem>} [hubCoinList]
 * @return {Promise<string>}
 */
async function getAmountFromInputValue(hex, tokenContract, chainId, hubCoinList) {
    const amountHex = '0x' + hex;
    const decimals = await getTokenDecimals(tokenContract, chainId, hubCoinList);
    const amount = fromErcDecimals(web3Abi.decodeParameter('uint256', amountHex), decimals);

    return amount;
}
