/**
 * Takes a complex data object and return the data under that property (for example: "user.firstName" will return the first name "John")
 * You can pass the complex structure in the "field" (field: "user.firstName") or in the "params" (labelKey: "firstName", params: { complexField: "user" }) properties.
 * For example::
 * this.columnDefs = [{ id: 'username', field: 'user.firstName', ... }]
 * OR this.columnDefs = [{ id: 'username', field: 'user', labelKey: 'firstName', params: { complexField: 'user' }, ... }]
 * OR this.columnDefs = [{ id: 'username', field: 'user', params: { complexField: 'user.firstName' }, ... }]
 */
export const complexObjectFormatter = (_row, _cell, cellValue, columnDef, dataContext) => {
    var _a, _b, _c;
    if (!columnDef) {
        return '';
    }
    const columnParams = columnDef.params || {};
    const complexField = (_b = (_a = columnParams === null || columnParams === void 0 ? void 0 : columnParams.complexField) !== null && _a !== void 0 ? _a : columnParams === null || columnParams === void 0 ? void 0 : columnParams.complexFieldLabel) !== null && _b !== void 0 ? _b : columnDef.field;
    if (!complexField) {
        throw new Error(`For the Formatters.complexObject to work properly, you need to tell it which property of the complex object to use.
      There are 3 ways to provide it:
      1- via the generic "params" with a "complexField" property on your Column Definition, example: this.columnDefs = [{ id: 'user', field: 'user', params: { complexField: 'user.firstName' } }]
      2- via the generic "params" with a "complexField" and a "labelKey" property on your Column Definition, example: this.columnDefs = [{ id: 'user', field: 'user', labelKey: 'firstName', params: { complexField: 'user' } }]
      3- via the field name that includes a dot notation, example: this.columnDefs = [{ id: 'user', field: 'user.firstName'}] `);
    }
    if (columnDef.labelKey && dataContext.hasOwnProperty(complexField)) {
        return (_c = dataContext[complexField]) === null || _c === void 0 ? void 0 : _c[columnDef.labelKey];
    }
    // when complexField includes the dot ".", we will do the split and get the value from the complex object
    // however we also need to make sure that the complex objet exist, else we'll return the cell value (original value)
    if (typeof complexField === 'string' && complexField.indexOf('.') > 0) {
        let outputValue = complexField.split('.').reduce((obj, i) => ((obj === null || obj === void 0 ? void 0 : obj.hasOwnProperty(i)) ? obj[i] : ''), dataContext);
        if (outputValue === undefined || outputValue === null || (typeof outputValue === 'object' && Object.entries(outputValue).length === 0 && !(outputValue instanceof Date))) {
            outputValue = ''; // return empty string when value ends up being an empty object
        }
        return outputValue;
    }
    return cellValue;
};
//# sourceMappingURL=complexObjectFormatter.js.map