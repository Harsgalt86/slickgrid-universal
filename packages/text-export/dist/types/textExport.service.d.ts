import type { Column, ContainerService, ExternalResource, GridOption, KeyTitlePair, Locale, PubSubService, SlickDataView, SlickGrid, TextExportOption, TextExportService as BaseTextExportService, TranslaterService } from '@slickgrid-universal/common';
import { FileType } from '@slickgrid-universal/common';
type ExportTextDownloadOption = {
    filename: string;
    content: string;
    format: FileType | string;
    mimeType: string;
    useUtf8WithBom?: boolean;
};
export declare class TextExportService implements ExternalResource, BaseTextExportService {
    protected _delimiter: string;
    protected _exportQuoteWrapper: string;
    protected _exportOptions: TextExportOption;
    protected _fileFormat: FileType;
    protected _lineCarriageReturn: string;
    protected _grid: SlickGrid;
    protected _groupedColumnHeaders?: Array<KeyTitlePair>;
    protected _columnHeaders: Array<KeyTitlePair>;
    protected _hasGroupedItems: boolean;
    protected _locales: Locale;
    protected _pubSubService: PubSubService | null;
    protected _translaterService: TranslaterService | undefined;
    /** ExcelExportService class name which is use to find service instance in the external registered services */
    readonly className = "TextExportService";
    constructor();
    protected get _datasetIdPropName(): string;
    /** Getter of SlickGrid DataView object */
    get _dataView(): SlickDataView;
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get _gridOptions(): GridOption;
    dispose(): void;
    /**
     * Initialize the Service
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
     * Example: exportToFile({ format: FileType.csv, delimiter: DelimiterType.comma })
     */
    exportToFile(options?: TextExportOption): Promise<boolean>;
    /**
     * Triggers download file with file format.
     * IE(6-10) are not supported
     * All other browsers will use plain javascript on client side to produce a file download.
     * @param options
     */
    startDownloadFile(options: ExportTextDownloadOption): void;
    protected getDataOutput(): string;
    /**
     * Get all the grid row data and return that as an output string
     */
    protected getAllGridRowData(columns: Column[], lineCarriageReturn: string): string;
    /**
     * Get all Grouped Header Titles and their keys, translate the title when required.
     * @param {Array<object>} columns of the grid
     */
    protected getColumnGroupedHeaderTitles(columns: Column[]): Array<KeyTitlePair>;
    /**
     * Get all header titles and their keys, translate the title when required.
     * @param {Array<object>} columns of the grid
     */
    protected getColumnHeaders(columns: Column[]): Array<KeyTitlePair>;
    /**
     * Get the data of a regular row (a row without grouping)
     * @param {Array<Object>} columns - column definitions
     * @param {Number} row - row index
     * @param {Object} itemObj - item datacontext object
     */
    protected readRegularRowData(columns: Column[], row: number, itemObj: any): string;
    /**
     * Get the grouped title(s) and its group title formatter, for example if we grouped by salesRep, the returned result would be:: 'Sales Rep: John Dow (2 items)'
     * @param itemObj
     */
    protected readGroupedTitleRow(itemObj: any): string;
    /**
     * Get the grouped totals (below the regular rows), these are set by Slick Aggregators.
     * For example if we grouped by "salesRep" and we have a Sum Aggregator on "sales", then the returned output would be:: ["Sum 123$"]
     * @param itemObj
     */
    protected readGroupedTotalRow(columns: Column[], itemObj: any): string;
}
export {};
//# sourceMappingURL=textExport.service.d.ts.map