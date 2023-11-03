export * from './sortUtilities';
export declare const SortComparers: {
    /** SortComparer method to sort values as regular strings */
    boolean: import("..").SortComparer;
    /** SortComparer method to sort values by Date object type (uses Moment.js ISO_8601 standard format, optionally include time) */
    date: import("..").SortComparer;
    /**
     * SortComparer method to sort values by Date formatted as ISO date (excluding time),
     * If you wish to optionally include time simply use the "SortComparers.date" which work with/without time
     */
    dateIso: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (YYYY-MM-DDTHH:mm:ss.SSSZ) */
    dateUtc: import("..").SortComparer;
    /** SortComparer method to sort values by Date and Time (native Date object) */
    dateTime: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (YYYY-MM-DD HH:mm:ss) */
    dateTimeIso: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (YYYY-MM-DD h:mm:ss a) */
    dateTimeIsoAmPm: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (YYYY-MM-DD h:mm:ss A) */
    dateTimeIsoAM_PM: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (YYYY-MM-DD HH:mm) */
    dateTimeShortIso: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as Euro date (DD/MM/YYYY) */
    dateEuro: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as Euro short date (D/M/YY) */
    dateEuroShort: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (DD/MM/YYYY HH:mm) */
    dateTimeShortEuro: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (DD/MM/YYYY HH:mm:ss) */
    dateTimeEuro: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (DD/MM/YYYY hh:mm:ss a) */
    dateTimeEuroAmPm: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (DD/MM/YYYY hh:mm:ss A) */
    dateTimeEuroAM_PM: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (D/M/YY H:m:s) */
    dateTimeEuroShort: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (D/M/YY h:m:s a) */
    dateTimeEuroShortAmPm: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (D/M/YY h:m:s A) */
    dateTimeEuroShortAM_PM: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as US date (MM/DD/YYYY) */
    dateUs: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as US short date (M/D/YY) */
    dateUsShort: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (MM/DD/YYYY HH:mm) */
    dateTimeShortUs: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (MM/DD/YYYY HH:mm:s) */
    dateTimeUs: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (MM/DD/YYYY hh:mm:ss a) */
    dateTimeUsAmPm: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (MM/DD/YYYY hh:mm:ss A) */
    dateTimeUsAM_PM: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (M/D/YY H:m:s) */
    dateTimeUsShort: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (M/D/YY h:m:s a) */
    dateTimeUsShortAmPm: import("..").SortComparer;
    /** SortComparer method to sort values by Date formatted as (M/D/YY h:m:s A) */
    dateTimeUsShortAM_PM: import("..").SortComparer;
    /** SortComparer method to sort values as numeric fields */
    numeric: import("..").SortComparer;
    /**
     * SortComparer method to sort object values with a "dataKey" provided in your column definition, it's data content must be of type string
     * Example:
     * columnDef = { id='user', field: 'user', ..., dataKey: 'firstName', SortComparer: SortComparers.objectString }
     * collection = [{ firstName: 'John', lastName: 'Doe' }, { firstName: 'Bob', lastName: 'Cash' }]
     */
    objectString: import("..").SortComparer;
    /** SortComparer method to sort values as regular strings */
    string: import("..").SortComparer;
};
//# sourceMappingURL=sortComparers.index.d.ts.map