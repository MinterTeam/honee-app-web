import decode from 'entity-decode';
import prettyNum, {PRECISION_SETTING} from 'pretty-num';
import stripZeros from 'pretty-num/src/strip-zeros';
import fromExponential from 'from-exponential';
import parseISO from "date-fns/esm/parseISO";
import format from "date-fns/esm/format";
import formatDistanceStrict from "date-fns/esm/formatDistanceStrict";
import {txTypeList} from 'minterjs-tx/src/tx-types';
import {EXPLORER_HOST, ETHERSCAN_HOST, ACCOUNTS_API_URL, HUB_TRANSFER_STATUS as WITHDRAW_STATUS} from "~/assets/variables.js";



export function getAvatarUrl(address) {
    return `${ACCOUNTS_API_URL}avatar/by/address/${address}`;
}

export function getCoinIconUrl(coinSymbol) {
    return `${ACCOUNTS_API_URL}avatar/by/coin/${coinSymbol}`;
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

export function getEtherscanTxUrl(hash) {
    return ETHERSCAN_HOST + '/tx/' + hash;
}

export function getEtherscanAddressUrl(hash) {
    return ETHERSCAN_HOST + '/address/' + hash;
}

/**
 * @param {string|number} value
 * @return {string}
 */
export function pretty(value) {
    if (!value && value !== 0) {
        return '';
    }
    const PRECISION = 2;
    if (value >= 1 || value <= -1 || Number(value) === 0) {
        return decode(prettyNum(value, {precision: PRECISION, precisionSetting: PRECISION_SETTING.FIXED, thousandsSeparator: '&#x202F;'}));
    } else {
        value = decode(prettyNum(value, {precision: PRECISION, precisionSetting: PRECISION_SETTING.REDUCE_SIGNIFICANT, thousandsSeparator: '&#x202F;'}));
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
export function prettyRound(value) {
    return decode(prettyNum(value, {precision: 0, thousandsSeparator: '&nbsp;'}));
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
        return decode(prettyNum(value, {precision: 8, precisionSetting: PRECISION_SETTING.REDUCE, thousandsSeparator: '&#x202F;'}));
    } else {
        // ensure at least 2 decimal digits
        return decode(prettyNum(value, {precision: 2, precisionSetting: PRECISION_SETTING.FIXED, thousandsSeparator: '&#x202F;'}));
    }
}

/**
 * Ensure value to have minimum 2 decimal digits
 * @param {string|number} value
 * @return {string}
 */
export function prettyExact(value) {
    return decode(prettyNum(value, {precision: 2, precisionSetting: PRECISION_SETTING.INCREASE, thousandsSeparator: '&#x202F;'}));
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
export function shortHashFilter(value, endLength = 6, minLengthToShort) {
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

export function getTimeDistance(timestamp, allowFuture) {
    timestamp = parseTime(timestamp);
    if (!timestamp) {
        return false;
    }

    const now = new Date();
    // if timestamp from future
    if (timestamp > now && !allowFuture) {
        timestamp = now;
    }

    return formatDistanceStrict(timestamp, now, {roundingMethod: 'floor'});
}

export function fromBase64(str) {
    //@TODO utf8 https://github.com/dankogai/js-base64
    const asci = window.atob(str);
    try {
        return decodeURIComponent(escape(asci));
    } catch (e) {
        return asci;
    }
}

export function suggestionValidatorFilter(suggestion, query) {
    if (!query) {
        return true;
    }
    return [suggestion.value, suggestion.name].some((item) => item?.toLowerCase().includes(query.toLowerCase()));
}

/**
 * @typedef {Object} SuggestionValidatorListItem
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
        [WITHDRAW_STATUS.not_found_long]: true,
        [WITHDRAW_STATUS.batch_executed]: true,
        [WITHDRAW_STATUS.refund]: true,
    };

    return !!finishedStatus[status];
}
