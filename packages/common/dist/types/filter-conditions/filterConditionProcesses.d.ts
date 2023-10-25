import { FieldType, type SearchTerm } from '../enums/index';
import type { FilterCondition } from '../interfaces/index';
/**
 * General variable types, just 5x types instead of the multiple FieldType.
 * For example all DateIso, DateUs are all "date", this makes it easier to know which filter condition to call
 */
export type GeneralVariableDataType = 'boolean' | 'date' | 'number' | 'object' | 'string';
/** Execute mapped condition (per field type) for each cell in the grid */
export declare const executeFilterConditionTest: FilterCondition;
/**
 * From our search filter value(s), get their parsed value(s), for example a "dateIso" filter will be parsed as Moment object.
 * Then later when we execute the filtering checks, we won't need to re-parse all search value(s) again and again.
 * So this is called only once, for each search filter that is, prior to running the actual filter condition checks on each cell afterward.
 */
export declare function getParsedSearchTermsByFieldType(inputSearchTerms: SearchTerm[] | undefined, inputFilterSearchType: typeof FieldType[keyof typeof FieldType]): SearchTerm | SearchTerm[] | undefined;
/**
 * From a more specific field type, let's return a simple and more general type (boolean, date, number, object, text)
 * @param fieldType - specific field type
 * @returns generalType - general field type
 */
export declare function getVarTypeOfByColumnFieldType(fieldType: typeof FieldType[keyof typeof FieldType]): GeneralVariableDataType;
//# sourceMappingURL=filterConditionProcesses.d.ts.map