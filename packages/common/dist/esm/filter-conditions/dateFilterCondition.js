import * as moment_ from 'moment-mini';
const moment = moment_['default'] || moment_; // patch to fix rollup "moment has no default export" issue, document here https://github.com/rollup/rollup/issues/670
import { FieldType, OperatorType } from '../enums/index';
import { mapMomentDateFormatWithFieldType } from '../services/utilities';
import { testFilterCondition } from './filterUtilities';
/**
 * Execute Date filter condition check on each cell and use correct date format depending on it's field type (or filterSearchType when that is provided)
 */
export function executeDateFilterCondition(options, parsedSearchDates) {
    var _a;
    const filterSearchType = options && (options.filterSearchType || options.fieldType) || FieldType.dateIso;
    const FORMAT = mapMomentDateFormatWithFieldType(filterSearchType);
    const [searchDate1, searchDate2] = parsedSearchDates;
    // cell value in moment format
    const dateCell = moment(options.cellValue, FORMAT, true);
    // return when cell value is not a valid date
    if ((!searchDate1 && !searchDate2) || !dateCell.isValid()) {
        return false;
    }
    // when comparing with Dates only (without time), we need to disregard the time portion, we can do so by setting our time to start at midnight
    // ref, see https://stackoverflow.com/a/19699447/1212166
    const dateCellTimestamp = FORMAT.toLowerCase().includes('h') ? dateCell.valueOf() : dateCell.clone().startOf('day').valueOf();
    // having 2 search dates, we assume that it's a date range filtering and we'll compare against both dates
    if (searchDate1 && searchDate2) {
        let operator = (_a = options === null || options === void 0 ? void 0 : options.operator) !== null && _a !== void 0 ? _a : options.defaultFilterRangeOperator;
        if (operator !== OperatorType.rangeInclusive && operator !== OperatorType.rangeExclusive) {
            operator = options.defaultFilterRangeOperator;
        }
        const isInclusive = operator === OperatorType.rangeInclusive;
        const resultCondition1 = testFilterCondition((isInclusive ? '>=' : '>'), dateCellTimestamp, searchDate1.valueOf());
        const resultCondition2 = testFilterCondition((isInclusive ? '<=' : '<'), dateCellTimestamp, searchDate2.valueOf());
        return (resultCondition1 && resultCondition2);
    }
    // comparing against a single search date
    const dateSearchTimestamp1 = FORMAT.toLowerCase().includes('h') ? searchDate1.valueOf() : searchDate1.clone().startOf('day').valueOf();
    return testFilterCondition(options.operator || '==', dateCellTimestamp, dateSearchTimestamp1);
}
/**
 * From our search filter value(s), get the parsed value(s), they are parsed as Moment object(s).
 * This is called only once per filter before running the actual filter condition check on each cell
 */
export function getFilterParsedDates(inputSearchTerms, inputFilterSearchType) {
    const searchTerms = Array.isArray(inputSearchTerms) && inputSearchTerms || [];
    const filterSearchType = inputFilterSearchType || FieldType.dateIso;
    const FORMAT = mapMomentDateFormatWithFieldType(filterSearchType);
    const parsedSearchValues = [];
    if (searchTerms.length === 2 || (typeof searchTerms[0] === 'string' && searchTerms[0].indexOf('..') > 0)) {
        const searchValues = (searchTerms.length === 2) ? searchTerms : searchTerms[0].split('..');
        const searchValue1 = (Array.isArray(searchValues) && searchValues[0] || '');
        const searchValue2 = (Array.isArray(searchValues) && searchValues[1] || '');
        const searchDate1 = moment(searchValue1, FORMAT, true);
        const searchDate2 = moment(searchValue2, FORMAT, true);
        // return if any of the 2 values are invalid dates
        if (!searchDate1.isValid() || !searchDate2.isValid()) {
            return [];
        }
        parsedSearchValues.push(searchDate1, searchDate2);
    }
    else {
        // return if the search term is an invalid date
        const searchDate1 = moment(searchTerms[0], FORMAT, true);
        if (!searchDate1.isValid()) {
            return [];
        }
        parsedSearchValues.push(searchDate1);
    }
    return parsedSearchValues;
}
//# sourceMappingURL=dateFilterCondition.js.map