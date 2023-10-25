import { type SearchTerm } from '../enums/index';
import type { FilterCondition } from '../interfaces/index';
/** Execute filter condition check on each cell */
export declare const executeStringFilterCondition: FilterCondition;
/**
 * From our search filter value(s), get the parsed value(s).
 * This is called only once per filter before running the actual filter condition check on each cell
 */
export declare function getFilterParsedText(inputSearchTerms: SearchTerm[] | undefined): SearchTerm[];
//# sourceMappingURL=stringFilterCondition.d.ts.map