"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.booleanSortComparer = void 0;
const sortDirectionNumber_enum_1 = require("../enums/sortDirectionNumber.enum");
const booleanSortComparer = (value1, value2, sortDirection) => {
    if (sortDirection === undefined || sortDirection === null) {
        sortDirection = sortDirectionNumber_enum_1.SortDirectionNumber.neutral;
    }
    let position = 0;
    if (value1 === value2) {
        position = 0;
    }
    else if (value1 === null) {
        position = -1;
    }
    else if (value2 === null) {
        position = 1;
    }
    else {
        if (sortDirection) {
            position = value1 < value2 ? -1 : 1;
        }
        else {
            position = value1 < value2 ? 1 : -1;
        }
    }
    return sortDirection * position;
};
exports.booleanSortComparer = booleanSortComparer;
//# sourceMappingURL=booleanSortComparer.js.map