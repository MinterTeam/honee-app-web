import decode from 'entity-decode';
import prettyNum, {PRECISION_SETTING} from 'pretty-num';
import stripZeros from 'pretty-num/src/strip-zeros';
import fromExponential from 'from-exponential';
import parseISO from "date-fns/esm/parseISO";
import format from "date-fns/esm/format";
import formatDistanceStrict from "date-fns/esm/formatDistanceStrict";
// import formatDuration from "date-fns/esm/formatDuration";
// import intervalToDuration from "date-fns/esm/intervalToDuration";
import dateFnsRuLocale from 'date-fns/esm/locale/ru/index.js';
import {txTypeList} from 'minterjs-util/src/tx-types.js';
import {EXPLORER_HOST, HUB_TRANSFER_STATUS, HUB_CHAIN_BY_ID, ACCOUNTS_API_URL, CARD_TO_MINTER_HOST} from "~/assets/variables.js";



export function getAvatarUrl(address) {
    return `${ACCOUNTS_API_URL}avatar/by/address/${address}`;
}


// /**
//  * Get first letter from name string
//  * @param {string} name
//  * @return {string}
//  */
// export function getNameLetter(name) {
//     return name && name.replace(/^@/, '').replace(/^Mx/, '')[0];
// }

export function getExplorerBlockUrl(block) {
    return EXPLORER_HOST + '/blocks/' + block;
}

export function getExplorerTxUrl(hash) {
    return EXPLORER_HOST + '/transactions/' + hash;
}

export function getExplorerAddressUrl(address) {
    return EXPLORER_HOST + '/address/' + address;
}

/**
 * @param {number} chainId
 * @param {string} hash
 * @return {string}
 */
export function getEvmTxUrl(chainId, hash) {
    const host = HUB_CHAIN_BY_ID[Number(chainId)]?.explorerHost;
    return host + '/tx/' + hash;
}


/**
 * @param {number} chainId
 * @param {string} hash
 * @return {string}
 */
export function getEvmAddressUrl(chainId, hash) {
    const host = HUB_CHAIN_BY_ID[Number(chainId)]?.explorerHost;
    return host + '/address/' + hash;
}

export function getCard2MinterUrl({address, returnUrl, finishUrl, coin = 'BIP'}) {
    const query = queryToString({address, returnUrl, finishUrl, coin});
    return `${CARD_TO_MINTER_HOST}/?${query}`;
}

/**
 * camelCase query params to snake_case query string
 * @param {object} queryParams - object with camelCase keys
 * @return {string}
 */
function queryToString(queryParams) {
    return Object.entries(queryParams)
        .filter(([key, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
            const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            return `${snakeCaseKey}=${value}`;
        })
        .join('&');
}

/**
 *
 * @param {string|number} value
 * @param {number} precision
 * @param {PRECISION_SETTING} [precisionSetting]
 * @return {string}
 */
export function prettyNumber(value, precision, precisionSetting) {
    return decode(prettyNum(value, {
        precision,
        precisionSetting,
        separateOneDigit: false,
        thousandsSeparator: '&#x202F;',
    }));
}

/**
 * @param {string|number} value
 * @return {string}
 */
export function pretty(value) {
    if (!value && value !== 0) {
        return '';
    }
    const PRECISION_FIXED = 2;
    const PRECISION = 3;
    if (+value >= 1 || +value <= -1 || Number(value) === 0) {
        return prettyNumber(value, PRECISION_FIXED, PRECISION_SETTING.FIXED);
    } else {
        value = prettyNumber(value, PRECISION, PRECISION_SETTING.REDUCE_SIGNIFICANT);
        value = value.substr(0, 10);
        if (value === '0.00000000') {
            return '0.00';
        }
        return value;
    }
}

/**
 * @param {string|number} value
 * @return {string}
 */
export function prettyUsd(value) {
    return prettyNumber(value, 2, PRECISION_SETTING.FIXED);
}

/**
 * @param {string|number} value
 * @return {string}
 */
export function prettyRound(value) {
    return prettyNumber(value, 0);
}

/**
 * Ensure value to have from 2 to 8 decimal digits
 * @param {string|number} value
 * @return {string}
 */
export function prettyPrecise(value) {
    const parts = stripZeros(fromExponential(value)).split('.');
    const isReduced = parts[1] && parts[1].length > 2;
    if (isReduced) {
        return prettyNumber(value, 8, PRECISION_SETTING.REDUCE);
    } else {
        // ensure at least 2 decimal digits
        return prettyNumber(value, 2, PRECISION_SETTING.FIXED);
    }
}

/**
 * Ensure value to have minimum 2 decimal digits
 * @param {string|number} value
 * @return {string}
 */
export function prettyExact(value) {
    return prettyNumber(value, 2, PRECISION_SETTING.INCREASE);
}

export function decreasePrecisionSignificant(value) {
    return prettyNum(value, {precision: 4, precisionSetting: PRECISION_SETTING.REDUCE_SIGNIFICANT});
}

export function decreasePrecisionFixed(value) {
    return prettyNum(value, {precision: 2, precisionSetting: PRECISION_SETTING.FIXED});
}

/**
 * @param {string} value
 * @param {number} [endLength]
 * @param {number} [minLengthToShort]
 * @return {string}
 */
export function shortHashFilter(value, endLength = 4, minLengthToShort) {
    const startLength = endLength + 'Mx'.length;
    minLengthToShort = minLengthToShort || startLength + endLength;
    value = value.toString();
    const isLong = value.length > minLengthToShort;

    return isLong ? value.substr(0, startLength) + '…' + value.substr(-endLength) : value;
}

/**
 * @param {number} value
 * @return {string}
 */
export function txTypeFilter(value) {
    let name = txTypeList[Number(value)].name; // get type name
    name = name.charAt(0).toUpperCase() + name.slice(1); // capitalize the first letter
    return name;
}

export function removeEmptyKeys(obj) {
    let result = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key]) {
            result[key] = obj[key];
        }
    });

    return result;
}

/**
 * Make function to accept imask values
 * @param {string} propName
 * @param {boolean} [isAcceptUnmasked]
 * @return {Function}
 */
export function makeAccepter(propName, isAcceptUnmasked) {
    return function(e) {
        this.form[propName] = isAcceptUnmasked ? e.detail._unmaskedValue : e.detail._value;
    };
}


/**
 *
 * @param {string|number|Date} timestamp
 * @return {Date|null}
 */
function parseTime(timestamp) {
    if (timestamp instanceof Date) {
        return timestamp;
    }
    if (typeof timestamp === 'string') {
        return parseISO(timestamp);
    }
    if (typeof timestamp === 'number') {
        return new Date(timestamp);
    }

    return null;
}

export function getTimeStamp(timestamp) {
    timestamp = parseTime(timestamp);
    if (!timestamp) {
        return false;
    }

    return format(parseTime(timestamp), 'dd MMM yyyy HH:mm:ss');
}

/**
 * @param {string|number|Date} timestamp
 * @param {object} options
 * @param {'en'|'ru'} [options.locale]
 * @return {string|false}
 */
export function getDateAmerican(timestamp, {locale} = {}) {
    timestamp = parseTime(timestamp);
    if (!timestamp) {
        return false;
    }

    let formatTemplate;
    if (locale === 'ru') {
        formatTemplate = 'd MMMM, yyyy';
    } else { // en
        formatTemplate = 'MMMM d, yyyy';
    }

    return format(parseTime(timestamp), formatTemplate, {locale: getDateFnsLocale(locale)});
}

export function getTime(timestamp) {
    timestamp = parseTime(timestamp);
    if (!timestamp) {
        return false;
    }

    return format(parseTime(timestamp), 'HH:mm:ss');
}

// export function getTimeZone(timestamp) {
//     timestamp = parseTime(timestamp);
//     if (!timestamp) {
//         return false;
//     }
//
//     return format(timestamp, 'O');
// }

/**
 * @param {string|number|Date} timestamp
 * @param {boolean} [allowFuture]
 * @param {{addSuffix?: boolean, unit?: 'second'|'minute'|'hour'|'day'|'month'|'year', roundingMethod?: 'floor'|'ceil'|'round', locale?: string}} [options]
 * @return {boolean|string|*}
 */
export function getTimeDistance(timestamp, allowFuture, options = {}) {
    timestamp = parseTime(timestamp);
    if (!timestamp) {
        return false;
    }

    const now = new Date();
    // if timestamp from future
    if (timestamp > now && !allowFuture) {
        timestamp = now;
    }

    return formatDistanceStrict(timestamp, now, {
        roundingMethod: 'floor',
        ...options,
        locale: getDateFnsLocale(options.locale),
    });
}
/**
 * @param {string|number|Date} timestamp
 * @param {{format?: string[], zero?: boolean, delimiter?: string, locale?: Locale}} [options]
 * @return {string}
 */
/*
export function getDuration(timestamp, options) {
    timestamp = parseTime(timestamp);
    const duration = intervalToDuration({
        start: new Date(0),
        end: timestamp,
    });
    window.intervalToDuration = intervalToDuration;
    console.log('duration', duration);

    return formatDuration(duration, options);
}*/

/**
 * @param {string} [i18nLocaleString]
 * @return {Locale|undefined}
 */
function getDateFnsLocale(i18nLocaleString) {
    if (i18nLocaleString === 'ru') {
        return dateFnsRuLocale;
    } else { // en
        return undefined;
    }
}

/**
 * @param {string} str
 * @return {string}
 */
export function fromBase64(str) {
    //@TODO utf8 https://github.com/dankogai/js-base64
    const asci = window.atob(str);
    try {
        return decodeURIComponent(escape(asci));
    } catch (e) {
        return asci;
    }
}

/**
 * @template T
 * @param {function(...any): Promise<T>} [fn]
 * @param {any|Array<any>} [args]
 * @param {object} [options]
 * @param {boolean} [options.fallbackToArg]
 * @return {Promise<T>}
 */
export function ensurePromise(fn, args, {fallbackToArg} = {}) {
    // ensure `args` is an array
    if (!Array.isArray(args)) {
        args = [args];
    }

    let fnPromise;
    if (typeof fn === 'function') {
        fnPromise = fn(...args);
        // promisify returned value
        if (typeof fnPromise?.then !== 'function') {
            fnPromise = Promise.resolve(fnPromise);
        }
    } else {
        const result = fallbackToArg ? args[0] : undefined;
        fnPromise = Promise.resolve(result);
    }
    return fnPromise;
}

export function suggestionValidatorFilter(suggestion, query) {
    if (!query) {
        return true;
    }
    return [suggestion.value, suggestion.name].some((item) => item?.toLowerCase().includes(query.toLowerCase()));
}

/**
 * @typedef {object} SuggestionValidatorListItem
 * @property {string} [name]
 * @property {string} value
 * @property {string} [delegatedAmount]
 */

/**
 *
 * @param {{suggestion: SuggestionValidatorListItem, query: string}} scope
 * @return {string|*}
 */
export function suggestionValidatorContent(scope) {
    if (!scope) return scope;

    const { suggestion, query } = scope;

    let result = [];
    if (suggestion.name) {
        result.push(`<span class="suggest-item--large">${boldenSuggestion(suggestion.name, query)}</span>`);
    }
    if (suggestion.delegatedAmount) {
        result.push(`<span>(${suggestion.delegatedAmount})</span>`);
    }
    result.push(`<div class="suggest-item--small">${boldenSuggestion(suggestion.value, query)}</div>`);

    return result.join(' ');
}

function boldenSuggestion(text, query) {
    if (!query) {
        return text;
    }
    const queries = query.split(/[\s-_/\\|.]/gm).filter((t) => !!t) || [''];
    return text.replace(new RegExp('(.*?)(' + queries.join('|') + ')(.*?)', 'gi'), '$1<b>$2</b>$3');
}

export function isHubTransferFinished(status) {
    const finishedStatus = {
        [HUB_TRANSFER_STATUS.not_found_long]: true,
        [HUB_TRANSFER_STATUS.batch_executed]: true,
        [HUB_TRANSFER_STATUS.refund]: true,
    };

    return !!finishedStatus[status];
}
