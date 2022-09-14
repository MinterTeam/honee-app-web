import {deepMerge} from '~/assets/utils/collection.js';

// Test objects
const testObj1 = { a: 1, b: [1, 1], d: true };
const testObj2 = { a: 2, b: [2, 2], c: { x: 2, y: [2, '😀'] }, e: null };
const testObj3 = { a: 3, b: [3, 3], c: { x: 3, y: [3, '😀'], z: 3 } };

describe('mergeDeep', () => {
    test('clone object', () => {
        const mergedObj = deepMerge({}, testObj2);
        expect(mergedObj).toEqual(testObj2);
    });

    test('deep merge two objects', () => {
        const mergedObj = deepMerge(testObj1, testObj2);
        expect(mergedObj).toEqual({ a: 2, b: [2, 2], c: { x: 2, y: [2, '😀'] }, e: null, d: true });
    });

    test('deep merge three objects', () => {
        const mergedObj = deepMerge(testObj1, testObj2, testObj3);
        expect(mergedObj).toEqual({ a: 3, b: [3, 3], c: { x: 3, y: [3, '😀'], z: 3}, e: null, d: true  });
    });
});
