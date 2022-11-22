import {differenceInCalendarUTCISOWeeks} from '~/assets/utils/date-fns.js';

test('differenceInCalendarUTCISOWeeks', () => {
    const BATTLE_START_DATE = new Date('2022-10-24T00:00:00Z');
    const now = new Date("2022-11-07T01:20:44.498+03:00");
    expect(differenceInCalendarUTCISOWeeks(new Date("2022-11-07T01:20:44.498+03:00"), BATTLE_START_DATE))
        .toBe(1);
    expect(differenceInCalendarUTCISOWeeks(new Date("2022-11-07T01:20:44.498Z"), BATTLE_START_DATE))
        .toBe(2);
});
