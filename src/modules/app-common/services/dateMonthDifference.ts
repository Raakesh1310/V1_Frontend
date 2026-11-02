import _ from "lodash";

export type dateReturnObject = {
    dateFrom: {
        year: number;
        month: number;
        day: number;
    };
    dateTo: {
        year: number;
        month: number;
        day: number;
    };
}

/**
 * 
 * @param {Date} date: Date object
 * @param numberOfMonths :  Numbers of month difference required
 * @returns A new Date with "number of months" difference to the passed date object 
 */
export function dateMonthDifference(date: Date,
    numberOfMonths: number): dateReturnObject {
    const dateFrom = _.cloneDeep(date)
    dateFrom.setMonth(date.getMonth() - numberOfMonths);

    return {
        dateFrom: {
            year: dateFrom.getUTCFullYear(),
            month: dateFrom.getUTCMonth() + 1,
            day: dateFrom.getUTCDate()
        },
        dateTo: {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate()
        },
    }
}

/**
 * 
 * @param {Date} date: Date object
 * @param numberOfWeeks :  Numbers of week difference required
 * @returns A new Date with "number of weeks" difference to the passed date object 
 */
export function dateWeekDifference(date: Date,
    numberOfWeeks: number): dateReturnObject {
    const dateFrom = _.cloneDeep(date)
    dateFrom.setDate(date.getDate() - (numberOfWeeks * 7));

    return {
        dateFrom: {
            year: dateFrom.getUTCFullYear(),
            month: dateFrom.getUTCMonth() + 1,
            day: dateFrom.getUTCDate()
        },
        dateTo: {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate()
        },
    }
} 
