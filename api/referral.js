import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import {toBuffer} from 'ethereumjs-util/dist/bytes.js';
import {keccakFromString} from 'ethereumjs-util/dist/hash.js';
import secp256k1 from 'secp256k1';
import {REFERRAL_API_URL, NETWORK, MAINNET} from "~/assets/variables.js";
import addToCamelInterceptor from '~/assets/axios-to-camel.js';

const {ecdsaSign, publicKeyCreate} = secp256k1;

const instance = axios.create({
    baseURL: REFERRAL_API_URL,
    // adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
    // timeout: 5,
});
addToCamelInterceptor(instance);

const AUTH_HEADER_SCHEMA = 'secp256k1-signature';


/**
 *
 * @param {string} privateKey
 * @param {boolean} [enable=true]
 * @return {Promise<string|false>}
 */
export function setupReferralProgram(privateKey, enable = true) {
    const data = {
        enable,
    };
    return instance.post('join/1', data, {
        headers: {
            Authorization: `${AUTH_HEADER_SCHEMA} ${signRequest(data, privateKey)}`,
        },
    })
        .then((response) => enable ? response.data.data.refId : false);
}

/**
 * @param {string} address
 * @return {Promise<string>}
 */
export function getRefId(address) {
    if (!address) {
        throw new Error('Address needed to get ref id');
    }
    return instance.get(`referral/${address}`)
        .then((response) => response.data.data.refId);
}

/**
 * @param {string} address
 * @return {Promise<Array<string>>}
 */
export function getReferralList(address) {
    if (!address) {
        throw new Error('Address needed to get referral list');
    }
    return instance.get(`list/${address}/referrals`)
        .then((response) => response.data.data);
}

/**
 * @param {string} refId
 * @param {string} privateKey
 * @return {Promise}
 */
export function followReferrer(refId, privateKey) {
    const data = {
        key: refId,
    };
    return instance.post('follow', data, {
        headers: {
            Authorization: `${AUTH_HEADER_SCHEMA} ${signRequest(data, privateKey)}`,
        },
    });
}

/**
 *
 * @param {object} data
 * @param {string} privateKey
 * @return {string}
 */
export function signRequest(data, privateKey) {
    const privateKeyBuffer = toBuffer(privateKey);
    const dataHash = hashObject(data);
    // recid is 0-3 number @see https://ethereum.stackexchange.com/a/118342
    const {signature, recid} = ecdsaSign(dataHash, privateKeyBuffer);

    const publicKey = publicKeyCreate(privateKeyBuffer, true);
    // result consist of 64 byte signature + 1 byte recid + 33 byte compressed public key
    let result = concatTypedList([
        signature,
        [recid],
        // publicKey,
    ]);

    return bufferToString(Buffer.from(result));
}


/**
 * @param {Array<Uint8Array|Array|Buffer>} list
 * @return {Uint8Array}
 */
function concatTypedList(list) {
    const totalLength = list.reduce((acc, value) => acc + value.length, 0);
    let result = new Uint8Array(totalLength);
    let offset = 0;
    for (const array of list) {
        result.set(array, offset);
        offset += array.length;
    }

    return result;
}



/**
 * @param {object} data
 * @return {Buffer}
 */
export function hashObject(data) {
    return keccakFromString(JSON.stringify(data));
}

/**
 * @param {Buffer|Uint8Array} buf
 * @return {string}
 */
export function bufferToString(buf) {
    return '0x' + toBuffer(buf).toString('hex');
}
