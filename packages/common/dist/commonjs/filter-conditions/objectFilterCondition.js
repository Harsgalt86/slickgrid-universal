"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterParsedObjectResult = exports.executeObjectFilterCondition = void 0;
const filterUtilities_1 = require("./filterUtilities");
/** Execute filter condition check on each cell */
exports.executeObjectFilterCondition = ((options, parsedSearchValue) => {
    if (parsedSearchValue === undefined && !options.operator) {
        return true;
    }
    const operator = (options.operator || '').toUpperCase();
    switch (operator) {
        case '!=':
        case '<>':
        case 'NE':
            return !(0, filterUtilities_1.compareObjects)(options.cellValue, parsedSearchValue, options.dataKey);
        case '=':
        case '==':
        case 'EQ':
        default:
            return (0, filterUtilities_1.compareObjects)(options.cellValue, parsedSearchValue, options.dataKey);
    }
});
/**
 * From our search filter value(s), get the parsed value(s).
 * This is called only once per filter before running the actual filter condition check on each cell
 */
function getFilterParsedObjectResult(inputSearchTerms) {
    const parsedSearchValue = (Array.isArray(inputSearchTerms) && inputSearchTerms.length > 0) ? inputSearchTerms[0] : '';
    return parsedSearchValue || '';
}
exports.getFilterParsedObjectResult = getFilterParsedObjectResult;
//# sourceMappingURL=objectFilterCondition.js.map