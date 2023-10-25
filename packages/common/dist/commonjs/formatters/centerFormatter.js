"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.centerFormatter = void 0;
/** Align cell value to the center (alias to Formatters.center) */
const centerFormatter = (_row, _cell, value) => {
    let outputValue = value;
    if (value === null || value === undefined) {
        outputValue = '';
    }
    return `<center>${outputValue}</center>`;
};
exports.centerFormatter = centerFormatter;
//# sourceMappingURL=centerFormatter.js.map