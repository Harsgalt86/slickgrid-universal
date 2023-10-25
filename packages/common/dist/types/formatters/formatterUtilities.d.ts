import { FieldType } from '../enums/fieldType.enum';
import type { Column, ExcelExportOption, Formatter, GridOption, SlickGrid, TextExportOption } from '../interfaces/index';
export type FormatterType = 'group' | 'cell';
export type NumberType = 'decimal' | 'currency' | 'percent' | 'regular';
/**
 * Automatically add a Custom Formatter on all column definitions that have an Editor.
 * Instead of manually adding a Custom Formatter on every column definitions that are editables, let's ask the system to do it in an easier automated way.
 * It will loop through all column definitions and add an Custom Editor Formatter when necessary,
 * also note that if there's already a Formatter on the column definition it will automatically use the Formatters.multiple and add the custom formatter into the `params: formatters: {}}`
 */
export declare function autoAddEditorFormatterToColumnsWithEditor(columnDefinitions: Column[], customEditableFormatter: Formatter): void;
export declare function retrieveFormatterOptions(columnDef: Column, grid: SlickGrid, numberType: NumberType, formatterType: FormatterType): {
    minDecimal: any;
    maxDecimal: any;
    decimalSeparator: any;
    thousandSeparator: any;
    wrapNegativeNumber: any;
    currencyPrefix: any;
    currencySuffix: any;
    numberPrefix: string;
    numberSuffix: string;
};
/**
 * Find the option value from the following (in order of execution)
 * 1- Column Definition "params"
 * 2- Grid Options "formatterOptions"
 * 3- nothing found, return default value provided
 */
export declare function getValueFromParamsOrFormatterOptions(optionName: string, columnDef: Column, gridOptions: GridOption, defaultValue?: any): any;
/** From a FieldType, return the associated date Formatter */
export declare function getAssociatedDateFormatter(fieldType: typeof FieldType[keyof typeof FieldType], defaultSeparator: string): Formatter;
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
export declare function exportWithFormatterWhenDefined<T = any>(row: number, col: number, columnDef: Column<T>, dataContext: T, grid: SlickGrid, exportOptions?: TextExportOption | ExcelExportOption): string;
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
export declare function parseFormatterWhenExist<T = any>(formatter: Formatter<T> | undefined, row: number, col: number, columnDef: Column<T>, dataContext: T, grid: SlickGrid): string;
//# sourceMappingURL=formatterUtilities.d.ts.map