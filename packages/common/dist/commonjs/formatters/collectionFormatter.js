"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionFormatter = void 0;
const arrayToCsvFormatter_1 = require("./arrayToCsvFormatter");
const index_1 = require("../services/index");
/**
 * Looks up values from the columnDefinition.params.collection property and displays the label in CSV or string format
 * @example
 * // the grid will display 'foo' and 'bar' and not 1 and 2 from your dataset
 * { params: { collection: [{ value: 1, label: 'foo'}, {value: 2, label: 'bar' }] }}
 * const dataset = [1, 2];
 */
const collectionFormatter = (row, cell, value, columnDef, dataContext, grid) => {
    if (!value || !columnDef || !columnDef.params || !columnDef.params.collection
        || !columnDef.params.collection.length) {
        return value;
    }
    const { params, params: { collection } } = columnDef;
    const labelName = (params.customStructure) ? params.customStructure.label : 'label';
    const valueName = (params.customStructure) ? params.customStructure.value : 'value';
    if (Array.isArray(value)) {
        return (0, arrayToCsvFormatter_1.arrayToCsvFormatter)(row, cell, value.map((v) => (0, index_1.findOrDefault)(collection, (c) => c[valueName] === v)[labelName]), columnDef, dataContext, grid);
    }
    return (0, index_1.findOrDefault)(collection, (c) => c[valueName] === value)[labelName] || '';
};
exports.collectionFormatter = collectionFormatter;
//# sourceMappingURL=collectionFormatter.js.map