import {isValidMnemonic, walletFromMnemonic} from 'minterjs-wallet';

/**
 * @typedef {{address: string, privateKey: string}} PortfolioWallet
 */

/**
 * @type {Object.<number, PortfolioWallet>}
 */
let wallets = {};

export default function usePortfolioWallet(mnemonic) {
    if (!mnemonic || !isValidMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic');
    }
    // clear wallet list for new mnemonic
    if (wallets.mnemonic !== mnemonic) {
        wallets = {};
    }
    wallets.mnemonic = mnemonic;

    /**
     * @param {number|string} portfolioId
     * @return {PortfolioWallet}
     */
    function getWallet(portfolioId) {
        if (!wallets[portfolioId]) {
            const wallet = walletFromMnemonic(mnemonic, {account: 1, index: portfolioId});
            wallets[portfolioId] = Object.freeze({
                address: wallet.getAddressString(),
                privateKey: wallet.getPrivateKeyString(),
            });
        }

        return wallets[portfolioId];
    }

    return {
        getWallet,
    };
}
