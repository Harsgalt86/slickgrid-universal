"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringSortComparer = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const sortDirectionNumber_enum_1 = require("../enums/sortDirectionNumber.enum");
const stringSortComparer = (value1, value2, sortDirection, sortColumn, gridOptions) => {
    var _a, _b;
    if (sortDirection === undefined || sortDirection === null) {
        sortDirection = sortDirectionNumber_enum_1.SortDirectionNumber.neutral;
    }
    let position = 0;
    const checkForUndefinedValues = (_b = (_a = sortColumn === null || sortColumn === void 0 ? void 0 : sortColumn.valueCouldBeUndefined) !== null && _a !== void 0 ? _a : gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.cellValueCouldBeUndefined) !== null && _b !== void 0 ? _b : false;
    if (value1 === value2) {
        position = 0;
    }
    else if (value1 === null || (checkForUndefinedValues && value1 === undefined)) {
        position = -1;
    }
    else if (value2 === null || (checkForUndefinedValues && value2 === undefined)) {
        position = 1;
    }
    else {
        if (gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.ignoreAccentOnStringFilterAndSort) {
            value1 = (0, utils_1.removeAccentFromText)(value1, false);
            value2 = (0, utils_1.removeAccentFromText)(value2, false);
        }
        if (sortDirection) {
            position = value1 < value2 ? -1 : 1;
        }
        else {
            position = value1 < value2 ? 1 : -1;
        }
    }
    return sortDirection * position;
};
exports.stringSortComparer = stringSortComparer;
//# sourceMappingURL=stringSortComparer.js.map