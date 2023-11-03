"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lowercaseFormatter = void 0;
/** Takes a value and displays it all lowercase */
const lowercaseFormatter = (_row, _cell, value) => {
    // make sure the value is a string
    if (value !== undefined && typeof value !== 'string') {
        value = value + '';
    }
    return value ? value.toLowerCase() : '';
};
exports.lowercaseFormatter = lowercaseFormatter;
//# sourceMappingURL=lowercaseFormatter.js.map