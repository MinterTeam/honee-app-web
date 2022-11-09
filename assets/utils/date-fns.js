import getUTCISOWeekSrc from 'date-fns/esm/_lib/getUTCISOWeek/index.js';

const getUTCISOWeek = getUTCISOWeekSrc.default || getUTCISOWeekSrc;
console.log(getUTCISOWeek);
/**
 *
 * @param {Date|number} dateLeft
 * @param {Date|number} dateRight
 * @return {number}
 */
export function differenceInCalendarUTCISOWeeks(dateLeft, dateRight) {
    return getUTCISOWeek(dateLeft) - getUTCISOWeek(dateRight);
}
