"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVarTypeOfByColumnFieldType = exports.getParsedSearchTermsByFieldType = exports.executeFilterConditionTest = void 0;
const index_1 = require("../enums/index");
const booleanFilterCondition_1 = require("./booleanFilterCondition");
const collectionSearchFilterCondition_1 = require("./collectionSearchFilterCondition");
const numberFilterCondition_1 = require("./numberFilterCondition");
const dateFilterCondition_1 = require("./dateFilterCondition");
const objectFilterCondition_1 = require("./objectFilterCondition");
const stringFilterCondition_1 = require("./stringFilterCondition");
const filterUtilities_1 = require("./filterUtilities");
/** Execute mapped condition (per field type) for each cell in the grid */
exports.executeFilterConditionTest = ((options, parsedSearchTerms) => {
    // when using a multi-select ('IN' operator) we will not use the field type but instead go directly with a collection search
    if ((0, filterUtilities_1.isCollectionOperator)(options.operator)) {
        return (0, collectionSearchFilterCondition_1.executeCollectionSearchFilterCondition)(options);
    }
    // From a more specific field type (dateIso, dateEuro, text, readonly, ...), get the more generalized type (boolean, date, number, object, text)
    const generalizedType = getVarTypeOfByColumnFieldType(options.filterSearchType || options.fieldType);
    // execute the mapped type, or default to String condition check
    switch (generalizedType) {
        case 'boolean':
            // the parsedSearchTerms should be single value (result came from getFilterParsedBoolean() method)
            return (0, booleanFilterCondition_1.executeBooleanFilterCondition)(options, parsedSearchTerms);
        case 'date':
            return (0, dateFilterCondition_1.executeDateFilterCondition)(options, (parsedSearchTerms || []));
        case 'number':
            return (0, numberFilterCondition_1.executeNumberFilterCondition)(options, (parsedSearchTerms || []));
        case 'object':
            // the parsedSearchTerms should be single value (result came from getFilterParsedObjectResult() method)
            return (0, objectFilterCondition_1.executeObjectFilterCondition)(options, parsedSearchTerms);
        case 'string':
        default:
            // the parsedSearchTerms should be single value (result came from getFilterParsedText() method)
            return (0, stringFilterCondition_1.executeStringFilterCondition)(options, (parsedSearchTerms || []));
    }
});
/**
 * From our search filter value(s), get their parsed value(s), for example a "dateIso" filter will be parsed as Moment object.
 * Then later when we execute the filtering checks, we won't need to re-parse all search value(s) again and again.
 * So this is called only once, for each search filter that is, prior to running the actual filter condition checks on each cell afterward.
 */
function getParsedSearchTermsByFieldType(inputSearchTerms, inputFilterSearchType) {
    const generalizedType = getVarTypeOfByColumnFieldType(inputFilterSearchType);
    let parsedSearchValues;
    // parse the search value(s), the Date & Numbers could be in a range and so we will return an array for them
    // any other type will return a single search value
    switch (generalizedType) {
        case 'boolean':
            parsedSearchValues = (0, booleanFilterCondition_1.getFilterParsedBoolean)(inputSearchTerms);
            break;
        case 'date':
            parsedSearchValues = (0, dateFilterCondition_1.getFilterParsedDates)(inputSearchTerms, inputFilterSearchType);
            break;
        case 'number':
            parsedSearchValues = (0, numberFilterCondition_1.getFilterParsedNumbers)(inputSearchTerms);
            break;
        case 'object':
            parsedSearchValues = (0, objectFilterCondition_1.getFilterParsedObjectResult)(inputSearchTerms);
            break;
        case 'string':
            parsedSearchValues = (0, stringFilterCondition_1.getFilterParsedText)(inputSearchTerms);
            break;
    }
    return parsedSearchValues;
}
exports.getParsedSearchTermsByFieldType = getParsedSearchTermsByFieldType;
/**
 * From a more specific field type, let's return a simple and more general type (boolean, date, number, object, text)
 * @param fieldType - specific field type
 * @returns generalType - general field type
 */
function getVarTypeOfByColumnFieldType(fieldType) {
    // return general field type
    switch (fieldType) {
        case index_1.FieldType.boolean:
            return 'boolean';
        case index_1.FieldType.date:
        case index_1.FieldType.dateIso:
        case index_1.FieldType.dateUtc:
        case index_1.FieldType.dateTime:
        case index_1.FieldType.dateTimeIso:
        case index_1.FieldType.dateTimeIsoAmPm:
        case index_1.FieldType.dateTimeIsoAM_PM:
        case index_1.FieldType.dateTimeShortIso:
        case index_1.FieldType.dateEuro:
        case index_1.FieldType.dateEuroShort:
        case index_1.FieldType.dateTimeShortEuro:
        case index_1.FieldType.dateTimeEuro:
        case index_1.FieldType.dateTimeEuroAmPm:
        case index_1.FieldType.dateTimeEuroAM_PM:
        case index_1.FieldType.dateTimeEuroShort:
        case index_1.FieldType.dateTimeEuroShortAmPm:
        case index_1.FieldType.dateTimeEuroShortAM_PM:
        case index_1.FieldType.dateUs:
        case index_1.FieldType.dateUsShort:
        case index_1.FieldType.dateTimeShortUs:
        case index_1.FieldType.dateTimeUs:
        case index_1.FieldType.dateTimeUsAmPm:
        case index_1.FieldType.dateTimeUsAM_PM:
        case index_1.FieldType.dateTimeUsShort:
        case index_1.FieldType.dateTimeUsShortAmPm:
        case index_1.FieldType.dateTimeUsShortAM_PM:
            return 'date';
        case index_1.FieldType.integer:
        case index_1.FieldType.float:
        case index_1.FieldType.number:
            return 'number';
        case index_1.FieldType.object:
            return 'object';
        case index_1.FieldType.string:
        case index_1.FieldType.text:
        case index_1.FieldType.password:
        case index_1.FieldType.readonly:
        default:
            return 'string';
    }
}
exports.getVarTypeOfByColumnFieldType = getVarTypeOfByColumnFieldType;
//# sourceMappingURL=filterConditionProcesses.js.map