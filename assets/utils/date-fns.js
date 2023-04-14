import getUTCISOWeekSrc from 'date-fns/esm/_lib/getUTCISOWeek/index.js';
import getUTCISOWeekYearSrc from 'date-fns/esm/_lib/getUTCISOWeekYear/index.js';
import startOfUTCISOWeekSrc from 'date-fns/esm/_lib/startOfUTCISOWeek/index.js';
import startOfUTCISOWeekYearSrc from 'date-fns/esm/_lib/startOfUTCISOWeekYear/index.js';

const getUTCISOWeek = getUTCISOWeekSrc.default || getUTCISOWeekSrc;
const getUTCISOWeekYear = getUTCISOWeekYearSrc.default || getUTCISOWeekYearSrc;
const startOfUTCISOWeek = startOfUTCISOWeekSrc.default || startOfUTCISOWeekSrc;
const startOfUTCISOWeekYear = startOfUTCISOWeekYearSrc.default || startOfUTCISOWeekYearSrc;

/**
 * week number starting from 1 (so add 1 for each year)
 * @param {Date|number} dateLeft
 * @param {Date|number} dateRight
 * @return {number}
 */
export function differenceInCalendarUTCISOWeeks(dateLeft, dateRight) {
    const dateLeftYear = getUTCISOWeekYear(dateLeft);
    const dateRightYear = getUTCISOWeekYear(dateRight);
    // console.log('dateLeft', dateLeft, dateRight)
    // console.log('dateLeftYear', dateLeftYear, dateRightYear)
    if (dateLeftYear === dateRightYear) {
        return getUTCISOWeek(dateLeft) - getUTCISOWeek(dateRight) + 1;
    } else {
        // console.log('start, end', startOfUTCISOWeekYear(dateLeft), endOfUTCISOWeekYear(dateRight) )
        // console.log(getUTCISOWeek(dateLeft), '-', getUTCISOWeek(startOfUTCISOWeekYear(dateLeft)));
        const leftYearWeeks = getUTCISOWeek(dateLeft) - getUTCISOWeek(startOfUTCISOWeekYear(dateLeft)) + 1;
        // console.log(getUTCISOWeek(endOfUTCISOWeekYear(dateRight)), '-', getUTCISOWeek(dateRight))
        const rightYearWeeks = getUTCISOWeek(endOfUTCISOWeekYear(dateRight)) - getUTCISOWeek(dateRight) + 1;
        // console.log({leftYearWeeks, rightYearWeeks})
        return leftYearWeeks + rightYearWeeks;
    }
}



/**
 * @name endOfUTCISOWeekYear
 * @category ISO Week-Numbering Year Helpers
 * @summary Return the end of an ISO week-numbering year for the given date.
 *
 * @description
 * Return the end of an ISO week-numbering year,
 * which always starts 3 days before the year's first Thursday.
 * The result will be in the UTC timezone.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param {Date|Number} dirtyDate - the original date
 * @returns {Date} the end of an ISO week-numbering year
 *
 * @example
 * // The end of an ISO week-numbering year for 2 July 2005:
 * const result = endOfISOWeekYear(new Date(2005, 6, 2))
 * //=> Sun Jan 01 2006 23:59:59.999
 */
function endOfUTCISOWeekYear(dirtyDate) {
    var year = getUTCISOWeekYear(dirtyDate);
    var fourthOfJanuaryOfNextYear = new Date(0);
    fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
    fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
    var date = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
    date.setMilliseconds(date.getMilliseconds() - 1);
    return date;
}
