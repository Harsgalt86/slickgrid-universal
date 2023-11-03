"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decimalFormatter = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const utilities_1 = require("./../services/utilities");
const formatterUtilities_1 = require("./formatterUtilities");
/**
 * Display the value as x decimals formatted, defaults to 2 decimals.
 * You can pass "minDecimal" and/or "maxDecimal" to the "params" property.
 * For example:: `{ formatter: Formatters.decimal, params: { minDecimal: 2, maxDecimal: 4 }}`
 */
const decimalFormatter = (_row, _cell, value, columnDef, _dataContext, grid) => {
    const { minDecimal, maxDecimal, numberPrefix, numberSuffix, decimalSeparator, thousandSeparator, wrapNegativeNumber, } = (0, formatterUtilities_1.retrieveFormatterOptions)(columnDef, grid, 'decimal', 'cell');
    if ((0, utils_1.isNumber)(value)) {
        return (0, utilities_1.formatNumber)(value, minDecimal, maxDecimal, wrapNegativeNumber, numberPrefix, numberSuffix, decimalSeparator, thousandSeparator);
    }
    return value;
};
exports.decimalFormatter = decimalFormatter;
//# sourceMappingURL=decimalFormatter.js.map