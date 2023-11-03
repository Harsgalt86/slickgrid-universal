"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boldFormatter = void 0;
/** show value in bold font weight */
const boldFormatter = (_row, _cell, value) => {
    return value ? `<b>${value}</b>` : '';
};
exports.boldFormatter = boldFormatter;
//# sourceMappingURL=boldFormatter.js.map