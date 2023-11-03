import type { SearchTerm } from '../enums/searchTerm.type';
import type { FilterCondition } from '../interfaces/index';
/** Execute filter condition check on each cell */
export declare const executeObjectFilterCondition: FilterCondition;
/**
 * From our search filter value(s), get the parsed value(s).
 * This is called only once per filter before running the actual filter condition check on each cell
 */
export declare function getFilterParsedObjectResult(inputSearchTerms: SearchTerm[] | undefined): SearchTerm;
//# sourceMappingURL=objectFilterCondition.d.ts.map