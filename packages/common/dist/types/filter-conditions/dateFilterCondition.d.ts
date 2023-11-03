import { FieldType, type SearchTerm } from '../enums/index';
import type { FilterConditionOption } from '../interfaces/index';
/**
 * Execute Date filter condition check on each cell and use correct date format depending on it's field type (or filterSearchType when that is provided)
 */
export declare function executeDateFilterCondition(options: FilterConditionOption, parsedSearchDates: any[]): boolean;
/**
 * From our search filter value(s), get the parsed value(s), they are parsed as Moment object(s).
 * This is called only once per filter before running the actual filter condition check on each cell
 */
export declare function getFilterParsedDates(inputSearchTerms: SearchTerm[] | undefined, inputFilterSearchType: typeof FieldType[keyof typeof FieldType]): SearchTerm[];
//# sourceMappingURL=dateFilterCondition.d.ts.map