import { decimalFormatted, thousandSeparatorFormatted } from '../services/utilities';
import { retrieveFormatterOptions } from '../formatters/formatterUtilities';
export const avgTotalsFormatter = (totals, columnDef, grid) => {
    var _a, _b;
    const field = (_a = columnDef.field) !== null && _a !== void 0 ? _a : '';
    let val = (_b = totals.avg) === null || _b === void 0 ? void 0 : _b[field];
    const params = columnDef === null || columnDef === void 0 ? void 0 : columnDef.params;
    let prefix = (params === null || params === void 0 ? void 0 : params.groupFormatterPrefix) || '';
    const suffix = (params === null || params === void 0 ? void 0 : params.groupFormatterSuffix) || '';
    const { minDecimal, maxDecimal, decimalSeparator, thousandSeparator, wrapNegativeNumber } = retrieveFormatterOptions(columnDef, grid, 'regular', 'group');
    if (val !== null && !isNaN(+val)) {
        if (val < 0) {
            val = Math.abs(val);
            if (!wrapNegativeNumber) {
                prefix += '-';
            }
            else {
                if (isNaN(minDecimal) && isNaN(maxDecimal)) {
                    const outputVal = thousandSeparatorFormatted(Math.round(val), thousandSeparator);
                    return `${prefix}(${outputVal})${suffix}`;
                }
                return `${prefix}(${decimalFormatted(val, minDecimal, maxDecimal, decimalSeparator, thousandSeparator)})${suffix}`;
            }
        }
        if (isNaN(minDecimal) && isNaN(maxDecimal)) {
            const outputVal = thousandSeparatorFormatted(Math.round(val), thousandSeparator);
            return `${prefix}${outputVal}${suffix}`;
        }
        return `${prefix}${decimalFormatted(val, minDecimal, maxDecimal, decimalSeparator, thousandSeparator)}${suffix}`;
    }
    return '';
};
//# sourceMappingURL=avgTotalsFormatter.js.map