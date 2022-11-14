import {toBuffer} from 'ethereumjs-util/dist/bytes.js';
import {keccakFromString} from 'ethereumjs-util/dist/hash.js';
import secp256k1 from 'secp256k1';

const {ecdsaSign, publicKeyCreate} = secp256k1;

const AUTH_HEADER_SCHEMA = 'secp256k1-signature';

/**
 * @param {AxiosInstance} instance
 */
export default function addEcdsaAuthInterceptor(instance) {
    instance.interceptors.request.use(function(request) {
        if (request.ecdsaAuth?.privateKey) {
            let dataToSign;
            // timestamp used as nonce to prevent replay attack
            const timestamp = (new Date()).toISOString();
            if (request.method === 'get') {
                request.params ||= {};
                request.params.timestamp = timestamp;
                dataToSign = timestamp;
            } else {
                request.data.timestamp = timestamp;
                dataToSign = request.data;
            }

            const {privateKey, includePublicKey} = request.ecdsaAuth;
            request.headers ||= {};
            request.headers.Authorization = `${AUTH_HEADER_SCHEMA} ${signRequest(dataToSign, privateKey, includePublicKey)}`;
        }
        return request;
    });
}

/**
 * @param {object|string} data
 * @param {string} privateKey
 * @param {boolean} [includePublicKey=true]
 * @return {string}
 */
export function signRequest(data, privateKey, includePublicKey = true) {
    const privateKeyBuffer = toBuffer(privateKey);
    const dataHash = typeof data === 'string' ? keccakFromString(data) : hashObject(data);
    // recid is 0-3 number @see https://ethereum.stackexchange.com/a/118342
    const {signature, recid} = ecdsaSign(dataHash, privateKeyBuffer);

    const publicKey = publicKeyCreate(privateKeyBuffer, true);
    // result consist of 64 byte signature + 1 byte recid + 33 byte compressed public key
    let result = concatTypedList([
        signature,
        [recid],
        includePublicKey ? publicKey : [],
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

