"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.percentSymbolFormatter = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const utilities_1 = require("./../services/utilities");
const formatterUtilities_1 = require("./formatterUtilities");
/** Takes a cell value number (between 0-100) and add the "%" after the number */
const percentSymbolFormatter = (_row, _cell, value, columnDef, _dataContext, grid) => {
    const { minDecimal, maxDecimal, decimalSeparator, thousandSeparator, wrapNegativeNumber, } = (0, formatterUtilities_1.retrieveFormatterOptions)(columnDef, grid, 'percent', 'cell');
    if ((0, utils_1.isNumber)(value)) {
        return (0, utilities_1.formatNumber)(value, minDecimal, maxDecimal, wrapNegativeNumber, '', '%', decimalSeparator, thousandSeparator);
    }
    return value;
};
exports.percentSymbolFormatter = percentSymbolFormatter;
//# sourceMappingURL=percentSymbolFormatter.js.map