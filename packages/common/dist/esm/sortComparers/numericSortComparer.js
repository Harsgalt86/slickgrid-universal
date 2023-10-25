export const numericSortComparer = (value1, value2, sortDirection, sortColumn, gridOptions) => {
    var _a, _b;
    const checkForUndefinedValues = (_b = (_a = sortColumn === null || sortColumn === void 0 ? void 0 : sortColumn.valueCouldBeUndefined) !== null && _a !== void 0 ? _a : gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.cellValueCouldBeUndefined) !== null && _b !== void 0 ? _b : false;
    const x = (isNaN(value1) || value1 === '' || value1 === null || (checkForUndefinedValues && value1 === undefined)) ? -99e+10 : parseFloat(value1);
    const y = (isNaN(value2) || value2 === '' || value2 === null || (checkForUndefinedValues && value2 === undefined)) ? -99e+10 : parseFloat(value2);
    return sortDirection * (x === y ? 0 : (x > y ? 1 : -1));
};
//# sourceMappingURL=numericSortComparer.js.map