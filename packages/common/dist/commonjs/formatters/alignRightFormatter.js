"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alignRightFormatter = void 0;
/** Align cell value to the right */
const alignRightFormatter = (_row, _cell, value) => {
    let outputValue = value;
    if (value === null || value === undefined) {
        outputValue = '';
    }
    return `<div style="float: right">${outputValue}</div>`;
};
exports.alignRightFormatter = alignRightFormatter;
//# sourceMappingURL=alignRightFormatter.js.map