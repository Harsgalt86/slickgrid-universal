"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.percentCompleteFormatter = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const utilities_1 = require("./../services/utilities");
const formatterUtilities_1 = require("./formatterUtilities");
/** Takes a cell value number (between 0.0-100) and displays a red (<50) or green (>=50) bar */
const percentCompleteFormatter = (_row, _cell, value, columnDef, _dataContext, grid) => {
    const { minDecimal, maxDecimal, decimalSeparator, thousandSeparator, wrapNegativeNumber, } = (0, formatterUtilities_1.retrieveFormatterOptions)(columnDef, grid, 'percent', 'cell');
    if ((0, utils_1.isNumber)(value)) {
        const colorStyle = (value < 50) ? 'red' : 'green';
        const formattedNumber = (0, utilities_1.formatNumber)(value, minDecimal, maxDecimal, wrapNegativeNumber, '', '%', decimalSeparator, thousandSeparator);
        const outputFormattedValue = value > 100 ? '100%' : formattedNumber;
        return `<span style="color:${colorStyle}">${outputFormattedValue}</span>`;
    }
    return value;
};
exports.percentCompleteFormatter = percentCompleteFormatter;
//# sourceMappingURL=percentCompleteFormatter.js.map