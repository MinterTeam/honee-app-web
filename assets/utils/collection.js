import get from 'lodash-es/get.js';

/**
 * @template {object} T
 * @param {Array<T>} arr
 * @param {string} path
 * @param {function(T): any} [itemTransformer]
 * @return {object}
 */
export function arrayToMap(arr, path, itemTransformer) {
    const map = {};
    arr.forEach((item) => {
        const key = get(item, path);
        const value = typeof itemTransformer === 'function' ? itemTransformer(item) : item;
        map[key] = value;
    });

    return map;
}

/**
 * Ensure empty fields to be undefined
 * @template {object} T
 * @param {T} obj
 * @return {T}
 */
export function clearEmptyFields(obj) {
    let result = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] || obj[key] === 0 || obj[key] === false) {
            result[key] = obj[key];
        }
    });

    return result;
}
