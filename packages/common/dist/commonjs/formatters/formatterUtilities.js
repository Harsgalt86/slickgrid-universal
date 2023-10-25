"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFormatterWhenExist = exports.exportWithFormatterWhenDefined = exports.getAssociatedDateFormatter = exports.getValueFromParamsOrFormatterOptions = exports.retrieveFormatterOptions = exports.autoAddEditorFormatterToColumnsWithEditor = void 0;
const fieldType_enum_1 = require("../enums/fieldType.enum");
const domUtilities_1 = require("../services/domUtilities");
const utilities_1 = require("../services/utilities");
const multipleFormatter_1 = require("./multipleFormatter");
const moment_ = require("moment-mini");
const constants_1 = require("../constants");
const moment = moment_['default'] || moment_; // patch to fix rollup "moment has no default export" issue, document here https://github.com/rollup/rollup/issues/670
/**
 * Automatically add a Custom Formatter on all column definitions that have an Editor.
 * Instead of manually adding a Custom Formatter on every column definitions that are editables, let's ask the system to do it in an easier automated way.
 * It will loop through all column definitions and add an Custom Editor Formatter when necessary,
 * also note that if there's already a Formatter on the column definition it will automatically use the Formatters.multiple and add the custom formatter into the `params: formatters: {}}`
 */
function autoAddEditorFormatterToColumnsWithEditor(columnDefinitions, customEditableFormatter) {
    if (Array.isArray(columnDefinitions)) {
        for (const columnDef of columnDefinitions) {
            if (columnDef.editor) {
                if (columnDef.formatter && columnDef.formatter !== multipleFormatter_1.multipleFormatter && columnDef.formatter !== customEditableFormatter) {
                    const prevFormatter = columnDef.formatter;
                    columnDef.formatter = multipleFormatter_1.multipleFormatter;
                    columnDef.params = { ...columnDef.params, formatters: [prevFormatter, customEditableFormatter] };
                }
                else if (columnDef.formatter && columnDef.formatter === multipleFormatter_1.multipleFormatter && columnDef.params) {
                    // before adding the formatter, make sure it's not yet in the params.formatters list, we wouldn't want to add it multiple times
                    if (columnDef.params.formatters.findIndex((formatter) => formatter === customEditableFormatter) === -1) {
                        columnDef.params.formatters = [...columnDef.params.formatters, customEditableFormatter];
                    }
                }
                else {
                    columnDef.formatter = customEditableFormatter;
                }
            }
        }
    }
}
exports.autoAddEditorFormatterToColumnsWithEditor = autoAddEditorFormatterToColumnsWithEditor;
function retrieveFormatterOptions(columnDef, grid, numberType, formatterType) {
    let defaultMinDecimal;
    let defaultMaxDecimal;
    let numberPrefix = '';
    let numberSuffix = '';
    switch (numberType) {
        case 'currency':
            defaultMinDecimal = constants_1.Constants.DEFAULT_FORMATTER_CURRENCY_MIN_DECIMAL;
            defaultMaxDecimal = constants_1.Constants.DEFAULT_FORMATTER_CURRENCY_MAX_DECIMAL;
            break;
        case 'decimal':
            defaultMinDecimal = constants_1.Constants.DEFAULT_FORMATTER_NUMBER_MIN_DECIMAL;
            defaultMaxDecimal = constants_1.Constants.DEFAULT_FORMATTER_NUMBER_MAX_DECIMAL;
            break;
        case 'percent':
            defaultMinDecimal = constants_1.Constants.DEFAULT_FORMATTER_PERCENT_MIN_DECIMAL;
            defaultMaxDecimal = constants_1.Constants.DEFAULT_FORMATTER_PERCENT_MAX_DECIMAL;
            break;
        default:
            break;
    }
    const gridOptions = ((grid && typeof grid.getOptions === 'function') ? grid.getOptions() : {});
    const minDecimal = getValueFromParamsOrFormatterOptions('minDecimal', columnDef, gridOptions, defaultMinDecimal);
    const maxDecimal = getValueFromParamsOrFormatterOptions('maxDecimal', columnDef, gridOptions, defaultMaxDecimal);
    const decimalSeparator = getValueFromParamsOrFormatterOptions('decimalSeparator', columnDef, gridOptions, constants_1.Constants.DEFAULT_NUMBER_DECIMAL_SEPARATOR);
    const thousandSeparator = getValueFromParamsOrFormatterOptions('thousandSeparator', columnDef, gridOptions, constants_1.Constants.DEFAULT_NUMBER_THOUSAND_SEPARATOR);
    const wrapNegativeNumber = getValueFromParamsOrFormatterOptions('displayNegativeNumberWithParentheses', columnDef, gridOptions, constants_1.Constants.DEFAULT_NEGATIVE_NUMBER_WRAPPED_IN_BRAQUET);
    const currencyPrefix = getValueFromParamsOrFormatterOptions('currencyPrefix', columnDef, gridOptions, '');
    const currencySuffix = getValueFromParamsOrFormatterOptions('currencySuffix', columnDef, gridOptions, '');
    if (formatterType === 'cell') {
        numberPrefix = getValueFromParamsOrFormatterOptions('numberPrefix', columnDef, gridOptions, '');
        numberSuffix = getValueFromParamsOrFormatterOptions('numberSuffix', columnDef, gridOptions, '');
    }
    return { minDecimal, maxDecimal, decimalSeparator, thousandSeparator, wrapNegativeNumber, currencyPrefix, currencySuffix, numberPrefix, numberSuffix };
}
exports.retrieveFormatterOptions = retrieveFormatterOptions;
/**
 * Find the option value from the following (in order of execution)
 * 1- Column Definition "params"
 * 2- Grid Options "formatterOptions"
 * 3- nothing found, return default value provided
 */
function getValueFromParamsOrFormatterOptions(optionName, columnDef, gridOptions, defaultValue) {
    var _a;
    const params = columnDef && columnDef.params;
    if (params && params.hasOwnProperty(optionName)) {
        return params[optionName];
    }
    else if ((_a = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.formatterOptions) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(optionName)) {
        return gridOptions.formatterOptions[optionName];
    }
    return defaultValue;
}
exports.getValueFromParamsOrFormatterOptions = getValueFromParamsOrFormatterOptions;
/** From a FieldType, return the associated date Formatter */
function getAssociatedDateFormatter(fieldType, defaultSeparator) {
    const defaultDateFormat = (0, utilities_1.mapMomentDateFormatWithFieldType)(fieldType);
    return (_row, _cell, value, columnDef, _dataContext, grid) => {
        var _a, _b, _c, _d, _e;
        const gridOptions = ((grid && typeof grid.getOptions === 'function') ? grid.getOptions() : {});
        const customSeparator = (_b = (_a = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.formatterOptions) === null || _a === void 0 ? void 0 : _a.dateSeparator) !== null && _b !== void 0 ? _b : defaultSeparator;
        const inputType = (_c = columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) !== null && _c !== void 0 ? _c : fieldType_enum_1.FieldType.date;
        const inputDateFormat = (0, utilities_1.mapMomentDateFormatWithFieldType)(inputType);
        const isParsingAsUtc = (_e = (_d = columnDef === null || columnDef === void 0 ? void 0 : columnDef.params) === null || _d === void 0 ? void 0 : _d.parseDateAsUtc) !== null && _e !== void 0 ? _e : false;
        const isDateValid = moment(value, inputDateFormat, false).isValid();
        let outputDate = value;
        if (value && isDateValid) {
            outputDate = isParsingAsUtc ? moment.utc(value).format(defaultDateFormat) : moment(value).format(defaultDateFormat);
        }
        // user can customize the separator through the "formatterOptions"
        // if that is the case we need to replace the default "/" to the new separator
        if (outputDate && customSeparator !== defaultSeparator) {
            const regex = new RegExp(defaultSeparator, 'ig'); // find separator globally
            outputDate = outputDate.replace(regex, customSeparator);
        }
        return outputDate;
    };
}
exports.getAssociatedDateFormatter = getAssociatedDateFormatter;
/**
 * Goes through every possible ways to find and apply a Formatter when found,
 * it will first check if a `exportCustomFormatter` is defined else it will check if there's a regular `formatter` and `exportWithFormatter` is enabled.
 * This function is similar to `applyFormatterWhenDefined()` except that it execute any `exportCustomFormatter` while `applyFormatterWhenDefined` does not.
 * @param {Number} row - grid row index
 * @param {Number} col - grid column index
 * @param {Object} dataContext - item data context object
 * @param {Object} columnDef - column definition
 * @param {Object} grid - Slick Grid object
 * @param {Object} exportOptions - Excel or Text Export Options
 * @returns formatted string output or empty string
 */
function exportWithFormatterWhenDefined(row, col, columnDef, dataContext, grid, exportOptions) {
    let isEvaluatingFormatter = false;
    // check if "exportWithFormatter" is provided in the column definition, if so it will have precendence over the Grid Options exportOptions
    if (columnDef === null || columnDef === void 0 ? void 0 : columnDef.hasOwnProperty('exportWithFormatter')) {
        isEvaluatingFormatter = !!columnDef.exportWithFormatter;
    }
    else if (exportOptions === null || exportOptions === void 0 ? void 0 : exportOptions.hasOwnProperty('exportWithFormatter')) {
        // last check in Grid Options export options
        isEvaluatingFormatter = !!exportOptions.exportWithFormatter;
    }
    let formatter;
    if (dataContext && columnDef.exportCustomFormatter) {
        // did the user provide a Custom Formatter for the export
        formatter = columnDef.exportCustomFormatter;
    }
    else if (isEvaluatingFormatter && columnDef.formatter) {
        // or else do we have a column Formatter AND are we evaluating it?
        formatter = columnDef.formatter;
    }
    const output = parseFormatterWhenExist(formatter, row, col, columnDef, dataContext, grid);
    return ((exportOptions === null || exportOptions === void 0 ? void 0 : exportOptions.sanitizeDataExport) && typeof output === 'string') ? (0, domUtilities_1.sanitizeHtmlToText)(output) : output;
}
exports.exportWithFormatterWhenDefined = exportWithFormatterWhenDefined;
/**
 * Takes a Formatter function, execute and return the formatted output
 * @param {Function} formatter - formatter function
 * @param {Number} row - grid row index
 * @param {Number} col - grid column index
 * @param {Object} dataContext - item data context object
 * @param {Object} columnDef - column definition
 * @param {Object} grid - Slick Grid object
 * @returns formatted string output or empty string
 */
function parseFormatterWhenExist(formatter, row, col, columnDef, dataContext, grid) {
    let output = '';
    // does the field have the dot (.) notation and is a complex object? if so pull the first property name
    const fieldId = columnDef.field || columnDef.id || '';
    let fieldProperty = fieldId;
    if (typeof columnDef.field === 'string' && columnDef.field.indexOf('.') > 0) {
        const props = columnDef.field.split('.');
        fieldProperty = (props.length > 0) ? props[0] : columnDef.field;
    }
    const cellValue = (dataContext === null || dataContext === void 0 ? void 0 : dataContext.hasOwnProperty(fieldProperty)) ? dataContext[fieldProperty] : null;
    if (typeof formatter === 'function') {
        const formattedData = formatter(row, col, cellValue, columnDef, dataContext, grid);
        output = formattedData;
        if (formattedData && typeof formattedData === 'object' && formattedData.hasOwnProperty('text')) {
            output = formattedData.text;
        }
        if (output === null || output === undefined) {
            output = '';
        }
    }
    else {
        output = ((!(dataContext === null || dataContext === void 0 ? void 0 : dataContext.hasOwnProperty(fieldProperty))) ? '' : cellValue);
        if (output === null || output === undefined) {
            output = '';
        }
    }
    // if at the end we have an empty object, then replace it with an empty string
    if (typeof output === 'object' && !(output instanceof Date) && Object.entries(output).length === 0) {
        output = '';
    }
    return output;
}
exports.parseFormatterWhenExist = parseFormatterWhenExist;
//# sourceMappingURL=formatterUtilities.js.map