"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelExportService = void 0;
const ExcelBuilder_ = require("excel-builder-webpacker");
const ExcelBuilder = ExcelBuilder_['default'] || ExcelBuilder_; // patch to fix rollup "ExcelBuilder has no default export" issue, document here https://github.com/rollup/rollup/issues/670
const common_1 = require("@slickgrid-universal/common");
const utils_1 = require("@slickgrid-universal/utils");
const excelUtils_1 = require("./excelUtils");
const DEFAULT_EXPORT_OPTIONS = {
    filename: 'export',
    format: common_1.FileType.xlsx
};
class ExcelExportService {
    constructor() {
        this._fileFormat = common_1.FileType.xlsx;
        this._columnHeaders = [];
        this._hasColumnTitlePreHeader = false;
        this._hasGroupedItems = false;
        this._pubSubService = null;
        // references of each detected cell and/or group total formats
        this._regularCellExcelFormats = {};
        this._groupTotalExcelFormats = {};
        /** ExcelExportService class name which is use to find service instance in the external registered services */
        this.className = 'ExcelExportService';
    }
    get _datasetIdPropName() {
        var _a, _b;
        return (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.datasetIdPropertyName) !== null && _b !== void 0 ? _b : 'id';
    }
    /** Getter of SlickGrid DataView object */
    get _dataView() {
        var _a;
        return ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getData());
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get _gridOptions() {
        var _a;
        return ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions()) || {};
    }
    get stylesheet() {
        return this._stylesheet;
    }
    get stylesheetFormats() {
        return this._stylesheetFormats;
    }
    get groupTotalExcelFormats() {
        return this._groupTotalExcelFormats;
    }
    get regularCellExcelFormats() {
        return this._regularCellExcelFormats;
    }
    dispose() {
        var _a;
        (_a = this._pubSubService) === null || _a === void 0 ? void 0 : _a.unsubscribeAll();
    }
    /**
     * Initialize the Export Service
     * @param grid
     * @param containerService
     */
    init(grid, containerService) {
        var _a, _b, _c;
        this._grid = grid;
        this._pubSubService = containerService.get('PubSubService');
        // get locales provided by user in main file or else use default English locales via the Constants
        this._locales = (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.locales) !== null && _b !== void 0 ? _b : common_1.Constants.locales;
        this._translaterService = (_c = this._gridOptions) === null || _c === void 0 ? void 0 : _c.translater;
        if (this._gridOptions.enableTranslate && (!this._translaterService || !this._translaterService.translate)) {
            throw new Error('[Slickgrid-Universal] requires a Translate Service to be passed in the "translater" Grid Options when "enableTranslate" is enabled. (example: this.gridOptions = { enableTranslate: true, translater: this.translaterService })');
        }
    }
    /**
     * Function to export the Grid result to an Excel CSV format using javascript for it to produce the CSV file.
     * This is a WYSIWYG export to file output (What You See is What You Get)
     *
     * NOTES: The column position needs to match perfectly the JSON Object position because of the way we are pulling the data,
     * which means that if any column(s) got moved in the UI, it has to be reflected in the JSON array output as well
     *
     * Example: exportToExcel({ format: FileType.csv, delimiter: DelimiterType.comma })
     */
    exportToExcel(options) {
        var _a;
        if (!this._grid || !this._dataView || !this._pubSubService) {
            throw new Error('[Slickgrid-Universal] it seems that the SlickGrid & DataView objects and/or PubSubService are not initialized did you forget to enable the grid option flag "enableExcelExport"?');
        }
        (_a = this._pubSubService) === null || _a === void 0 ? void 0 : _a.publish(`onBeforeExportToExcel`, true);
        this._excelExportOptions = (0, utils_1.deepCopy)({ ...DEFAULT_EXPORT_OPTIONS, ...this._gridOptions.excelExportOptions, ...options });
        this._fileFormat = this._excelExportOptions.format || common_1.FileType.xlsx;
        // reset references of detected Excel formats
        this._regularCellExcelFormats = {};
        this._groupTotalExcelFormats = {};
        // wrap in a Promise so that we can add loading spinner
        return new Promise(resolve => {
            // prepare the Excel Workbook & Sheet
            // we can use ExcelBuilder constructor with WebPack but we need to use function calls with RequireJS/SystemJS
            const worksheetOptions = { name: this._excelExportOptions.sheetName || 'Sheet1' };
            this._workbook = ExcelBuilder.Workbook ? new ExcelBuilder.Workbook() : ExcelBuilder.createWorkbook();
            this._sheet = ExcelBuilder.Worksheet ? new ExcelBuilder.Worksheet(worksheetOptions) : this._workbook.createWorksheet(worksheetOptions);
            // add any Excel Format/Stylesheet to current Workbook
            this._stylesheet = this._workbook.getStyleSheet();
            // create some common default Excel formatters that will be used
            const boldFormatter = this._stylesheet.createFormat({ font: { bold: true } });
            const stringFormatter = this._stylesheet.createFormat({ format: '@' });
            const numberFormatter = this._stylesheet.createFormat({ format: '0' });
            this._stylesheetFormats = {
                boldFormatter,
                numberFormatter,
                stringFormatter,
            };
            this._sheet.setColumnFormats([boldFormatter]);
            // get the CSV output from the grid data
            const dataOutput = this.getDataOutput();
            // trigger a download file
            // wrap it into a setTimeout so that the EventAggregator has enough time to start a pre-process like showing a spinner
            setTimeout(async () => {
                var _a, _b, _c, _d, _e, _f, _g;
                if ((_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.excelExportOptions) === null || _b === void 0 ? void 0 : _b.customExcelHeader) {
                    this._gridOptions.excelExportOptions.customExcelHeader(this._workbook, this._sheet);
                }
                const columns = ((_c = this._grid) === null || _c === void 0 ? void 0 : _c.getColumns()) || [];
                this._sheet.setColumns(this.getColumnStyles(columns));
                const currentSheetData = this._sheet.data;
                let finalOutput = currentSheetData;
                if (Array.isArray(currentSheetData) && Array.isArray(dataOutput)) {
                    finalOutput = this._sheet.data.concat(dataOutput);
                }
                this._sheet.setData(finalOutput);
                this._workbook.addWorksheet(this._sheet);
                // using ExcelBuilder.Builder.createFile with WebPack but ExcelBuilder.createFile with RequireJS/SystemJS
                const createFileFn = (_e = (_d = ExcelBuilder.Builder) === null || _d === void 0 ? void 0 : _d.createFile) !== null && _e !== void 0 ? _e : ExcelBuilder.createFile;
                // MIME type could be undefined, if that's the case we'll detect the type by its file extension
                // user could also provide its own mime type, if however an empty string is provided we will consider to be without any MIME type)
                let mimeType = (_f = this._excelExportOptions) === null || _f === void 0 ? void 0 : _f.mimeType;
                if (mimeType === undefined) {
                    mimeType = this._fileFormat === common_1.FileType.xls ? 'application/vnd.ms-excel' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                }
                const createFileOptions = mimeType === '' ? { type: 'blob' } : { type: 'blob', mimeType };
                const excelBlob = await createFileFn(this._workbook, createFileOptions);
                const downloadOptions = {
                    filename: `${this._excelExportOptions.filename}.${this._fileFormat}`,
                    format: this._fileFormat
                };
                // start downloading but add the Blob property only on the start download not on the event itself
                this.startDownloadFile({ ...downloadOptions, blob: excelBlob, data: this._sheet.data });
                (_g = this._pubSubService) === null || _g === void 0 ? void 0 : _g.publish(`onAfterExportToExcel`, downloadOptions);
                resolve(true);
            });
        });
    }
    /**
     * Takes a positive integer and returns the corresponding column name.
     * dealing with the Excel column position is a bit tricky since the first 26 columns are single char (A,B,...) but after that it becomes double char (AA,AB,...)
     * so we must first see if we are in the first section of 26 chars, if that is the case we just concatenate 1 (1st row) so it becomes (A1, B1, ...)
     * and again if we go 26, we need to add yet again an extra prefix (AA1, AB1, ...) and so goes the cycle
     * @param {number} colIndex - The positive integer to convert to a column name.
     * @return {string}  The column name.
     */
    getExcelColumnNameByIndex(colIndex) {
        const letters = 'ZABCDEFGHIJKLMNOPQRSTUVWXY';
        let nextPos = Math.floor(colIndex / 26);
        const lastPos = Math.floor(colIndex % 26);
        if (lastPos === 0) {
            nextPos--;
        }
        if (colIndex > 26) {
            return this.getExcelColumnNameByIndex(nextPos) + letters[lastPos];
        }
        return letters[lastPos] + '';
    }
    /**
     * Triggers download file with file format.
     * IE(6-10) are not supported
     * All other browsers will use plain javascript on client side to produce a file download.
     * @param options
     */
    startDownloadFile(options) {
        // when using IE/Edge, then use different download call
        if (typeof navigator.msSaveOrOpenBlob === 'function') {
            navigator.msSaveOrOpenBlob(options.blob, options.filename);
        }
        else {
            // this trick will generate a temp <a /> tag
            // the code will then trigger a hidden click for it to start downloading
            const link = document.createElement('a');
            const url = URL.createObjectURL(options.blob);
            if (link && document) {
                link.textContent = 'download';
                link.href = url;
                link.setAttribute('download', options.filename);
                // set the visibility to hidden so there is no effect on your web-layout
                link.style.visibility = 'hidden';
                // this part will append the anchor tag, trigger a click (for download to start) and finally remove the tag once completed
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
    // -----------------------
    // protected functions
    // -----------------------
    getDataOutput() {
        var _a, _b;
        const columns = ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getColumns()) || [];
        // data variable which will hold all the fields data of a row
        const outputData = [];
        const gridExportOptions = (_b = this._gridOptions) === null || _b === void 0 ? void 0 : _b.excelExportOptions;
        const columnHeaderStyle = gridExportOptions === null || gridExportOptions === void 0 ? void 0 : gridExportOptions.columnHeaderStyle;
        let columnHeaderStyleId = this._stylesheetFormats.boldFormatter.id;
        if (columnHeaderStyle) {
            columnHeaderStyleId = this._stylesheet.createFormat(columnHeaderStyle).id;
        }
        // get all Grouped Column Header Titles when defined (from pre-header row)
        if (this._gridOptions.createPreHeaderPanel && this._gridOptions.showPreHeaderPanel && !this._gridOptions.enableDraggableGrouping) {
            // when having Grouped Header Titles (in the pre-header), then make the cell Bold & Aligned Center
            const boldCenterAlign = this._stylesheet.createFormat({ alignment: { horizontal: 'center' }, font: { bold: true } });
            outputData.push(this.getColumnGroupedHeaderTitlesData(columns, { style: boldCenterAlign === null || boldCenterAlign === void 0 ? void 0 : boldCenterAlign.id }));
            this._hasColumnTitlePreHeader = true;
        }
        // get all Column Header Titles (it might include a "Group by" title at A1 cell)
        // also style the headers, defaults to Bold but user could pass his own style
        outputData.push(this.getColumnHeaderData(columns, { style: columnHeaderStyleId }));
        // Populate the rest of the Grid Data
        this.pushAllGridRowDataToArray(outputData, columns);
        return outputData;
    }
    /** Get each column style including a style for the width of each column */
    getColumnStyles(columns) {
        var _a, _b, _c;
        const grouping = this._dataView.getGrouping();
        const columnStyles = [];
        if (Array.isArray(grouping) && grouping.length > 0) {
            columnStyles.push({
                bestFit: true,
                columnStyles: (_c = (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.excelExportOptions) === null || _b === void 0 ? void 0 : _b.customColumnWidth) !== null && _c !== void 0 ? _c : 10
            });
        }
        columns.forEach((columnDef) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const skippedField = (_a = columnDef.excludeFromExport) !== null && _a !== void 0 ? _a : false;
            // if column width is 0, then we consider that field as a hidden field and should not be part of the export
            if ((columnDef.width === undefined || columnDef.width > 0) && !skippedField) {
                columnStyles.push({
                    bestFit: true,
                    width: (_g = (_d = (_b = columnDef.exportColumnWidth) !== null && _b !== void 0 ? _b : (_c = columnDef.excelExportOptions) === null || _c === void 0 ? void 0 : _c.width) !== null && _d !== void 0 ? _d : (_f = (_e = this._gridOptions) === null || _e === void 0 ? void 0 : _e.excelExportOptions) === null || _f === void 0 ? void 0 : _f.customColumnWidth) !== null && _g !== void 0 ? _g : 10
                });
            }
        });
        return columnStyles;
    }
    /**
     * Get all Grouped Header Titles and their keys, translate the title when required, and format them in Bold
     * @param {Array<Object>} columns - grid column definitions
     * @param {Object} metadata - Excel metadata
     * @returns {Object} array of Excel cell format
     */
    getColumnGroupedHeaderTitlesData(columns, metadata) {
        let outputGroupedHeaderTitles = [];
        // get all Column Header Titles
        this._groupedColumnHeaders = this.getColumnGroupedHeaderTitles(columns) || [];
        if (this._groupedColumnHeaders && Array.isArray(this._groupedColumnHeaders) && this._groupedColumnHeaders.length > 0) {
            // add the header row + add a new line at the end of the row
            outputGroupedHeaderTitles = this._groupedColumnHeaders.map((header) => ({ value: header.title, metadata }));
        }
        // merge necessary cells (any grouped header titles)
        let colspanStartIndex = 0;
        const headersLn = this._groupedColumnHeaders.length;
        for (let cellIndex = 0; cellIndex < headersLn; cellIndex++) {
            if ((cellIndex + 1) === headersLn || ((cellIndex + 1) < headersLn && this._groupedColumnHeaders[cellIndex].title !== this._groupedColumnHeaders[cellIndex + 1].title)) {
                const leftExcelColumnChar = this.getExcelColumnNameByIndex(colspanStartIndex + 1);
                const rightExcelColumnChar = this.getExcelColumnNameByIndex(cellIndex + 1);
                this._sheet.mergeCells(`${leftExcelColumnChar}1`, `${rightExcelColumnChar}1`);
                // next group starts 1 column index away
                colspanStartIndex = cellIndex + 1;
            }
        }
        return outputGroupedHeaderTitles;
    }
    /** Get all column headers and format them in Bold */
    getColumnHeaderData(columns, metadata) {
        let outputHeaderTitles = [];
        // get all Column Header Titles
        this._columnHeaders = this.getColumnHeaders(columns) || [];
        if (this._columnHeaders && Array.isArray(this._columnHeaders) && this._columnHeaders.length > 0) {
            // add the header row + add a new line at the end of the row
            outputHeaderTitles = this._columnHeaders.map((header) => ({ value: (0, common_1.sanitizeHtmlToText)(header.title), metadata }));
        }
        // do we have a Group by title?
        const groupTitle = this.getGroupColumnTitle();
        if (groupTitle) {
            outputHeaderTitles.unshift({ value: groupTitle, metadata });
        }
        return outputHeaderTitles;
    }
    getGroupColumnTitle() {
        var _a;
        // Group By text, it could be set in the export options or from translation or if nothing is found then use the English constant text
        let groupByColumnHeader = this._excelExportOptions.groupingColumnHeaderTitle;
        if (!groupByColumnHeader && this._gridOptions.enableTranslate && ((_a = this._translaterService) === null || _a === void 0 ? void 0 : _a.translate)) {
            groupByColumnHeader = this._translaterService.translate(`${(0, common_1.getTranslationPrefix)(this._gridOptions)}GROUP_BY`);
        }
        else if (!groupByColumnHeader) {
            groupByColumnHeader = this._locales && this._locales.TEXT_GROUP_BY;
        }
        // get grouped column titles and if found, we will add a "Group by" column at the first column index
        // if it's a CSV format, we'll escape the text in double quotes
        const grouping = this._dataView.getGrouping();
        if (Array.isArray(grouping) && grouping.length > 0) {
            this._hasGroupedItems = true;
            return groupByColumnHeader;
        }
        else {
            this._hasGroupedItems = false;
        }
        return null;
    }
    /**
   * Get all Grouped Header Titles and their keys, translate the title when required.
   * @param {Array<object>} columns of the grid
   */
    getColumnGroupedHeaderTitles(columns) {
        const groupedColumnHeaders = [];
        if (columns && Array.isArray(columns)) {
            // Populate the Grouped Column Header, pull the columnGroup(Key) defined
            columns.forEach((columnDef) => {
                var _a;
                let groupedHeaderTitle = '';
                if (columnDef.columnGroupKey && this._gridOptions.enableTranslate && ((_a = this._translaterService) === null || _a === void 0 ? void 0 : _a.translate)) {
                    groupedHeaderTitle = this._translaterService.translate(columnDef.columnGroupKey);
                }
                else {
                    groupedHeaderTitle = columnDef.columnGroup || '';
                }
                const skippedField = columnDef.excludeFromExport || false;
                // if column width is 0px, then we consider that field as a hidden field and should not be part of the export
                if ((columnDef.width === undefined || columnDef.width > 0) && !skippedField) {
                    groupedColumnHeaders.push({
                        key: (columnDef.field || columnDef.id),
                        title: groupedHeaderTitle || ''
                    });
                }
            });
        }
        return groupedColumnHeaders;
    }
    /**
     * Get all header titles and their keys, translate the title when required.
     * @param {Array<object>} columns of the grid
     */
    getColumnHeaders(columns) {
        const columnHeaders = [];
        if (columns && Array.isArray(columns)) {
            // Populate the Column Header, pull the name defined
            columns.forEach((columnDef) => {
                var _a;
                let headerTitle = '';
                if ((columnDef.nameKey || columnDef.nameKey) && this._gridOptions.enableTranslate && ((_a = this._translaterService) === null || _a === void 0 ? void 0 : _a.translate)) {
                    headerTitle = this._translaterService.translate((columnDef.nameKey || columnDef.nameKey));
                }
                else {
                    headerTitle = columnDef.name || (0, utils_1.titleCase)(columnDef.field);
                }
                const skippedField = columnDef.excludeFromExport || false;
                // if column width is 0, then we consider that field as a hidden field and should not be part of the export
                if ((columnDef.width === undefined || columnDef.width > 0) && !skippedField) {
                    columnHeaders.push({
                        key: (columnDef.field || columnDef.id) + '',
                        title: headerTitle
                    });
                }
            });
        }
        return columnHeaders;
    }
    /**
     * Get all the grid row data and return that as an output string
     */
    pushAllGridRowDataToArray(originalDaraArray, columns) {
        const lineCount = this._dataView.getLength();
        // loop through all the grid rows of data
        for (let rowNumber = 0; rowNumber < lineCount; rowNumber++) {
            const itemObj = this._dataView.getItem(rowNumber);
            // make sure we have a filled object AND that the item doesn't include the "getItem" method
            // this happen could happen with an opened Row Detail as it seems to include an empty Slick DataView (we'll just skip those lines)
            if (itemObj && !itemObj.hasOwnProperty('getItem')) {
                // Normal row (not grouped by anything) would have an ID which was predefined in the Grid Columns definition
                if (itemObj[this._datasetIdPropName] !== null && itemObj[this._datasetIdPropName] !== undefined) {
                    // get regular row item data
                    originalDaraArray.push(this.readRegularRowData(columns, rowNumber, itemObj));
                }
                else if (this._hasGroupedItems && itemObj.__groupTotals === undefined) {
                    // get the group row
                    originalDaraArray.push([this.readGroupedRowTitle(itemObj)]);
                }
                else if (itemObj.__groupTotals) {
                    // else if the row is a Group By and we have agreggators, then a property of '__groupTotals' would exist under that object
                    originalDaraArray.push(this.readGroupedTotalRows(columns, itemObj));
                }
            }
        }
        return originalDaraArray;
    }
    /**
     * Get the data of a regular row (a row without grouping)
     * @param {Array<Object>} columns - column definitions
     * @param {Number} row - row index
     * @param {Object} itemObj - item datacontext object
     */
    readRegularRowData(columns, row, itemObj) {
        var _a, _b, _c, _d, _e, _f;
        let idx = 0;
        const rowOutputStrings = [];
        const columnsLn = columns.length;
        let prevColspan = 1;
        let colspanStartIndex = 0;
        const itemMetadata = this._dataView.getItemMetadata(row);
        for (let col = 0; col < columnsLn; col++) {
            const columnDef = columns[col];
            // skip excluded column
            if (columnDef.excludeFromExport) {
                continue;
            }
            // if we are grouping and are on 1st column index, we need to skip this column since it will be used later by the grouping text:: Group by [columnX]
            if (this._hasGroupedItems && idx === 0) {
                rowOutputStrings.push('');
            }
            let colspan = 1;
            let colspanColumnId;
            if (itemMetadata === null || itemMetadata === void 0 ? void 0 : itemMetadata.columns) {
                const metadata = itemMetadata.columns;
                const columnData = metadata[columnDef.id] || metadata[col];
                if (!((!isNaN(prevColspan) && +prevColspan > 1) || (prevColspan === '*' && col > 0))) {
                    prevColspan = (_a = columnData === null || columnData === void 0 ? void 0 : columnData.colspan) !== null && _a !== void 0 ? _a : 1;
                }
                if (prevColspan === '*') {
                    colspan = columns.length - col;
                }
                else {
                    colspan = prevColspan;
                    if (columnDef.id in metadata) {
                        colspanColumnId = columnDef.id;
                        colspanStartIndex = col;
                    }
                }
            }
            // when using grid with colspan, we will merge some cells together
            if ((prevColspan === '*' && col > 0) || ((!isNaN(prevColspan) && +prevColspan > 1) && columnDef.id !== colspanColumnId)) {
                // -- Merge Data
                // Excel row starts at 2 or at 3 when dealing with pre-header grouping
                const excelRowNumber = row + (this._hasColumnTitlePreHeader ? 3 : 2);
                if (typeof prevColspan === 'number' && (colspan - 1) === 1) {
                    // partial column span
                    const leftExcelColumnChar = this.getExcelColumnNameByIndex(colspanStartIndex + 1);
                    const rightExcelColumnChar = this.getExcelColumnNameByIndex(col + 1);
                    this._sheet.mergeCells(`${leftExcelColumnChar}${excelRowNumber}`, `${rightExcelColumnChar}${excelRowNumber}`);
                    rowOutputStrings.push(''); // clear cell that won't be shown by a cell merge
                }
                else if (prevColspan === '*' && colspan === 1) {
                    // full column span (from A1 until the last column)
                    const rightExcelColumnChar = this.getExcelColumnNameByIndex(col + 1);
                    this._sheet.mergeCells(`A${excelRowNumber}`, `${rightExcelColumnChar}${excelRowNumber}`);
                }
                else {
                    rowOutputStrings.push(''); // clear cell that won't be shown by a cell merge
                }
                // decrement colspan until we reach colspan of 1 then proceed with cell merge OR full row merge when colspan is (*)
                if (typeof prevColspan === 'number' && (!isNaN(prevColspan) && +prevColspan > 1)) {
                    colspan = prevColspan--;
                }
            }
            else {
                let itemData = '';
                const fieldType = (0, common_1.getColumnFieldType)(columnDef);
                // -- Read Data & Push to Data Array
                // user might want to export with Formatter, and/or auto-detect Excel format, and/or export as regular cell data
                // for column that are Date type, we'll always export with their associated Date Formatters unless `exportWithFormatter` is specifically set to false
                const exportOptions = { ...this._excelExportOptions };
                if (columnDef.exportWithFormatter !== false && (0, common_1.isColumnDateType)(fieldType)) {
                    exportOptions.exportWithFormatter = true;
                }
                itemData = (0, common_1.exportWithFormatterWhenDefined)(row, col, columnDef, itemObj, this._grid, exportOptions);
                // auto-detect best possible Excel format, unless the user provide his own formatting,
                // we only do this check once per column (everything after that will be pull from temp ref)
                if (!this._regularCellExcelFormats.hasOwnProperty(columnDef.id)) {
                    const autoDetectCellFormat = (_c = (_b = columnDef.excelExportOptions) === null || _b === void 0 ? void 0 : _b.autoDetectCellFormat) !== null && _c !== void 0 ? _c : (_d = this._excelExportOptions) === null || _d === void 0 ? void 0 : _d.autoDetectCellFormat;
                    const cellStyleFormat = (0, excelUtils_1.useCellFormatByFieldType)(this._stylesheet, this._stylesheetFormats, columnDef, this._grid, autoDetectCellFormat);
                    // user could also override style and/or valueParserCallback
                    if ((_e = columnDef.excelExportOptions) === null || _e === void 0 ? void 0 : _e.style) {
                        cellStyleFormat.stylesheetFormatterId = this._stylesheet.createFormat(columnDef.excelExportOptions.style).id;
                    }
                    if ((_f = columnDef.excelExportOptions) === null || _f === void 0 ? void 0 : _f.valueParserCallback) {
                        cellStyleFormat.getDataValueParser = columnDef.excelExportOptions.valueParserCallback;
                    }
                    this._regularCellExcelFormats[columnDef.id] = cellStyleFormat;
                }
                // sanitize early, when enabled, any HTML tags (remove HTML tags)
                if (typeof itemData === 'string' && (columnDef.sanitizeDataExport || this._excelExportOptions.sanitizeDataExport)) {
                    itemData = (0, common_1.sanitizeHtmlToText)(itemData);
                }
                const { stylesheetFormatterId, getDataValueParser } = this._regularCellExcelFormats[columnDef.id];
                itemData = getDataValueParser(itemData, columnDef, stylesheetFormatterId, this._stylesheet, this._gridOptions);
                rowOutputStrings.push(itemData);
                idx++;
            }
        }
        return rowOutputStrings;
    }
    /**
     * Get the grouped title(s) and its group title formatter, for example if we grouped by salesRep, the returned result would be:: 'Sales Rep: John Dow (2 items)'
     * @param itemObj
     */
    readGroupedRowTitle(itemObj) {
        const groupName = (0, common_1.sanitizeHtmlToText)(itemObj.title);
        if (this._excelExportOptions && this._excelExportOptions.addGroupIndentation) {
            const collapsedSymbol = this._excelExportOptions && this._excelExportOptions.groupCollapsedSymbol || '⮞';
            const expandedSymbol = this._excelExportOptions && this._excelExportOptions.groupExpandedSymbol || '⮟';
            const chevron = itemObj.collapsed ? collapsedSymbol : expandedSymbol;
            return chevron + ' ' + (0, utils_1.addWhiteSpaces)(5 * itemObj.level) + groupName;
        }
        return groupName;
    }
    /**
     * Get the grouped totals (below the regular rows), these are set by Slick Aggregators.
     * For example if we grouped by "salesRep" and we have a Sum Aggregator on "sales", then the returned output would be:: ["Sum 123$"]
     * @param itemObj
     */
    readGroupedTotalRows(columns, itemObj) {
        const groupingAggregatorRowText = this._excelExportOptions.groupingAggregatorRowText || '';
        const outputStrings = [groupingAggregatorRowText];
        columns.forEach((columnDef) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            let itemData = '';
            const fieldType = (0, common_1.getColumnFieldType)(columnDef);
            const skippedField = columnDef.excludeFromExport || false;
            // if there's a exportCustomGroupTotalsFormatter or groupTotalsFormatter, we will re-run it to get the exact same output as what is shown in UI
            if (columnDef.exportCustomGroupTotalsFormatter) {
                itemData = columnDef.exportCustomGroupTotalsFormatter(itemObj, columnDef, this._grid);
            }
            // auto-detect best possible Excel format for Group Totals, unless the user provide his own formatting,
            // we only do this check once per column (everything after that will be pull from temp ref)
            const autoDetectCellFormat = (_b = (_a = columnDef.excelExportOptions) === null || _a === void 0 ? void 0 : _a.autoDetectCellFormat) !== null && _b !== void 0 ? _b : (_c = this._excelExportOptions) === null || _c === void 0 ? void 0 : _c.autoDetectCellFormat;
            if (fieldType === common_1.FieldType.number && autoDetectCellFormat !== false) {
                let groupCellFormat = this._groupTotalExcelFormats[columnDef.id];
                if (!(groupCellFormat === null || groupCellFormat === void 0 ? void 0 : groupCellFormat.groupType)) {
                    groupCellFormat = (0, excelUtils_1.getExcelFormatFromGridFormatter)(this._stylesheet, this._stylesheetFormats, columnDef, this._grid, 'group');
                    if ((_d = columnDef.groupTotalsExcelExportOptions) === null || _d === void 0 ? void 0 : _d.style) {
                        groupCellFormat.stylesheetFormatter = this._stylesheet.createFormat(columnDef.groupTotalsExcelExportOptions.style);
                    }
                    this._groupTotalExcelFormats[columnDef.id] = groupCellFormat;
                }
                const groupTotalParser = (_f = (_e = columnDef.groupTotalsExcelExportOptions) === null || _e === void 0 ? void 0 : _e.valueParserCallback) !== null && _f !== void 0 ? _f : excelUtils_1.getGroupTotalValue;
                if (((_g = itemObj[groupCellFormat.groupType]) === null || _g === void 0 ? void 0 : _g[columnDef.field]) !== undefined) {
                    itemData = {
                        value: groupTotalParser(itemObj, columnDef, groupCellFormat.groupType, this._stylesheet),
                        metadata: { style: (_h = groupCellFormat.stylesheetFormatter) === null || _h === void 0 ? void 0 : _h.id }
                    };
                }
            }
            else if (columnDef.groupTotalsFormatter) {
                itemData = columnDef.groupTotalsFormatter(itemObj, columnDef, this._grid);
            }
            // does the user want to sanitize the output data (remove HTML tags)?
            if (typeof itemData === 'string' && (columnDef.sanitizeDataExport || this._excelExportOptions.sanitizeDataExport)) {
                itemData = (0, common_1.sanitizeHtmlToText)(itemData);
            }
            // add the column (unless user wants to skip it)
            if ((columnDef.width === undefined || columnDef.width > 0) && !skippedField) {
                outputStrings.push(itemData);
            }
        });
        return outputStrings;
    }
}
exports.ExcelExportService = ExcelExportService;
//# sourceMappingURL=excelExport.service.js.map