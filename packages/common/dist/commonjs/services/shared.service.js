"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedService = void 0;
class SharedService {
    constructor() {
        this._hasColumnsReordered = false;
        this._hideHeaderRowAfterPageLoad = false;
    }
    // --
    // public
    /** Getter for All Columns  in the grid (hidden/visible) */
    get allColumns() {
        return this._allColumns;
    }
    /** Setter for All Columns  in the grid (hidden/visible) */
    set allColumns(allColumns) {
        this._allColumns = allColumns;
    }
    /** Getter for the Column Definitions pulled through the Grid Object */
    get columnDefinitions() {
        return (this._grid && this._grid.getColumns) ? this._grid.getColumns() : [];
    }
    /** Getter for the Current Pagination (when Pagination is enabled) */
    get currentPagination() {
        return this._currentPagination;
    }
    /** Setter for the Current Pagination (when Pagination is enabled) */
    set currentPagination(currentPagination) {
        this._currentPagination = currentPagination;
    }
    /** Getter for SlickGrid DataView object */
    get dataView() {
        return this._dataView;
    }
    /** Setter for SlickGrid DataView object */
    set dataView(dataView) {
        this._dataView = dataView;
    }
    /** Setter to keep the frozen column id for reference if we ever show/hide column from ColumnPicker/GridMenu afterward */
    get frozenVisibleColumnId() {
        return this._frozenVisibleColumnId;
    }
    /** Getter to keep the frozen column id for reference if we ever show/hide column from ColumnPicker/GridMenu afterward */
    set frozenVisibleColumnId(columnId) {
        this._frozenVisibleColumnId = columnId;
    }
    /** Setter to know if the columns were ever reordered or not since the grid was created. */
    get hasColumnsReordered() {
        return this._hasColumnsReordered;
    }
    /** Getter to know if the columns were ever reordered or not since the grid was created. */
    set hasColumnsReordered(isColumnReordered) {
        this._hasColumnsReordered = isColumnReordered;
    }
    /** Getter for SlickGrid Grid object */
    get slickGrid() {
        return this._grid;
    }
    /** Setter for SlickGrid Grid object */
    set slickGrid(grid) {
        this._grid = grid;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridContainerElement() {
        return this._gridContainerElm;
    }
    /** Setter for the Grid Options pulled through the Grid Object */
    set gridContainerElement(gridContainerElm) {
        this._gridContainerElm = gridContainerElm;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        var _a;
        return this._gridOptions || ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions()) || {};
    }
    /** Setter for the Grid Options pulled through the Grid Object */
    set gridOptions(gridOptions) {
        this._gridOptions = gridOptions;
    }
    /** Getter for the Grid Options */
    get groupItemMetadataProvider() {
        return this._groupItemMetadataProvider;
    }
    /** Setter for the Grid Options */
    set groupItemMetadataProvider(groupItemMetadataProvider) {
        this._groupItemMetadataProvider = groupItemMetadataProvider;
    }
    /** Getter to know if user want to hide header row after 1st page load */
    get hideHeaderRowAfterPageLoad() {
        return this._hideHeaderRowAfterPageLoad;
    }
    /** Setter for knowing if user want to hide header row after 1st page load */
    set hideHeaderRowAfterPageLoad(hideHeaderRowAfterPageLoad) {
        this._hideHeaderRowAfterPageLoad = hideHeaderRowAfterPageLoad;
    }
    /** Getter to know if user want to hide header row after 1st page load */
    get externalRegisteredResources() {
        return this._externalRegisteredResources;
    }
    /** Setter for knowing if user want to hide header row after 1st page load */
    set externalRegisteredResources(externalRegisteredResources) {
        this._externalRegisteredResources = externalRegisteredResources;
    }
    /** Getter for the Visible Columns in the grid */
    get visibleColumns() {
        return this._visibleColumns;
    }
    /** Setter for the Visible Columns in the grid */
    set visibleColumns(visibleColumns) {
        this._visibleColumns = visibleColumns;
    }
    /** Getter for the Hierarchical Tree Data dataset when the feature is enabled */
    get hierarchicalDataset() {
        return this._hierarchicalDataset;
    }
    /** Getter for the Hierarchical Tree Data dataset when the feature is enabled */
    set hierarchicalDataset(hierarchicalDataset) {
        this._hierarchicalDataset = hierarchicalDataset;
    }
}
exports.SharedService = SharedService;
//# sourceMappingURL=shared.service.js.map