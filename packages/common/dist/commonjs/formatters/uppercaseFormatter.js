"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uppercaseFormatter = void 0;
/** Takes a value and displays it all uppercase */
const uppercaseFormatter = (_row, _cell, value) => {
    // make sure the value is a string
    if (value !== undefined && typeof value !== 'string') {
        value = value + '';
    }
    return value ? value.toUpperCase() : '';
};
exports.uppercaseFormatter = uppercaseFormatter;
//# sourceMappingURL=uppercaseFormatter.js.map