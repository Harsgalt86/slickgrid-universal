"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterParsedBoolean = exports.executeBooleanFilterCondition = void 0;
const utils_1 = require("@slickgrid-universal/utils");
/** Execute filter condition check on each cell */
exports.executeBooleanFilterCondition = ((options, parsedSearchValue) => {
    return (0, utils_1.parseBoolean)(options.cellValue) === (0, utils_1.parseBoolean)(parsedSearchValue);
});
/**
 * From our search filter value(s), get the parsed value(s).
 * This is called only once per filter before running the actual filter condition check on each cell
 */
function getFilterParsedBoolean(inputSearchTerms) {
    const searchTerm = Array.isArray(inputSearchTerms) && inputSearchTerms[0] || false;
    return (0, utils_1.parseBoolean)(searchTerm);
}
exports.getFilterParsedBoolean = getFilterParsedBoolean;
//# sourceMappingURL=booleanFilterCondition.js.map