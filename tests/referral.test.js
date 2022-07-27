import secp256k1 from 'secp256k1';
import {toBuffer} from 'ethereumjs-util/dist/bytes.js';
import {signRequest, hashObject, bufferToString} from '~/api/referral.js';
import {keccakFromString} from 'ethereumjs-util/dist/hash.js';

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
        result: '0x9cda3ec5d93ecdf51f7c547f10ae8cfa808ef3ea5fd81ea0d4234a979e13b50a6cca8a998031d10a548d0f30fee242219ced2d63a493f04fd102d5f3a16851420102f9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3',
    },
};

test('signRequest', () => {
    const signature = signRequest(VALID_REQUEST.data, PRIVATE_KEY);
    expect(signature).toEqual(VALID_REQUEST.signature.result);
});

test('recovery', () => {
    const signature = toBuffer(VALID_REQUEST.signature.result).subarray(0, 64);
    const recid = toBuffer(VALID_REQUEST.signature.result)[64];
    const dataHash = hashObject(VALID_REQUEST.data);
    const publicKeyReceived = ecdsaRecover(signature, recid, dataHash, false);
    const publicKeyValid = publicKeyCreate(toBuffer(PRIVATE_KEY), false);
    expect(publicKeyReceived).toEqual(publicKeyValid);
});

test('recovery from bad formed json string returns invalid publicKey', () => {
    const signature = toBuffer(VALID_REQUEST.signature.result).subarray(0, 64);
    const recid = toBuffer(VALID_REQUEST.signature.result)[64];
    const dataHash = keccakFromString('{"enabled": true}');
    const publicKeyReceived = ecdsaRecover(signature, recid, dataHash, false);
    console.log(Buffer.from(publicKeyReceived).toString('hex'));
});

test('verify', () => {
    const signature = toBuffer(VALID_REQUEST.signature.result).subarray(0, 64);
    const publicKey = toBuffer(VALID_REQUEST.signature.result).subarray(65);
    const dataHash = hashObject(VALID_REQUEST.data);
    const isValid = ecdsaVerify(signature, dataHash, publicKey);
    expect(isValid).toEqual(true);
});

test('message hash', () => {
    const hash = bufferToString(hashObject(VALID_REQUEST.data));
    expect(hash).toEqual(VALID_REQUEST.dataHash);
});
