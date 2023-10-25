import { FieldType } from '../enums/index';
import { executeBooleanFilterCondition, getFilterParsedBoolean } from './booleanFilterCondition';
import { executeCollectionSearchFilterCondition } from './collectionSearchFilterCondition';
import { getFilterParsedNumbers, executeNumberFilterCondition } from './numberFilterCondition';
import { executeDateFilterCondition, getFilterParsedDates } from './dateFilterCondition';
import { executeObjectFilterCondition, getFilterParsedObjectResult } from './objectFilterCondition';
import { executeStringFilterCondition, getFilterParsedText } from './stringFilterCondition';
import { isCollectionOperator } from './filterUtilities';
/** Execute mapped condition (per field type) for each cell in the grid */
export const executeFilterConditionTest = ((options, parsedSearchTerms) => {
    // when using a multi-select ('IN' operator) we will not use the field type but instead go directly with a collection search
    if (isCollectionOperator(options.operator)) {
        return executeCollectionSearchFilterCondition(options);
    }
    // From a more specific field type (dateIso, dateEuro, text, readonly, ...), get the more generalized type (boolean, date, number, object, text)
    const generalizedType = getVarTypeOfByColumnFieldType(options.filterSearchType || options.fieldType);
    // execute the mapped type, or default to String condition check
    switch (generalizedType) {
        case 'boolean':
            // the parsedSearchTerms should be single value (result came from getFilterParsedBoolean() method)
            return executeBooleanFilterCondition(options, parsedSearchTerms);
        case 'date':
            return executeDateFilterCondition(options, (parsedSearchTerms || []));
        case 'number':
            return executeNumberFilterCondition(options, (parsedSearchTerms || []));
        case 'object':
            // the parsedSearchTerms should be single value (result came from getFilterParsedObjectResult() method)
            return executeObjectFilterCondition(options, parsedSearchTerms);
        case 'string':
        default:
            // the parsedSearchTerms should be single value (result came from getFilterParsedText() method)
            return executeStringFilterCondition(options, (parsedSearchTerms || []));
    }
});
/**
 * From our search filter value(s), get their parsed value(s), for example a "dateIso" filter will be parsed as Moment object.
 * Then later when we execute the filtering checks, we won't need to re-parse all search value(s) again and again.
 * So this is called only once, for each search filter that is, prior to running the actual filter condition checks on each cell afterward.
 */
export function getParsedSearchTermsByFieldType(inputSearchTerms, inputFilterSearchType) {
    const generalizedType = getVarTypeOfByColumnFieldType(inputFilterSearchType);
    let parsedSearchValues;
    // parse the search value(s), the Date & Numbers could be in a range and so we will return an array for them
    // any other type will return a single search value
    switch (generalizedType) {
        case 'boolean':
            parsedSearchValues = getFilterParsedBoolean(inputSearchTerms);
            break;
        case 'date':
            parsedSearchValues = getFilterParsedDates(inputSearchTerms, inputFilterSearchType);
            break;
        case 'number':
            parsedSearchValues = getFilterParsedNumbers(inputSearchTerms);
            break;
        case 'object':
            parsedSearchValues = getFilterParsedObjectResult(inputSearchTerms);
            break;
        case 'string':
            parsedSearchValues = getFilterParsedText(inputSearchTerms);
            break;
    }
    return parsedSearchValues;
}
/**
 * From a more specific field type, let's return a simple and more general type (boolean, date, number, object, text)
 * @param fieldType - specific field type
 * @returns generalType - general field type
 */
export function getVarTypeOfByColumnFieldType(fieldType) {
    // return general field type
    switch (fieldType) {
        case FieldType.boolean:
            return 'boolean';
        case FieldType.date:
        case FieldType.dateIso:
        case FieldType.dateUtc:
        case FieldType.dateTime:
        case FieldType.dateTimeIso:
        case FieldType.dateTimeIsoAmPm:
        case FieldType.dateTimeIsoAM_PM:
        case FieldType.dateTimeShortIso:
        case FieldType.dateEuro:
        case FieldType.dateEuroShort:
        case FieldType.dateTimeShortEuro:
        case FieldType.dateTimeEuro:
        case FieldType.dateTimeEuroAmPm:
        case FieldType.dateTimeEuroAM_PM:
        case FieldType.dateTimeEuroShort:
        case FieldType.dateTimeEuroShortAmPm:
        case FieldType.dateTimeEuroShortAM_PM:
        case FieldType.dateUs:
        case FieldType.dateUsShort:
        case FieldType.dateTimeShortUs:
        case FieldType.dateTimeUs:
        case FieldType.dateTimeUsAmPm:
        case FieldType.dateTimeUsAM_PM:
        case FieldType.dateTimeUsShort:
        case FieldType.dateTimeUsShortAmPm:
        case FieldType.dateTimeUsShortAM_PM:
            return 'date';
        case FieldType.integer:
        case FieldType.float:
        case FieldType.number:
            return 'number';
        case FieldType.object:
            return 'object';
        case FieldType.string:
        case FieldType.text:
        case FieldType.password:
        case FieldType.readonly:
        default:
            return 'string';
    }
}
//# sourceMappingURL=filterConditionProcesses.js.map