import MinterOrg from 'minter-js-org';
import {ACCOUNTS_API_URL} from "~/assets/variables";

const minterOrg = new MinterOrg({
    baseURL: ACCOUNTS_API_URL,
});

const TOKEN_KEY = 'auth-token';
const initialToken = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(TOKEN_KEY)) : false;



export default minterOrg;

/**
 * @param {TokenData} tokenData
 */
export function setAuthToken(tokenData) {
    minterOrg.setAuthToken(tokenData);
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
}

export function resetAuthToken() {
    minterOrg.resetAuthToken();
    localStorage.removeItem(TOKEN_KEY);
}
