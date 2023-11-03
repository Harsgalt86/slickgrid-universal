"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortComparers = void 0;
const booleanSortComparer_1 = require("./booleanSortComparer");
const numericSortComparer_1 = require("./numericSortComparer");
const objectStringSortComparer_1 = require("./objectStringSortComparer");
const stringSortComparer_1 = require("./stringSortComparer");
const dateUtilities_1 = require("./dateUtilities");
const fieldType_enum_1 = require("../enums/fieldType.enum");
// export the Sort Utilities so they could be used by others
__exportStar(require("./sortUtilities"), exports);
exports.SortComparers = {
    /** SortComparer method to sort values as regular strings */
    boolean: booleanSortComparer_1.booleanSortComparer,
    /** SortComparer method to sort values by Date object type (uses Moment.js ISO_8601 standard format, optionally include time) */
    date: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.date),
    /**
     * SortComparer method to sort values by Date formatted as ISO date (excluding time),
     * If you wish to optionally include time simply use the "SortComparers.date" which work with/without time
     */
    dateIso: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateIso),
    /** SortComparer method to sort values by Date formatted as (YYYY-MM-DDTHH:mm:ss.SSSZ) */
    dateUtc: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateUtc),
    /** SortComparer method to sort values by Date and Time (native Date object) */
    dateTime: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTime),
    /** SortComparer method to sort values by Date formatted as (YYYY-MM-DD HH:mm:ss) */
    dateTimeIso: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeIso),
    /** SortComparer method to sort values by Date formatted as (YYYY-MM-DD h:mm:ss a) */
    dateTimeIsoAmPm: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeIsoAmPm),
    /** SortComparer method to sort values by Date formatted as (YYYY-MM-DD h:mm:ss A) */
    dateTimeIsoAM_PM: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeIsoAM_PM),
    /** SortComparer method to sort values by Date formatted as (YYYY-MM-DD HH:mm) */
    dateTimeShortIso: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeShortIso),
    /** SortComparer method to sort values by Date formatted as Euro date (DD/MM/YYYY) */
    dateEuro: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateEuro),
    /** SortComparer method to sort values by Date formatted as Euro short date (D/M/YY) */
    dateEuroShort: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateEuroShort),
    /** SortComparer method to sort values by Date formatted as (DD/MM/YYYY HH:mm) */
    dateTimeShortEuro: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeShortEuro),
    /** SortComparer method to sort values by Date formatted as (DD/MM/YYYY HH:mm:ss) */
    dateTimeEuro: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeEuro),
    /** SortComparer method to sort values by Date formatted as (DD/MM/YYYY hh:mm:ss a) */
    dateTimeEuroAmPm: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeEuroAmPm),
    /** SortComparer method to sort values by Date formatted as (DD/MM/YYYY hh:mm:ss A) */
    dateTimeEuroAM_PM: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeEuroAM_PM),
    /** SortComparer method to sort values by Date formatted as (D/M/YY H:m:s) */
    dateTimeEuroShort: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeEuroShort),
    /** SortComparer method to sort values by Date formatted as (D/M/YY h:m:s a) */
    dateTimeEuroShortAmPm: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeEuroShortAmPm),
    /** SortComparer method to sort values by Date formatted as (D/M/YY h:m:s A) */
    dateTimeEuroShortAM_PM: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeEuroShortAM_PM),
    /** SortComparer method to sort values by Date formatted as US date (MM/DD/YYYY) */
    dateUs: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateUs),
    /** SortComparer method to sort values by Date formatted as US short date (M/D/YY) */
    dateUsShort: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateUsShort),
    /** SortComparer method to sort values by Date formatted as (MM/DD/YYYY HH:mm) */
    dateTimeShortUs: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeShortUs),
    /** SortComparer method to sort values by Date formatted as (MM/DD/YYYY HH:mm:s) */
    dateTimeUs: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeUs),
    /** SortComparer method to sort values by Date formatted as (MM/DD/YYYY hh:mm:ss a) */
    dateTimeUsAmPm: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeUsAmPm),
    /** SortComparer method to sort values by Date formatted as (MM/DD/YYYY hh:mm:ss A) */
    dateTimeUsAM_PM: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeUsAM_PM),
    /** SortComparer method to sort values by Date formatted as (M/D/YY H:m:s) */
    dateTimeUsShort: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeUsShort),
    /** SortComparer method to sort values by Date formatted as (M/D/YY h:m:s a) */
    dateTimeUsShortAmPm: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeUsShortAmPm),
    /** SortComparer method to sort values by Date formatted as (M/D/YY h:m:s A) */
    dateTimeUsShortAM_PM: (0, dateUtilities_1.getAssociatedDateSortComparer)(fieldType_enum_1.FieldType.dateTimeUsShortAM_PM),
    /** SortComparer method to sort values as numeric fields */
    numeric: numericSortComparer_1.numericSortComparer,
    /**
     * SortComparer method to sort object values with a "dataKey" provided in your column definition, it's data content must be of type string
     * Example:
     * columnDef = { id='user', field: 'user', ..., dataKey: 'firstName', SortComparer: SortComparers.objectString }
     * collection = [{ firstName: 'John', lastName: 'Doe' }, { firstName: 'Bob', lastName: 'Cash' }]
     */
    objectString: objectStringSortComparer_1.objectStringSortComparer,
    /** SortComparer method to sort values as regular strings */
    string: stringSortComparer_1.stringSortComparer
};
//# sourceMappingURL=sortComparers.index.js.map