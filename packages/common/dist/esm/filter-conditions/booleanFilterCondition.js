import { parseBoolean } from '@slickgrid-universal/utils';
/** Execute filter condition check on each cell */
export const executeBooleanFilterCondition = ((options, parsedSearchValue) => {
    return parseBoolean(options.cellValue) === parseBoolean(parsedSearchValue);
});
/**
 * From our search filter value(s), get the parsed value(s).
 * This is called only once per filter before running the actual filter condition check on each cell
 */
export function getFilterParsedBoolean(inputSearchTerms) {
    const searchTerm = Array.isArray(inputSearchTerms) && inputSearchTerms[0] || false;
    return parseBoolean(searchTerm);
}
//# sourceMappingURL=booleanFilterCondition.js.map