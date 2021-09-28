import {isValidMnemonic, walletFromMnemonic} from 'minterjs-wallet';
import {getAvatarUrl, shortHashFilter} from "~/assets/utils";
import {COIN_NAME, CHAIN_ID} from '~/assets/variables.js';

export default {
    /**
     * Checks if user is authorized
     * @return {boolean}
     */
    isAuthorized(state) {
        return state.auth && isValidMnemonic(state.auth);
    },
    wallet(state, getters) {
        if (getters.isAuthorized) {
            return walletFromMnemonic(state.auth);
        }
        return null;
    },
    address(state, getters) {
        if (getters.wallet) {
            return getters.wallet.getAddressString();
        } else {
            return '';
        }
    },
    // addressUrl(state, getters) {
    //     return getExplorerAddressUrl(getters.address);
    // },
    mnemonic(state, getters) {
        return getters.isAuthorized ? state.auth : '';
    },
    privateKey(state, getters) {
        return getters.wallet ? getters.wallet.getPrivateKeyString() : '';
    },
    username(state, getters) {
        if (!getters.address.length) {
            return '';
        }
        return '…' + getters.address.slice(-4);
    },
    // usernameLetter(state, getters) {
    //     return getNameLetter(getters.username);
    // },
    avatar(state, getters) {
        const avatarByAddress = getters.address ? getAvatarUrl(getters.address) : '';
        // stored avatar first, bc. it can be changed manually after uploading new
        return avatarByAddress;
    },
    baseCoin(state) {
        return state.balance.find((coinItem) => {
            return coinItem.coin.symbol === COIN_NAME;
        });
    },
    /**
     * @return {string}
     */
    BASE_COIN() {
        return COIN_NAME;
    },
    /**
     * @return {string}
     */
    COIN_NAME() {
        return COIN_NAME;
    },
    CHAIN_ID() {
        return CHAIN_ID;
    },
};
