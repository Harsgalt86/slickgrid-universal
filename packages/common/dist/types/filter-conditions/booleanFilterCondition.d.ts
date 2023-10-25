import type { SearchTerm } from '../enums/index';
import type { FilterCondition } from './../interfaces/index';
/** Execute filter condition check on each cell */
export declare const executeBooleanFilterCondition: FilterCondition;
/**
 * From our search filter value(s), get the parsed value(s).
 * This is called only once per filter before running the actual filter condition check on each cell
 */
export declare function getFilterParsedBoolean(inputSearchTerms: SearchTerm[] | undefined): boolean;
//# sourceMappingURL=booleanFilterCondition.d.ts.map