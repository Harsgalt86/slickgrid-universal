"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExcelFormatFromGridFormatter = exports.getFormatterNumericDataType = exports.getNumericFormatterOptions = exports.getGroupTotalValue = exports.useCellFormatByFieldType = exports.parseNumberWithFormatterOptions = exports.getExcelNumberCallback = exports.getExcelSameInputDataCallback = void 0;
const common_1 = require("@slickgrid-universal/common");
// define all type of potential excel data function callbacks
const getExcelSameInputDataCallback = (data) => data;
exports.getExcelSameInputDataCallback = getExcelSameInputDataCallback;
const getExcelNumberCallback = (data, column, excelFormatterId, _excelSheet, gridOptions) => ({
    value: typeof data === 'string' && /\d/g.test(data) ? parseNumberWithFormatterOptions(data, column, gridOptions) : data,
    metadata: { style: excelFormatterId }
});
exports.getExcelNumberCallback = getExcelNumberCallback;
/** Parse a number which the user might have provided formatter options (for example a user might have provided { decimalSeparator: ',', thousandSeparator: ' '}) */
function parseNumberWithFormatterOptions(value, column, gridOptions) {
    let outValue = value;
    if (typeof value === 'string' && value) {
        const decimalSeparator = (0, common_1.getValueFromParamsOrFormatterOptions)('decimalSeparator', column, gridOptions, common_1.Constants.DEFAULT_NUMBER_DECIMAL_SEPARATOR);
        const val = (decimalSeparator === ',')
            ? parseFloat(value.replace(/[^0-9\,\-]+/g, '').replace(',', '.'))
            : parseFloat(value.replace(/[^\d\.\-]/g, ''));
        outValue = isNaN(val) ? value : val;
    }
    return outValue;
}
exports.parseNumberWithFormatterOptions = parseNumberWithFormatterOptions;
/** use different Excel Stylesheet Format as per the Field Type */
function useCellFormatByFieldType(stylesheet, stylesheetFormatters, columnDef, grid, autoDetect = true) {
    const fieldType = (0, common_1.getColumnFieldType)(columnDef);
    let stylesheetFormatterId;
    let callback = exports.getExcelSameInputDataCallback;
    if (fieldType === common_1.FieldType.number && autoDetect) {
        stylesheetFormatterId = getExcelFormatFromGridFormatter(stylesheet, stylesheetFormatters, columnDef, grid, 'cell').stylesheetFormatter.id;
        callback = exports.getExcelNumberCallback;
    }
    return { stylesheetFormatterId, getDataValueParser: callback };
}
exports.useCellFormatByFieldType = useCellFormatByFieldType;
function getGroupTotalValue(totals, columnDef, groupType) {
    var _a, _b;
    return (_b = (_a = totals === null || totals === void 0 ? void 0 : totals[groupType]) === null || _a === void 0 ? void 0 : _a[columnDef.field]) !== null && _b !== void 0 ? _b : 0;
}
exports.getGroupTotalValue = getGroupTotalValue;
/** Get numeric formatter options when defined or use default values (minDecimal, maxDecimal, thousandSeparator, decimalSeparator, wrapNegativeNumber) */
function getNumericFormatterOptions(columnDef, grid, formatterType) {
    var _a;
    let dataType;
    if (formatterType === 'group') {
        switch (columnDef.groupTotalsFormatter) {
            case common_1.GroupTotalFormatters.avgTotalsCurrency:
            case common_1.GroupTotalFormatters.avgTotalsDollar:
            case common_1.GroupTotalFormatters.sumTotalsCurrency:
            case common_1.GroupTotalFormatters.sumTotalsCurrencyColored:
            case common_1.GroupTotalFormatters.sumTotalsDollar:
            case common_1.GroupTotalFormatters.sumTotalsDollarBold:
            case common_1.GroupTotalFormatters.sumTotalsDollarColored:
            case common_1.GroupTotalFormatters.sumTotalsDollarColoredBold:
                dataType = 'currency';
                break;
            case common_1.GroupTotalFormatters.avgTotalsPercentage:
                dataType = 'percent';
                break;
            case common_1.GroupTotalFormatters.avgTotals:
            case common_1.GroupTotalFormatters.minTotals:
            case common_1.GroupTotalFormatters.maxTotals:
            case common_1.GroupTotalFormatters.sumTotals:
            case common_1.GroupTotalFormatters.sumTotalsColored:
            case common_1.GroupTotalFormatters.sumTotalsBold:
            default:
                // side note, formatters are using "regular" without any decimal limits (min, max),
                // however in Excel export with custom format that doesn't work so well, we should use "decimal" to at least show optional decimals with "##"
                dataType = 'decimal';
                break;
        }
    }
    else {
        // when formatter is a Formatter.multiple, we need to loop through each of its formatter to find the best numeric data type
        if (columnDef.formatter === common_1.Formatters.multiple && Array.isArray((_a = columnDef.params) === null || _a === void 0 ? void 0 : _a.formatters)) {
            dataType = 'decimal';
            for (const formatter of columnDef.params.formatters) {
                dataType = getFormatterNumericDataType(formatter);
                if (dataType !== 'decimal') {
                    break; // if we found something different than the default (decimal) then we can assume that we found our type so we can stop & return
                }
            }
        }
        else {
            dataType = getFormatterNumericDataType(columnDef.formatter);
        }
    }
    return (0, common_1.retrieveFormatterOptions)(columnDef, grid, dataType, formatterType);
}
exports.getNumericFormatterOptions = getNumericFormatterOptions;
function getFormatterNumericDataType(formatter) {
    let dataType;
    switch (formatter) {
        case common_1.Formatters.currency:
        case common_1.Formatters.dollar:
        case common_1.Formatters.dollarColored:
        case common_1.Formatters.dollarColoredBold:
            dataType = 'currency';
            break;
        case common_1.Formatters.percent:
        case common_1.Formatters.percentComplete:
        case common_1.Formatters.percentCompleteBar:
        case common_1.Formatters.percentCompleteBarWithText:
        case common_1.Formatters.percentSymbol:
            dataType = 'percent';
            break;
        case common_1.Formatters.decimal:
        default:
            // use "decimal" instead of "regular" to show optional decimals "##" in Excel
            dataType = 'decimal';
            break;
    }
    return dataType;
}
exports.getFormatterNumericDataType = getFormatterNumericDataType;
function getExcelFormatFromGridFormatter(stylesheet, stylesheetFormatters, columnDef, grid, formatterType) {
    var _a;
    let format = '';
    let groupType = '';
    let stylesheetFormatter;
    const fieldType = (0, common_1.getColumnFieldType)(columnDef);
    if (formatterType === 'group') {
        switch (columnDef.groupTotalsFormatter) {
            case common_1.GroupTotalFormatters.avgTotals:
            case common_1.GroupTotalFormatters.avgTotalsCurrency:
            case common_1.GroupTotalFormatters.avgTotalsDollar:
            case common_1.GroupTotalFormatters.avgTotalsPercentage:
                groupType = 'avg';
                break;
            case common_1.GroupTotalFormatters.minTotals:
                groupType = 'min';
                break;
            case common_1.GroupTotalFormatters.maxTotals:
                groupType = 'max';
                break;
            case common_1.GroupTotalFormatters.sumTotals:
            case common_1.GroupTotalFormatters.sumTotalsBold:
            case common_1.GroupTotalFormatters.sumTotalsColored:
            case common_1.GroupTotalFormatters.sumTotalsCurrency:
            case common_1.GroupTotalFormatters.sumTotalsCurrencyColored:
            case common_1.GroupTotalFormatters.sumTotalsDollar:
            case common_1.GroupTotalFormatters.sumTotalsDollarColoredBold:
            case common_1.GroupTotalFormatters.sumTotalsDollarColored:
            case common_1.GroupTotalFormatters.sumTotalsDollarBold:
                groupType = 'sum';
                break;
            default:
                stylesheetFormatter = stylesheetFormatters.numberFormatter;
                break;
        }
    }
    else {
        switch (fieldType) {
            case common_1.FieldType.number:
                switch (columnDef.formatter) {
                    case common_1.Formatters.multiple:
                        // when formatter is a Formatter.multiple, we need to loop through each of its formatter to find the best possible Excel format
                        if (Array.isArray((_a = columnDef.params) === null || _a === void 0 ? void 0 : _a.formatters)) {
                            for (const formatter of columnDef.params.formatters) {
                                const { stylesheetFormatter: stylesheetFormatterResult } = getExcelFormatFromGridFormatter(stylesheet, stylesheetFormatters, { ...columnDef, formatter }, grid, formatterType);
                                if (stylesheetFormatterResult !== stylesheetFormatters.numberFormatter) {
                                    stylesheetFormatter = stylesheetFormatterResult;
                                    break;
                                }
                            }
                        }
                        if (!stylesheetFormatter) {
                            stylesheetFormatter = stylesheetFormatters.numberFormatter;
                        }
                        break;
                    case common_1.Formatters.currency:
                    case common_1.Formatters.decimal:
                    case common_1.Formatters.dollar:
                    case common_1.Formatters.dollarColored:
                    case common_1.Formatters.dollarColoredBold:
                    case common_1.Formatters.percent:
                    case common_1.Formatters.percentComplete:
                    case common_1.Formatters.percentCompleteBar:
                    case common_1.Formatters.percentCompleteBarWithText:
                    case common_1.Formatters.percentSymbol:
                        format = createExcelFormatFromGridFormatter(columnDef, grid, 'cell');
                        break;
                    default:
                        stylesheetFormatter = stylesheetFormatters.numberFormatter;
                        break;
                }
                break;
        }
    }
    if (!stylesheetFormatter && (columnDef.formatter || columnDef.groupTotalsFormatter)) {
        format = createExcelFormatFromGridFormatter(columnDef, grid, formatterType, groupType);
        if (!stylesheetFormatters.hasOwnProperty(format)) {
            stylesheetFormatters[format] = stylesheet.createFormat({ format }); // save new formatter with its format as a prop key
        }
        stylesheetFormatter = stylesheetFormatters[format];
    }
    return { stylesheetFormatter: stylesheetFormatter, groupType };
}
exports.getExcelFormatFromGridFormatter = getExcelFormatFromGridFormatter;
// --
// private functions
// ------------------
function createFormatFromNumber(formattedVal) {
    // full number syntax can have up to 7 sections, for example::
    // Total: ($10,420.55 USD) Expensed
    const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _, prefix, openBraquet, symbolPrefix, number, symbolSuffix, closingBraquet, suffix] = (formattedVal === null || formattedVal === void 0 ? void 0 : formattedVal.match(/^([^\d\(\-]*)([\(]?)([^\d]*)([\-]?[\w]]?[\d\s]*[.,\d]*[\d]*[^)\s\%]?)([^\d.,)]*)([\)]?)([^\d]*)$/i)) || [];
    // we use 1 so that they won't be removed when rounding numbers, however Excel uses 0 and # symbol
    // replace 1's by 0's (required numbers) and replace 2's by "#" (optional numbers)
    const replacedNumber = (number || '').replace(/1/g, '0').replace(/[2]/g, '#');
    const format = [
        escapeQuotes(prefix !== null && prefix !== void 0 ? prefix : ''),
        openBraquet !== null && openBraquet !== void 0 ? openBraquet : '',
        escapeQuotes(symbolPrefix !== null && symbolPrefix !== void 0 ? symbolPrefix : ''),
        replacedNumber,
        escapeQuotes(symbolSuffix !== null && symbolSuffix !== void 0 ? symbolSuffix : ''),
        closingBraquet !== null && closingBraquet !== void 0 ? closingBraquet : '',
        escapeQuotes(suffix !== null && suffix !== void 0 ? suffix : '')
    ].join('');
    return format.replace(',', '\,');
}
function createExcelFormatFromGridFormatter(columnDef, grid, formatterType, groupType = '') {
    let outputFormat = '';
    let positiveFormat = '';
    let negativeFormat = '';
    const { minDecimal, maxDecimal, thousandSeparator } = getNumericFormatterOptions(columnDef, grid, formatterType);
    const leftInteger = thousandSeparator ? '2220' : '0';
    const testingNo = parseFloat(`${leftInteger}.${excelTestingDecimalNumberPadding(minDecimal, maxDecimal)}`);
    if (formatterType === 'group' && columnDef.groupTotalsFormatter) {
        positiveFormat = (0, common_1.sanitizeHtmlToText)(columnDef.groupTotalsFormatter({ [groupType]: { [columnDef.field]: testingNo } }, columnDef, grid));
        negativeFormat = (0, common_1.sanitizeHtmlToText)(columnDef.groupTotalsFormatter({ [groupType]: { [columnDef.field]: -testingNo } }, columnDef, grid));
    }
    else if (columnDef.formatter) {
        positiveFormat = (0, common_1.sanitizeHtmlToText)(columnDef.formatter(0, 0, testingNo, columnDef, {}, grid));
        negativeFormat = (0, common_1.sanitizeHtmlToText)(columnDef.formatter(0, 0, -testingNo, columnDef, {}, grid));
    }
    if (positiveFormat && negativeFormat) {
        outputFormat = createFormatFromNumber(positiveFormat) + ';' + createFormatFromNumber(negativeFormat);
    }
    return outputFormat;
}
function escapeQuotes(val) {
    return val ? `"${val}"` : val;
}
/** Get number format for a number cell, for example { minDecimal: 2, maxDecimal: 5 } will return "00###" */
function excelTestingDecimalNumberPadding(minDecimal, maxDecimal) {
    return textPadding('1', minDecimal) + textPadding('2', maxDecimal - minDecimal);
}
function textPadding(numberStr, count) {
    let output = '';
    for (let i = 0; i < count; i++) {
        output += numberStr;
    }
    return output;
}
//# sourceMappingURL=excelUtils.js.map