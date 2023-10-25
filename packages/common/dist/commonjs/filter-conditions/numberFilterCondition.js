"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterParsedNumbers = exports.executeNumberFilterCondition = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const index_1 = require("../enums/index");
const filterUtilities_1 = require("./filterUtilities");
/** Execute filter condition check on each cell */
exports.executeNumberFilterCondition = ((options, parsedSearchValues) => {
    var _a;
    const cellValue = parseFloat(options.cellValue);
    const [searchValue1, searchValue2] = parsedSearchValues;
    if (searchValue1 === undefined && !options.operator) {
        return true;
    }
    if (searchValue1 !== undefined && searchValue2 !== undefined) {
        let operator = (_a = options === null || options === void 0 ? void 0 : options.operator) !== null && _a !== void 0 ? _a : options.defaultFilterRangeOperator;
        if (operator !== index_1.OperatorType.rangeInclusive && operator !== index_1.OperatorType.rangeExclusive) {
            operator = options.defaultFilterRangeOperator;
        }
        const isInclusive = operator === index_1.OperatorType.rangeInclusive;
        const resultCondition1 = (0, filterUtilities_1.testFilterCondition)((isInclusive ? '>=' : '>'), cellValue, +searchValue1);
        const resultCondition2 = (0, filterUtilities_1.testFilterCondition)((isInclusive ? '<=' : '<'), cellValue, +searchValue2);
        return (resultCondition1 && resultCondition2);
    }
    return (0, filterUtilities_1.testFilterCondition)(options.operator || '==', cellValue, +searchValue1);
});
/**
 * From our search filter value(s), get the parsed value(s).
 * This is called only once per filter before running the actual filter condition check on each cell
 */
function getFilterParsedNumbers(inputSearchTerms) {
    const defaultSearchTerm = 0; // when nothing is provided, we'll default to 0
    const searchTerms = Array.isArray(inputSearchTerms) && inputSearchTerms || [defaultSearchTerm];
    const parsedSearchValues = [];
    let searchValue1;
    let searchValue2;
    if (searchTerms.length === 2 || (typeof searchTerms[0] === 'string' && searchTerms[0].indexOf('..') > 0)) {
        const searchValues = (searchTerms.length === 2) ? searchTerms : searchTerms[0].split('..');
        searchValue1 = parseFloat(Array.isArray(searchValues) ? searchValues[0] : '');
        searchValue2 = parseFloat(Array.isArray(searchValues) ? searchValues[1] : '');
    }
    else {
        searchValue1 = parseFloat(searchTerms[0]);
    }
    if ((0, utils_1.isNumber)(searchValue1, true) && (0, utils_1.isNumber)(searchValue2, true)) {
        parsedSearchValues.push(searchValue1, searchValue2);
    }
    else if ((0, utils_1.isNumber)(searchValue1, true)) {
        parsedSearchValues.push(searchValue1);
    }
    return parsedSearchValues;
}
exports.getFilterParsedNumbers = getFilterParsedNumbers;
//# sourceMappingURL=numberFilterCondition.js.map