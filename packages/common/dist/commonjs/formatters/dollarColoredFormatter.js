"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dollarColoredFormatter = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const utilities_1 = require("./../services/utilities");
const formatterUtilities_1 = require("./formatterUtilities");
/** Display the value as 2 decimals formatted with dollar sign '$' at the end of of the value, change color of text to red/green on negative/positive value */
const dollarColoredFormatter = (_row, _cell, value, columnDef, _dataContext, grid) => {
    const { minDecimal, maxDecimal, decimalSeparator, thousandSeparator, wrapNegativeNumber, } = (0, formatterUtilities_1.retrieveFormatterOptions)(columnDef, grid, 'currency', 'cell');
    if ((0, utils_1.isNumber)(value)) {
        const colorStyle = (value >= 0) ? 'green' : 'red';
        const formattedNumber = (0, utilities_1.formatNumber)(value, minDecimal, maxDecimal, wrapNegativeNumber, '$', '', decimalSeparator, thousandSeparator);
        return `<span style="color:${colorStyle}">${formattedNumber}</span>`;
    }
    return value;
};
exports.dollarColoredFormatter = dollarColoredFormatter;
//# sourceMappingURL=dollarColoredFormatter.js.map