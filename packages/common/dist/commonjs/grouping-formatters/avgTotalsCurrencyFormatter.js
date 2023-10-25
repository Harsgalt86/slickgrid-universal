"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.avgTotalsCurrencyFormatter = void 0;
const formatterUtilities_1 = require("../formatters/formatterUtilities");
const utilities_1 = require("../services/utilities");
const avgTotalsCurrencyFormatter = (totals, columnDef, grid) => {
    var _a, _b;
    const field = (_a = columnDef.field) !== null && _a !== void 0 ? _a : '';
    const val = (_b = totals.avg) === null || _b === void 0 ? void 0 : _b[field];
    const params = columnDef === null || columnDef === void 0 ? void 0 : columnDef.params;
    const prefix = (params === null || params === void 0 ? void 0 : params.groupFormatterPrefix) || '';
    const suffix = (params === null || params === void 0 ? void 0 : params.groupFormatterSuffix) || '';
    const currencyPrefix = (params === null || params === void 0 ? void 0 : params.groupFormatterCurrencyPrefix) || '';
    const currencySuffix = (params === null || params === void 0 ? void 0 : params.groupFormatterCurrencySuffix) || '';
    const { minDecimal, maxDecimal, decimalSeparator, thousandSeparator, wrapNegativeNumber } = (0, formatterUtilities_1.retrieveFormatterOptions)(columnDef, grid, 'currency', 'group');
    if (val !== null && !isNaN(+val)) {
        const formattedNumber = (0, utilities_1.formatNumber)(val, minDecimal, maxDecimal, wrapNegativeNumber, currencyPrefix, currencySuffix, decimalSeparator, thousandSeparator);
        return `${prefix}${formattedNumber}${suffix}`;
    }
    return '';
};
exports.avgTotalsCurrencyFormatter = avgTotalsCurrencyFormatter;
//# sourceMappingURL=avgTotalsCurrencyFormatter.js.map