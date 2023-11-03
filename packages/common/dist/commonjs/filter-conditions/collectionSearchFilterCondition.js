"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCollectionSearchFilterCondition = void 0;
const filterUtilities_1 = require("./filterUtilities");
/**
 * Execute filter condition check on each cell.
 * This is used only by the Select Single/Multiple Filter which uses the "multiple-select.js" 3rd party lib which always provide values as strings
 */
const executeCollectionSearchFilterCondition = (options) => {
    // multiple-select will always return text, so we should make our cell values text as well
    const filterOperator = options.operator;
    let cellValue;
    if (Array.isArray(options.cellValue) && (filterOperator === 'IN_COLLECTION' || filterOperator === 'NOT_IN_COLLECTION')) {
        cellValue = (!!options.cellValue.length ? options.cellValue.map(value => `${value}`) : []);
    }
    else {
        cellValue = (options.cellValue === undefined || options.cellValue === null) ? '' : `${options.cellValue}`;
    }
    return (0, filterUtilities_1.testFilterCondition)(filterOperator || 'IN', cellValue, options.searchTerms || []);
};
exports.executeCollectionSearchFilterCondition = executeCollectionSearchFilterCondition;
//# sourceMappingURL=collectionSearchFilterCondition.js.map