"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyFormatter = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const utilities_1 = require("../services/utilities");
const formatterUtilities_1 = require("./formatterUtilities");
/**
 * This Formatters allow the user to provide any currency symbol (as symbol prefix/suffix) and also provide extra text prefix/suffix.
 * So with this, it allows the user to provide dual prefixes/suffixes via the following params
 * You can pass "minDecimal", "maxDecimal", "decimalSeparator", "thousandSeparator", "numberPrefix", "currencyPrefix", "currencySuffix", and "numberSuffix" to the "params" property.
 * For example:: `{ formatter: Formatters.decimal, params: { minDecimal: 2, maxDecimal: 4, prefix: 'Price ', currencyPrefix: '€', currencySuffix: ' EUR' }}`
 * with value of 33.45 would result into: "Price €33.45 EUR"
 */
const currencyFormatter = (_row, _cell, value, columnDef, _dataContext, grid) => {
    const { currencyPrefix, currencySuffix, minDecimal, maxDecimal, numberPrefix, numberSuffix, decimalSeparator, thousandSeparator, wrapNegativeNumber, } = (0, formatterUtilities_1.retrieveFormatterOptions)(columnDef, grid, 'decimal', 'cell');
    if ((0, utils_1.isNumber)(value)) {
        const formattedNumber = (0, utilities_1.formatNumber)(value, minDecimal, maxDecimal, wrapNegativeNumber, currencyPrefix, currencySuffix, decimalSeparator, thousandSeparator);
        return `${numberPrefix}${formattedNumber}${numberSuffix}`;
    }
    return value;
};
exports.currencyFormatter = currencyFormatter;
//# sourceMappingURL=currencyFormatter.js.map