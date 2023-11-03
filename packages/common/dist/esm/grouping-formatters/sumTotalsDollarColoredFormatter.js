import { formatNumber } from './../services/utilities';
import { retrieveFormatterOptions } from '../formatters/formatterUtilities';
export const sumTotalsDollarColoredFormatter = (totals, columnDef, grid) => {
    var _a, _b;
    const field = (_a = columnDef.field) !== null && _a !== void 0 ? _a : '';
    const val = (_b = totals.sum) === null || _b === void 0 ? void 0 : _b[field];
    const params = columnDef === null || columnDef === void 0 ? void 0 : columnDef.params;
    const prefix = (params === null || params === void 0 ? void 0 : params.groupFormatterPrefix) || '';
    const suffix = (params === null || params === void 0 ? void 0 : params.groupFormatterSuffix) || '';
    const { minDecimal, maxDecimal, decimalSeparator, thousandSeparator, wrapNegativeNumber } = retrieveFormatterOptions(columnDef, grid, 'currency', 'group');
    if (val !== null && !isNaN(+val)) {
        const colorStyle = (val >= 0) ? 'green' : 'red';
        const formattedNumber = formatNumber(val, minDecimal, maxDecimal, wrapNegativeNumber, '$', '', decimalSeparator, thousandSeparator);
        return `<span style="color:${colorStyle}">${prefix}${formattedNumber}${suffix}</span>`;
    }
    return '';
};
//# sourceMappingURL=sumTotalsDollarColoredFormatter.js.map