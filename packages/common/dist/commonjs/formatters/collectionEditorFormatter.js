"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionEditorFormatter = void 0;
const arrayToCsvFormatter_1 = require("./arrayToCsvFormatter");
const index_1 = require("../services/index");
/**
 * Roughly the same as the "collectionFormatter" except that it
 * looks up values from the columnDefinition.editor.collection (instead of params) property and displays the label in CSV or string format
 * @example
 * // the grid will display 'foo' and 'bar' and not 1 and 2 from your dataset
 * { editor: { collection: [{ value: 1, label: 'foo'}, {value: 2, label: 'bar' }] }}
 * const dataset = [1, 2];
 */
const collectionEditorFormatter = (row, cell, value, columnDef, dataContext, grid) => {
    if (!value || !columnDef || !columnDef.internalColumnEditor || !columnDef.internalColumnEditor.collection
        || !columnDef.internalColumnEditor.collection.length) {
        return value;
    }
    const { internalColumnEditor, internalColumnEditor: { collection } } = columnDef;
    const labelName = (internalColumnEditor.customStructure) ? internalColumnEditor.customStructure.label : 'label';
    const valueName = (internalColumnEditor.customStructure) ? internalColumnEditor.customStructure.value : 'value';
    if (Array.isArray(value)) {
        if (collection.every((x) => typeof x === 'string')) {
            return (0, arrayToCsvFormatter_1.arrayToCsvFormatter)(row, cell, value.map((v) => (0, index_1.findOrDefault)(collection, (c) => c === v)), columnDef, dataContext, grid);
        }
        else {
            return (0, arrayToCsvFormatter_1.arrayToCsvFormatter)(row, cell, value.map((v) => (0, index_1.findOrDefault)(collection, (c) => c[valueName] === v)[labelName]), columnDef, dataContext, grid);
        }
    }
    return (0, index_1.findOrDefault)(collection, (c) => c[valueName] === value)[labelName] || '';
};
exports.collectionEditorFormatter = collectionEditorFormatter;
//# sourceMappingURL=collectionEditorFormatter.js.map