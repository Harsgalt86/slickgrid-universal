"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectStringSortComparer = void 0;
const sortDirectionNumber_enum_1 = require("../enums/sortDirectionNumber.enum");
const objectStringSortComparer = (value1, value2, sortDirection, sortColumn, gridOptions) => {
    var _a, _b;
    if (!sortColumn || !sortColumn.dataKey) {
        throw new Error('Sorting a "FieldType.object" requires you to provide the "dataKey" (object property name) of the object so that we can use it to sort correctly');
    }
    const stringValue1 = (value1 === null || value1 === void 0 ? void 0 : value1.hasOwnProperty(sortColumn.dataKey)) ? value1[sortColumn.dataKey] : value1;
    const stringValue2 = (value2 === null || value2 === void 0 ? void 0 : value2.hasOwnProperty(sortColumn.dataKey)) ? value2[sortColumn.dataKey] : value2;
    const checkForUndefinedValues = (_b = (_a = sortColumn === null || sortColumn === void 0 ? void 0 : sortColumn.valueCouldBeUndefined) !== null && _a !== void 0 ? _a : gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.cellValueCouldBeUndefined) !== null && _b !== void 0 ? _b : false;
    if (sortDirection === undefined || sortDirection === null) {
        sortDirection = sortDirectionNumber_enum_1.SortDirectionNumber.neutral;
    }
    let position = 0;
    if (typeof value1 !== 'object') {
        position = -99e+10;
    }
    else if (typeof value2 !== 'object') {
        position = 99e+10;
    }
    else if (stringValue1 === null || (checkForUndefinedValues && stringValue1 === undefined)) {
        position = -1;
    }
    else if (stringValue2 === null || (checkForUndefinedValues && stringValue2 === undefined)) {
        position = 1;
    }
    else if (stringValue1 === stringValue2) {
        position = 0;
    }
    else if (sortDirection) {
        position = stringValue1 < stringValue2 ? -1 : 1;
    }
    else {
        position = stringValue1 < stringValue2 ? 1 : -1;
    }
    return sortDirection * position;
};
exports.objectStringSortComparer = objectStringSortComparer;
//# sourceMappingURL=objectStringSortComparer.js.map