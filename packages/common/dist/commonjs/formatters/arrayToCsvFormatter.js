"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayToCsvFormatter = void 0;
/** Takes an array of string and converts it to a comma delimited string */
const arrayToCsvFormatter = (_row, _cell, value) => {
    if (value && Array.isArray(value) && value.length > 0) {
        const values = value.join(', ');
        return `<span title="${values}">${values}</span>`;
    }
    return value;
};
exports.arrayToCsvFormatter = arrayToCsvFormatter;
//# sourceMappingURL=arrayToCsvFormatter.js.map