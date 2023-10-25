import { isNumber } from '@slickgrid-universal/utils';
import { formatNumber } from './../services/utilities';
import { retrieveFormatterOptions } from './formatterUtilities';
/** Takes a cell value number (between 0-100) and add the "%" after the number */
export const percentSymbolFormatter = (_row, _cell, value, columnDef, _dataContext, grid) => {
    const { minDecimal, maxDecimal, decimalSeparator, thousandSeparator, wrapNegativeNumber, } = retrieveFormatterOptions(columnDef, grid, 'percent', 'cell');
    if (isNumber(value)) {
        return formatNumber(value, minDecimal, maxDecimal, wrapNegativeNumber, '', '%', decimalSeparator, thousandSeparator);
    }
    return value;
};
//# sourceMappingURL=percentSymbolFormatter.js.map