import {mapObject} from '~/assets/utils/collection.js';

/**
 * @template {any} T
 * @param {Object.<string, T>} source
 * @return {Object.<string, T>}
 */
export function toSnake(source) {
    return mapObject(source, (key, value) => [camelToSnake(key), value]);
}

/**
 * @param {string} value
 * @return {string}
 */
function camelToSnake(value) {
    return value[0].toLowerCase() + value.slice(1).replace(/([A-Z]+)/g, (match, found) => {
        return '_' + found.toLowerCase();
    });
}
