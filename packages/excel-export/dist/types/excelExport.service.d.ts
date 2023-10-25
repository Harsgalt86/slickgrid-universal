import type { Column, ContainerService, ExcelExportService as BaseExcelExportService, ExcelExportOption, ExternalResource, ExcelWorkbook, ExcelWorksheet, GetDataValueCallback, GetGroupTotalValueCallback, GridOption, KeyTitlePair, Locale, PubSubService, SlickDataView, SlickGrid, TranslaterService } from '@slickgrid-universal/common';
import { FileType } from '@slickgrid-universal/common';
import { ExcelCellFormat, ExcelMetadata, ExcelStylesheet } from './interfaces/index';
import { ExcelFormatter } from './excelUtils';
export declare class ExcelExportService implements ExternalResource, BaseExcelExportService {
    protected _fileFormat: FileType;
    protected _grid: SlickGrid;
    protected _locales: Locale;
    protected _groupedColumnHeaders?: Array<KeyTitlePair>;
    protected _columnHeaders: Array<KeyTitlePair>;
    protected _hasColumnTitlePreHeader: boolean;
    protected _hasGroupedItems: boolean;
    protected _excelExportOptions: ExcelExportOption;
    protected _sheet: ExcelWorksheet;
    protected _stylesheet: ExcelStylesheet;
    protected _stylesheetFormats: any;
    protected _pubSubService: PubSubService | null;
    protected _translaterService: TranslaterService | undefined;
    protected _workbook: ExcelWorkbook;
    protected _regularCellExcelFormats: {
        [fieldId: string]: {
            stylesheetFormatterId?: number;
            getDataValueParser: GetDataValueCallback;
        };
    };
    protected _groupTotalExcelFormats: {
        [fieldId: string]: {
            groupType: string;
            stylesheetFormatter?: ExcelFormatter;
            getGroupTotalParser?: GetGroupTotalValueCallback;
        };
    };
    /** ExcelExportService class name which is use to find service instance in the external registered services */
    readonly className = "ExcelExportService";
    protected get _datasetIdPropName(): string;
    /** Getter of SlickGrid DataView object */
    get _dataView(): SlickDataView;
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get _gridOptions(): GridOption;
    get stylesheet(): ExcelStylesheet;
    get stylesheetFormats(): any;
    get groupTotalExcelFormats(): {
        [fieldId: string]: {
            groupType: string;
            stylesheetFormatter?: ExcelFormatter | undefined;
            getGroupTotalParser?: GetGroupTotalValueCallback | undefined;
        };
    };
    get regularCellExcelFormats(): {
        [fieldId: string]: {
            stylesheetFormatterId?: number | undefined;
            getDataValueParser: GetDataValueCallback;
        };
    };
    dispose(): void;
    /**
     * Initialize the Export Service
     * @param grid
     * @param containerService
     */
    init(grid: SlickGrid, containerService: ContainerService): void;
    /**
     * Function to export the Grid result to an Excel CSV format using javascript for it to produce the CSV file.
     * This is a WYSIWYG export to file output (What You See is What You Get)
     *
     * NOTES: The column position needs to match perfectly the JSON Object position because of the way we are pulling the data,
     * which means that if any column(s) got moved in the UI, it has to be reflected in the JSON array output as well
     *
     * Example: exportToExcel({ format: FileType.csv, delimiter: DelimiterType.comma })
     */
    exportToExcel(options?: ExcelExportOption): Promise<boolean>;
    /**
     * Takes a positive integer and returns the corresponding column name.
     * dealing with the Excel column position is a bit tricky since the first 26 columns are single char (A,B,...) but after that it becomes double char (AA,AB,...)
     * so we must first see if we are in the first section of 26 chars, if that is the case we just concatenate 1 (1st row) so it becomes (A1, B1, ...)
     * and again if we go 26, we need to add yet again an extra prefix (AA1, AB1, ...) and so goes the cycle
     * @param {number} colIndex - The positive integer to convert to a column name.
     * @return {string}  The column name.
     */
    getExcelColumnNameByIndex(colIndex: number): string;
    /**
     * Triggers download file with file format.
     * IE(6-10) are not supported
     * All other browsers will use plain javascript on client side to produce a file download.
     * @param options
     */
    startDownloadFile(options: {
        filename: string;
        blob: Blob;
        data: any[];
    }): void;
    protected getDataOutput(): Array<string[] | ExcelCellFormat[]>;
    /** Get each column style including a style for the width of each column */
    protected getColumnStyles(columns: Column[]): any[];
    /**
     * Get all Grouped Header Titles and their keys, translate the title when required, and format them in Bold
     * @param {Array<Object>} columns - grid column definitions
     * @param {Object} metadata - Excel metadata
     * @returns {Object} array of Excel cell format
     */
    protected getColumnGroupedHeaderTitlesData(columns: Column[], metadata: ExcelMetadata): Array<ExcelCellFormat>;
    /** Get all column headers and format them in Bold */
    protected getColumnHeaderData(columns: Column[], metadata: ExcelMetadata): Array<ExcelCellFormat>;
    protected getGroupColumnTitle(): string | null;
    /**
   * Get all Grouped Header Titles and their keys, translate the title when required.
   * @param {Array<object>} columns of the grid
   */
    protected getColumnGroupedHeaderTitles(columns: Column[]): Array<KeyTitlePair>;
    /**
     * Get all header titles and their keys, translate the title when required.
     * @param {Array<object>} columns of the grid
     */
    protected getColumnHeaders(columns: Column[]): Array<KeyTitlePair> | null;
    /**
     * Get all the grid row data and return that as an output string
     */
    protected pushAllGridRowDataToArray(originalDaraArray: Array<Array<string | ExcelCellFormat | number>>, columns: Column[]): Array<Array<string | ExcelCellFormat | number>>;
    /**
     * Get the data of a regular row (a row without grouping)
     * @param {Array<Object>} columns - column definitions
     * @param {Number} row - row index
     * @param {Object} itemObj - item datacontext object
     */
    protected readRegularRowData(columns: Column[], row: number, itemObj: any): string[];
    /**
     * Get the grouped title(s) and its group title formatter, for example if we grouped by salesRep, the returned result would be:: 'Sales Rep: John Dow (2 items)'
     * @param itemObj
     */
    protected readGroupedRowTitle(itemObj: any): string;
    /**
     * Get the grouped totals (below the regular rows), these are set by Slick Aggregators.
     * For example if we grouped by "salesRep" and we have a Sum Aggregator on "sales", then the returned output would be:: ["Sum 123$"]
     * @param itemObj
     */
    protected readGroupedTotalRows(columns: Column[], itemObj: any): Array<ExcelCellFormat | string | number>;
}
//# sourceMappingURL=excelExport.service.d.ts.map