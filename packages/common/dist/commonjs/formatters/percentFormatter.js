"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.percentFormatter = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const utilities_1 = require("./../services/utilities");
const formatterUtilities_1 = require("./formatterUtilities");
/** Takes a cell value number (between 0.0-1.0) and displays a red (<50) or green (>=50) bar */
const percentFormatter = (_row, _cell, value, columnDef, _dataContext, grid) => {
    const { minDecimal, maxDecimal, decimalSeparator, thousandSeparator, wrapNegativeNumber, } = (0, formatterUtilities_1.retrieveFormatterOptions)(columnDef, grid, 'percent', 'cell');
    if ((0, utils_1.isNumber)(value)) {
        const percentValue = value * 100;
        return (0, utilities_1.formatNumber)(percentValue, minDecimal, maxDecimal, wrapNegativeNumber, '', '%', decimalSeparator, thousandSeparator);
    }
    return value;
};
exports.percentFormatter = percentFormatter;
//# sourceMappingURL=percentFormatter.js.map