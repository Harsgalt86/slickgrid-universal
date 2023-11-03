"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterParsedText = exports.executeStringFilterCondition = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const index_1 = require("../enums/index");
const filterUtilities_1 = require("./filterUtilities");
/** Execute filter condition check on each cell */
exports.executeStringFilterCondition = ((options, parsedSearchValues) => {
    var _a;
    let [searchValue1, searchValue2] = parsedSearchValues;
    if (searchValue1 === undefined && !options.operator) {
        return true;
    }
    // make sure the cell value is a string by casting it when possible
    options.cellValue = (options.cellValue === undefined || options.cellValue === null) ? '' : options.cellValue.toString();
    // make both the cell value and search value lower for case insensitive comparison
    const cellValue = (options === null || options === void 0 ? void 0 : options.ignoreAccentOnStringFilterAndSort) ? (0, utils_1.removeAccentFromText)(options.cellValue, true) : options.cellValue.toLowerCase();
    if (typeof searchValue1 === 'string') {
        searchValue1 = (options === null || options === void 0 ? void 0 : options.ignoreAccentOnStringFilterAndSort) ? (0, utils_1.removeAccentFromText)(searchValue1, true) : searchValue1.toLowerCase();
    }
    if (typeof searchValue2 === 'string') {
        searchValue2 = (options === null || options === void 0 ? void 0 : options.ignoreAccentOnStringFilterAndSort) ? (0, utils_1.removeAccentFromText)(searchValue2, true) : searchValue2.toLowerCase();
    }
    if (searchValue1 !== undefined && searchValue2 !== undefined) {
        let operator = (_a = options === null || options === void 0 ? void 0 : options.operator) !== null && _a !== void 0 ? _a : options.defaultFilterRangeOperator;
        if (operator !== index_1.OperatorType.rangeInclusive && operator !== index_1.OperatorType.rangeExclusive) {
            operator = options.defaultFilterRangeOperator;
        }
        const isInclusive = operator === index_1.OperatorType.rangeInclusive;
        const searchResult1 = testStringCondition((isInclusive ? '>=' : '>'), cellValue, searchValue1, options.searchInputLastChar);
        const searchResult2 = testStringCondition((isInclusive ? '<=' : '<'), cellValue, searchValue2, options.searchInputLastChar);
        return searchResult1 && searchResult2;
    }
    const searchResult1 = testStringCondition(options.operator, cellValue, searchValue1, options.searchInputLastChar);
    return searchResult1;
});
/**
 * From our search filter value(s), get the parsed value(s).
 * This is called only once per filter before running the actual filter condition check on each cell
 */
function getFilterParsedText(inputSearchTerms) {
    const defaultSearchTerm = ''; // when nothing is provided, we'll default to 0
    const searchTerms = Array.isArray(inputSearchTerms) && inputSearchTerms || [defaultSearchTerm];
    const parsedSearchValues = [];
    let searchValue1;
    let searchValue2;
    if (searchTerms.length === 2 || (typeof searchTerms[0] === 'string' && searchTerms[0].indexOf('..') > 0)) {
        const searchValues = (searchTerms.length === 2) ? searchTerms : searchTerms[0].split('..');
        searchValue1 = `${Array.isArray(searchValues) ? searchValues[0] : ''}`;
        searchValue2 = `${Array.isArray(searchValues) ? searchValues[1] : ''}`;
    }
    else {
        const parsedSearchValue = (Array.isArray(inputSearchTerms) && inputSearchTerms.length > 0) ? inputSearchTerms[0] : '';
        searchValue1 = parsedSearchValue === undefined || parsedSearchValue === null ? '' : `${parsedSearchValue}`; // make sure it's a string
    }
    if (searchValue1 !== undefined && searchValue2 !== undefined) {
        parsedSearchValues.push(searchValue1, searchValue2);
    }
    else if (searchValue1 !== undefined) {
        parsedSearchValues.push(searchValue1);
    }
    return parsedSearchValues;
}
exports.getFilterParsedText = getFilterParsedText;
/** Execute the filter string test condition, returns a boolean */
function testStringCondition(operator, cellValue, searchValue, searchInputLastChar) {
    if (operator === '*' || operator === index_1.OperatorType.endsWith || operator === '*z') {
        return cellValue.endsWith(searchValue);
    }
    else if ((operator === '' && searchInputLastChar === '*') || operator === index_1.OperatorType.startsWith || operator === 'a*') {
        return cellValue.startsWith(searchValue);
    }
    else if (operator === '' || operator === index_1.OperatorType.contains) {
        return (cellValue.indexOf(searchValue) > -1);
    }
    else if (operator === '<>' || operator === index_1.OperatorType.notContains) {
        return (cellValue.indexOf(searchValue) === -1);
    }
    return (0, filterUtilities_1.testFilterCondition)(operator || '==', cellValue, searchValue);
}
//# sourceMappingURL=stringFilterCondition.js.map