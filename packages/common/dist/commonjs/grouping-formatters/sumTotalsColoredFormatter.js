"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sumTotalsColoredFormatter = void 0;
const utilities_1 = require("../services/utilities");
const formatterUtilities_1 = require("../formatters/formatterUtilities");
const sumTotalsColoredFormatter = (totals, columnDef, grid) => {
    var _a, _b;
    const field = (_a = columnDef.field) !== null && _a !== void 0 ? _a : '';
    const val = (_b = totals.sum) === null || _b === void 0 ? void 0 : _b[field];
    const params = columnDef === null || columnDef === void 0 ? void 0 : columnDef.params;
    const prefix = (params === null || params === void 0 ? void 0 : params.groupFormatterPrefix) || '';
    const suffix = (params === null || params === void 0 ? void 0 : params.groupFormatterSuffix) || '';
    const { minDecimal, maxDecimal, decimalSeparator, thousandSeparator, wrapNegativeNumber } = (0, formatterUtilities_1.retrieveFormatterOptions)(columnDef, grid, 'regular', 'group');
    if (val !== null && !isNaN(+val)) {
        const colorStyle = (val >= 0) ? 'green' : 'red';
        const formattedNumber = (0, utilities_1.formatNumber)(val, minDecimal, maxDecimal, wrapNegativeNumber, '', '', decimalSeparator, thousandSeparator);
        return `<span style="color:${colorStyle}">${prefix}${formattedNumber}${suffix}</span>`;
    }
    return '';
};
exports.sumTotalsColoredFormatter = sumTotalsColoredFormatter;
//# sourceMappingURL=sumTotalsColoredFormatter.js.map