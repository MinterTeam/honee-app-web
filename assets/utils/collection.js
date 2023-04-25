import get from 'lodash-es/get.js';

/**
 * @template {object} T
 * @template {any} V
 * @param {Array<T>} arr
 * @param {keyof T} path
 * @param {function(T): V} [itemTransformer]
 * @return {Record<string, T|V>}
 */
export function arrayToMap(arr, path, itemTransformer) {
    /** @type {Record<string, T|V>} */
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
 * @return {Partial<T>}
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


/**
 * @param {any} item
 * @returns {boolean}
 */
function isObject(item) {
    return Object.prototype.toString.call(item) === '[object Object]';
}

/**
 * Deep merge objects. Overwrite arrays. Mutates target
 * https://stackoverflow.com/a/34749873/4936667
 * @param {object} target
 * @param {...object} sources
 */
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}

/**
 *
 * @param {object} source
 * @param {(key: string, value: any) => [string, any]} mapper
 * @return {object}
 */
export function mapObject(source, mapper) {
    if (!isObject(source)) {
        return source;
    }

    const result = {};
    for (const key in source) {
        const [newKey, newValue] = mapper(key, source[key]);
        if (isObject(newValue)) {
            result[newKey] = mapObject(newValue, mapper);
        } else {
            result[newKey] = newValue;
        }
    }

    return result;
}
