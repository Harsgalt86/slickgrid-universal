import type { Column, ExcelStylesheet, Formatter, FormatterType, GetDataValueCallback, GridOption, SlickGrid } from '@slickgrid-universal/common';
export type ExcelFormatter = object & {
    id: number;
};
export declare const getExcelSameInputDataCallback: GetDataValueCallback;
export declare const getExcelNumberCallback: GetDataValueCallback;
/** Parse a number which the user might have provided formatter options (for example a user might have provided { decimalSeparator: ',', thousandSeparator: ' '}) */
export declare function parseNumberWithFormatterOptions(value: any, column: Column, gridOptions: GridOption): any;
/** use different Excel Stylesheet Format as per the Field Type */
export declare function useCellFormatByFieldType(stylesheet: ExcelStylesheet, stylesheetFormatters: any, columnDef: Column, grid: SlickGrid, autoDetect?: boolean): {
    stylesheetFormatterId: number | undefined;
    getDataValueParser: GetDataValueCallback;
};
export declare function getGroupTotalValue(totals: any, columnDef: Column, groupType: string): any;
/** Get numeric formatter options when defined or use default values (minDecimal, maxDecimal, thousandSeparator, decimalSeparator, wrapNegativeNumber) */
export declare function getNumericFormatterOptions(columnDef: Column, grid: SlickGrid, formatterType: FormatterType): {
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
export declare function getFormatterNumericDataType(formatter?: Formatter): "currency" | "decimal" | "percent";
export declare function getExcelFormatFromGridFormatter(stylesheet: ExcelStylesheet, stylesheetFormatters: any, columnDef: Column, grid: SlickGrid, formatterType: FormatterType): {
    stylesheetFormatter: ExcelFormatter;
    groupType: string;
};
//# sourceMappingURL=excelUtils.d.ts.map