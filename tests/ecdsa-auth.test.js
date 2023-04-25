import secp256k1 from 'secp256k1';
import {toBuffer} from 'ethereumjs-util/dist/bytes.js';
import {keccakFromString} from 'ethereumjs-util/dist/hash.js';
import {publicToAddress} from 'ethereumjs-util/dist/account.js';
import {signRequest, hashObject, bufferToString} from '~/assets/axios-ecdsa-auth.js';

const {ecdsaRecover, ecdsaVerify, publicKeyCreate} = secp256k1;

// Mx7633980c000139dd3bd24a3f54e06474fa941e16
// uncompressed pub key 0x04f9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3cb8a015b8031d02e79456aedb361fa20ec1a119d6009e5c08e9d1eeb5b29ad92
// const SEED_PHRASE = 'exercise fantasy smooth enough arrive steak demise donkey true employ jealous decide blossom bind someone';
const PRIVATE_KEY = '0x5fa3a8b186f6cc2d748ee2d8c0eb7a905a7b73de0f2c34c5e7857c3b46f187da';
const VALID_REQUEST = {
    data : {
        enable: true,
    },
    dataHash: '0x327f59891ce17c85ed132a426e1e5fbe475afaf3ac9f415d51837475829c3c67',
    signature: {
        signature: '0x9cda3ec5d93ecdf51f7c547f10ae8cfa808ef3ea5fd81ea0d4234a979e13b50a6cca8a998031d10a548d0f30fee242219ced2d63a493f04fd102d5f3a1685142',
        recid: '0x01',
        publicKey: '0x02f9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3',
        // header auth string (signature + recid + pubkey)
        result: '0x9cda3ec5d93ecdf51f7c547f10ae8cfa808ef3ea5fd81ea0d4234a979e13b50a6cca8a998031d10a548d0f30fee242219ced2d63a493f04fd102d5f3a16851420102f9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3',
    },
};

test('signRequest', () => {
    const signature = signRequest(VALID_REQUEST.data, PRIVATE_KEY);
    expect(signature).toEqual(VALID_REQUEST.signature.result);
});

test('signRequest without publicKey', () => {
    const signature = signRequest(VALID_REQUEST.data, PRIVATE_KEY, false);
    const vrsHexLength = 2 + 65 * 2; // 2 for 0x prefix, 32 + 32 for `vr`, 1 for `s` (recid), '*2' for hex symbol
    expect(signature).toEqual(VALID_REQUEST.signature.result.slice(0, vrsHexLength));
});

test('recovery', () => {
    const {signature, recid} = parseHeaderAuth(VALID_REQUEST.signature.result);
    const dataHash = hashObject(VALID_REQUEST.data);
    const publicKeyReceived = ecdsaRecover(signature, recid, dataHash, false);
    const publicKeyValid = publicKeyCreate(toBuffer(PRIVATE_KEY), false);
    expect(publicKeyReceived).toEqual(publicKeyValid);
});

test('recovery from bad formed json string returns invalid publicKey', () => {
    const {signature, recid} = parseHeaderAuth(VALID_REQUEST.signature.result);
    const dataHash = keccakFromString('{"enabled": true}');
    const publicKeyReceived = ecdsaRecover(signature, recid, dataHash, false);
    console.log(Buffer.from(publicKeyReceived).toString('hex'));
});

test('verify', () => {
    const {signature, publicKey} = parseHeaderAuth(VALID_REQUEST.signature.result);
    const dataHash = hashObject(VALID_REQUEST.data);
    const isValid = ecdsaVerify(signature, dataHash, publicKey);
    expect(isValid).toEqual(true);
});

test('message hash', () => {
    const hash = bufferToString(hashObject(VALID_REQUEST.data));
    expect(hash).toEqual(VALID_REQUEST.dataHash);
});

describe('test case from api', () => {
    test('1', () => {
        const validAddress = 'b03f7e18212bcaffb5e0633db79cd8e60e4d8a7a';
        const dataHexString = '7b226964223a39372c2269736f6c6174656441646472657373223a224d7833326166663263316637313466636261653537343135663231663435633430666238366139613163222c2274696d657374616d70223a22323032322d31312d30395430373a31343a35392e3535315a227d';
        const headerAuthResult = '0xabd822e06eb4e870d7f2a672318971b937c758c3b4fbb9b235adfabe4e6158cc39a5f1ca996ae9dd27687cc0bd8ea28c5c22c5e3e792381867e88433c6722f3300030005f3ffb1ea4ddd4c077b1922e87c9617a98bbe2c599fd7df4690c1fe3f5124';

        const dataString = Buffer.from(dataHexString, 'hex').toString('utf8');
        const data = JSON.parse(dataString);
        expect(keccakFromString(dataString)).toEqual(hashObject(data));

        const {signature, recid, publicKey: publicKeyValid} = parseHeaderAuth(headerAuthResult);
        const dataHash = hashObject(data);
        const publicKeyReceived = ecdsaRecover(signature, recid, dataHash, true);

        expect(Buffer.from(publicKeyReceived).toString('hex')).toEqual(publicKeyValid.toString('hex'));
        expect(publicToAddress(Buffer.from(publicKeyReceived), true).toString('hex')).toEqual(validAddress);
    });

    test('2 timestamp', () => {
        const headerAuthResult = '0x2a59be8dce2411752ee851087e2c47cdd7d119a61577fb78a6a99465136713f26d7a4b0a3bcbaf27a3723b96e9517ac2d3e82490c4a385af07340d477fa608cd0103ffe1204b947d6c4995820e88f28409a15c5e5519c8bdc4e5813323e765c54025';
        const timestamp = '2023-03-02T08:23:32.296Z';
        const {signature, recid, publicKey: publicKeyValid} = parseHeaderAuth(headerAuthResult);
        console.log({signature, recid, publicKeyValid});
        const dataHash = keccakFromString(timestamp);
        const publicKeyReceived = ecdsaRecover(signature, recid, dataHash, true);
        const addressReceived = publicToAddress(Buffer.from(publicKeyReceived), true).toString('hex');
        const addressValid = publicToAddress(Buffer.from(publicKeyValid), true).toString('hex');
        console.log({addressReceived, addressValid});
        expect(addressReceived).toEqual(addressValid);
    });
});

describe('timestamp', () => {
    const TIMESTAMP = '2022-11-10T15:28:31.670Z';

    test('empty get', () => {
        const dataHash = keccakFromString(TIMESTAMP);
        expect(dataHash.toString('hex'))
            .toEqual('dc5e03057e7bd30d173706d55392fd055f03efbd0e2c3f7fb3032fd87659396a');

        const auth = signRequest(TIMESTAMP, PRIVATE_KEY);
        expect(auth).toEqual('0x8b7a07e514cd38914d9f4628ddb6d4b14c923efe230d4383462343aa5b7851fd72fa6823a7e7e74ca86a6623025d50211676dfdc61fb8370e4a0650d338d64fa0102f9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3');

        const {signature, publicKey} = parseHeaderAuth(auth);
        expect(signature.toString('hex')).toEqual('8b7a07e514cd38914d9f4628ddb6d4b14c923efe230d4383462343aa5b7851fd72fa6823a7e7e74ca86a6623025d50211676dfdc61fb8370e4a0650d338d64fa');
        expect(publicKey.toString('hex')).toEqual('02f9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3');

        const isValid = ecdsaVerify(signature, dataHash, publicKey);
        expect(isValid).toEqual(true);
    });

    test('empty post', () => {
        const data = {
            timestamp: TIMESTAMP,
        };
        const dataHash = hashObject(data);
        expect(dataHash.toString('hex'))
            .toEqual('29899ccee51d6626b0dd3a32d9f59c4c32f367e79952f0b4469dacd95eb177b6');

        const auth = signRequest(data, PRIVATE_KEY);
        expect(auth).toEqual('0xf3483103c63c62d70f2a16dc134f486beeb65e6ac36ccb676478fa5c78c4853428659d42029c9a62a58e8f7670876fe350356d9e89cfac63614cd76755adb0430002f9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3');
    });
});

/**
 * @param {string} authResult - hex string
 * @return {{signature: Buffer, publicKey: Buffer, recid: number}}
 */
function parseHeaderAuth(authResult) {
    const signature = toBuffer(authResult).subarray(0, 64);
    const recid = toBuffer(authResult)[64];
    const publicKey = toBuffer(authResult).subarray(65);

    return {signature, recid, publicKey};
}
