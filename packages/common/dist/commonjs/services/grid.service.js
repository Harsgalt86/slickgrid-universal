"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridService = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const slickRowSelectionModel_1 = require("../extensions/slickRowSelectionModel");
const GridServiceDeleteOptionDefaults = { skipError: false, triggerEvent: true };
const GridServiceInsertOptionDefaults = { highlightRow: true, resortGrid: false, selectRow: false, scrollRowIntoView: true, skipError: false, triggerEvent: true };
const GridServiceUpdateOptionDefaults = { highlightRow: false, selectRow: false, scrollRowIntoView: false, skipError: false, triggerEvent: true };
const HideColumnOptionDefaults = { autoResizeColumns: true, triggerEvent: true, hideFromColumnPicker: false, hideFromGridMenu: false };
class GridService {
    constructor(gridStateService, filterService, pubSubService, paginationService, sharedService, sortService, treeDataService) {
        this.gridStateService = gridStateService;
        this.filterService = filterService;
        this.pubSubService = pubSubService;
        this.paginationService = paginationService;
        this.sharedService = sharedService;
        this.sortService = sortService;
        this.treeDataService = treeDataService;
    }
    /** Getter of SlickGrid DataView object */
    get _dataView() {
        var _a;
        return (((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getData) && this._grid.getData());
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get _gridOptions() {
        var _a;
        return ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions) ? this._grid.getOptions() : {};
    }
    dispose() {
        var _a;
        this.clearHighlightTimer();
        (_a = this._rowSelectionPlugin) === null || _a === void 0 ? void 0 : _a.dispose();
    }
    init(grid) {
        this._grid = grid;
    }
    /** Clear all Filters & Sorts */
    clearAllFiltersAndSorts() {
        // call both clear Filters & Sort but only trigger the last one to avoid sending multiple backend queries
        if (this.sortService && this.sortService.clearSorting) {
            this.sortService.clearSorting(false); // skip event trigger on this one
        }
        if (this.filterService && this.filterService.clearFilters) {
            this.filterService.clearFilters();
        }
    }
    /** Clear any highlight timer that might have been left opened */
    clearHighlightTimer() {
        clearTimeout(this._highlightTimer);
        clearTimeout(this._highlightTimerEnd);
    }
    /** Clear all the pinning (frozen) options */
    clearPinning(resetColumns = true) {
        const visibleColumns = [...this.sharedService.visibleColumns];
        this.sharedService.slickGrid.setOptions({ frozenColumn: -1, frozenRow: -1, frozenBottom: false, enableMouseWheelScrollHandler: false });
        // SlickGrid seems to be somehow resetting the columns to their original positions,
        // so let's re-fix them to the position we kept as reference
        if (resetColumns && Array.isArray(visibleColumns)) {
            this.sharedService.slickGrid.setColumns(visibleColumns);
        }
    }
    /**
     * Set pinning (frozen) grid options
     * @param  {Object} pinningOptions - which pinning/frozen options to modify
     * @param {Boolean} shouldAutosizeColumns - defaults to True, should we call an autosizeColumns after the pinning is done?
     * @param {Boolean} suppressRender - do we want to supress the grid re-rendering? (defaults to false)
     * @param {Boolean} suppressColumnSet - do we want to supress the columns set, via "setColumns()" method? (defaults to false)
     */
    setPinning(pinningOptions, shouldAutosizeColumns = true, suppressRender = false, suppressColumnSet = true) {
        if ((0, utils_1.isObjectEmpty)(pinningOptions)) {
            this.clearPinning();
        }
        else {
            this.sharedService.slickGrid.setOptions(pinningOptions, suppressRender, suppressColumnSet);
            this.sharedService.gridOptions = { ...this.sharedService.gridOptions, ...pinningOptions };
        }
        if (shouldAutosizeColumns) {
            this.sharedService.slickGrid.autosizeColumns();
        }
    }
    /**
     * Get all column set in the grid, that is all visible/hidden columns
     * and also include any extra columns used by some plugins (like Row Selection, Row Detail, ...)
     */
    getAllColumnDefinitions() {
        return this.sharedService.allColumns;
    }
    /** Get only visible column definitions and also include any extra columns by some plugins (like Row Selection, Row Detail, ...) */
    getVisibleColumnDefinitions() {
        return this.sharedService.visibleColumns;
    }
    /**
     * From a SlickGrid Event triggered get the Column Definition and Item Data Context
     *
     * For example the SlickGrid onClick will return cell arguments when subscribing to it.
     * From these cellArgs, we want to get the Column Definition and Item Data
     * @param cell event args
     * @return object with columnDef and dataContext
     */
    getColumnFromEventArguments(args) {
        if (!args || !args.grid || !args.grid.getColumns || !args.grid.getDataItem) {
            throw new Error('[Slickgrid-Universal] To get the column definition and data, we need to have these arguments passed as objects (row, cell, grid)');
        }
        return {
            row: args.row,
            cell: args.cell,
            columnDef: args.grid.getColumns()[args.cell],
            dataContext: args.grid.getDataItem(args.row),
            dataView: this._dataView,
            grid: this._grid
        };
    }
    /** Get data item by it's row index number */
    getDataItemByRowNumber(rowNumber) {
        if (!this._grid || typeof this._grid.getDataItem !== 'function') {
            throw new Error(`[Slickgrid-Universal] We could not find SlickGrid Grid object or it's "getDataItem" method`);
        }
        return this._grid.getDataItem(rowNumber);
    }
    /** Chain the item Metadata with our implementation of Metadata at given row index */
    getItemRowMetadataToHighlight(previousItemMetadata) {
        return (rowNumber) => {
            const item = this._dataView.getItem(rowNumber);
            let meta = { cssClasses: '' };
            if (typeof previousItemMetadata === 'function') {
                meta = previousItemMetadata(rowNumber);
            }
            if (!meta) {
                meta = { cssClasses: '' };
            }
            if (item && item._dirty) {
                meta.cssClasses = (meta && meta.cssClasses || '') + ' dirty';
            }
            if (item && item.rowClass && meta) {
                meta.cssClasses += ` ${item.rowClass}`;
                meta.cssClasses += ` row${rowNumber}`;
            }
            return meta;
        };
    }
    /** Get the Data Item from a grid row index */
    getDataItemByRowIndex(index) {
        if (!this._grid || typeof this._grid.getDataItem !== 'function') {
            throw new Error('[Slickgrid-Universal] We could not find SlickGrid Grid object and/or "getDataItem" method');
        }
        return this._grid.getDataItem(index);
    }
    /** Get the Data Item from an array of grid row indexes */
    getDataItemByRowIndexes(indexes) {
        if (!this._grid || typeof this._grid.getDataItem !== 'function') {
            throw new Error('[Slickgrid-Universal] We could not find SlickGrid Grid object and/or "getDataItem" method');
        }
        const dataItems = [];
        if (Array.isArray(indexes)) {
            indexes.forEach((idx) => {
                dataItems.push(this._grid.getDataItem(idx));
            });
        }
        return dataItems;
    }
    /** Get the currently selected row indexes */
    getSelectedRows() {
        if (!this._grid || typeof this._grid.getSelectedRows !== 'function') {
            throw new Error('[Slickgrid-Universal] We could not find SlickGrid Grid object and/or "getSelectedRows" method');
        }
        return this._grid.getSelectedRows();
    }
    /** Get the currently selected rows item data */
    getSelectedRowsDataItem() {
        if (!this._grid || typeof this._grid.getSelectedRows !== 'function') {
            throw new Error('[Slickgrid-Universal] We could not find SlickGrid Grid object and/or "getSelectedRows" method');
        }
        const selectedRowIndexes = this._grid.getSelectedRows();
        return this.getDataItemByRowIndexes(selectedRowIndexes);
    }
    /**
     * Hide a Column from the Grid by its column definition id, the column will just become hidden and will still show up in columnPicker/gridMenu
     * @param {string | number} columnId - column definition id
     * @param {boolean} triggerEvent - do we want to trigger an event (onHeaderMenuHideColumns) when column becomes hidden? Defaults to true.
     * @return {number} columnIndex - column index position when found or -1
     */
    hideColumnById(columnId, options) {
        options = { ...HideColumnOptionDefaults, ...options };
        if (this._grid && this._grid.getColumns && this._grid.setColumns) {
            const currentColumns = this._grid.getColumns();
            const colIndexFound = currentColumns.findIndex(col => col.id === columnId);
            if (colIndexFound >= 0) {
                const visibleColumns = (0, utils_1.arrayRemoveItemByIndex)(currentColumns, colIndexFound);
                this.sharedService.visibleColumns = visibleColumns;
                this._grid.setColumns(visibleColumns);
                const columnIndexFromAllColumns = this.sharedService.allColumns.findIndex(col => col.id === columnId);
                if (columnIndexFromAllColumns) {
                    if (options === null || options === void 0 ? void 0 : options.hideFromColumnPicker) {
                        this.sharedService.allColumns[columnIndexFromAllColumns].excludeFromColumnPicker = true;
                    }
                    if (options === null || options === void 0 ? void 0 : options.hideFromGridMenu) {
                        this.sharedService.allColumns[columnIndexFromAllColumns].excludeFromGridMenu = true;
                    }
                }
                // do we want to auto-resize the columns in the grid after hidding some? most often yes
                if (options === null || options === void 0 ? void 0 : options.autoResizeColumns) {
                    this._grid.autosizeColumns();
                }
                // do we want to trigger an event after hidding
                if (options === null || options === void 0 ? void 0 : options.triggerEvent) {
                    this.pubSubService.publish('onHeaderMenuHideColumns', { columns: visibleColumns });
                }
                return colIndexFound;
            }
        }
        return -1;
    }
    /**
     * Hide a Column from the Grid by its column definition id(s), the column will just become hidden and will still show up in columnPicker/gridMenu
     * @param {Array<string | number>} columnIds - column definition ids, can be a single string and an array of strings
     * @param {boolean} triggerEvent - do we want to trigger an event (onHeaderMenuHideColumns) when column becomes hidden? Defaults to true.
     */
    hideColumnByIds(columnIds, options) {
        options = { ...HideColumnOptionDefaults, ...options };
        if (Array.isArray(columnIds)) {
            for (const columnId of columnIds) {
                // hide each column by its id but wait after the for loop to auto resize columns in the grid
                this.hideColumnById(columnId, { ...options, triggerEvent: false, autoResizeColumns: false });
            }
            // do we want to auto-resize the columns in the grid after hidding some? most often yes
            if (options === null || options === void 0 ? void 0 : options.autoResizeColumns) {
                this._grid.autosizeColumns();
            }
            // do we want to trigger an event after hidding
            if (options === null || options === void 0 ? void 0 : options.triggerEvent) {
                this.pubSubService.publish('onHeaderMenuHideColumns', { columns: this.sharedService.visibleColumns });
            }
        }
    }
    /**
     * Highlight then fade a row for x seconds.
     * The implementation follows this SO answer: https://stackoverflow.com/a/19985148/1212166
     * @param rowNumber
     * @param fadeDelay
     */
    highlightRow(rowNumber, fadeDelay = 1500, fadeOutDelay = 300) {
        // create a SelectionModel if there's not one yet
        if (!this._grid.getSelectionModel()) {
            this._rowSelectionPlugin = new slickRowSelectionModel_1.SlickRowSelectionModel(this._gridOptions.rowSelectionOptions);
            this._grid.setSelectionModel(this._rowSelectionPlugin);
        }
        if (Array.isArray(rowNumber)) {
            rowNumber.forEach(row => this.highlightRowByMetadata(row, fadeDelay, fadeOutDelay));
        }
        else {
            this.highlightRowByMetadata(rowNumber, fadeDelay, fadeOutDelay);
        }
    }
    highlightRowByMetadata(rowNumber, fadeDelay = 1500, fadeOutDelay = 300) {
        this._dataView.getItemMetadata = this.getItemRowMetadataToHighlight(this._dataView.getItemMetadata);
        const item = this._dataView.getItem(rowNumber);
        const idPropName = this._gridOptions.datasetIdPropertyName || 'id';
        if ((item === null || item === void 0 ? void 0 : item[idPropName]) !== undefined) {
            item.rowClass = 'highlight';
            this._dataView.updateItem(item[idPropName], item);
            this.renderGrid();
            // clear both timers
            this.clearHighlightTimer();
            // fade out
            this._highlightTimerEnd = setTimeout(() => {
                item.rowClass = 'highlight-end';
                this._dataView.updateItem(item[idPropName], item);
                this.renderGrid();
            }, fadeOutDelay);
            // delete the row's CSS highlight classes once the delay is passed
            this._highlightTimer = setTimeout(() => {
                if ((item === null || item === void 0 ? void 0 : item[idPropName]) !== undefined) {
                    delete item.rowClass;
                    if (this._dataView.getIdxById(item[idPropName]) !== undefined) {
                        this._dataView.updateItem(item[idPropName], item);
                        this.renderGrid();
                    }
                }
            }, fadeDelay + fadeOutDelay);
        }
    }
    /** Select the selected row by a row index */
    setSelectedRow(rowIndex) {
        var _a;
        if ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.setSelectedRows) {
            this._grid.setSelectedRows([rowIndex]);
        }
    }
    /** Set selected rows with provided array of row indexes */
    setSelectedRows(rowIndexes) {
        var _a;
        if ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.setSelectedRows) {
            this._grid.setSelectedRows(rowIndexes);
        }
    }
    /** Re-Render the Grid */
    renderGrid() {
        if (this._grid && typeof this._grid.invalidate === 'function') {
            this._grid.invalidate();
            this._grid.render();
        }
    }
    /**
     * Reset the grid to it's original state (clear any filters, sorting & pagination if exists) .
     * The column definitions could be passed as argument to reset (this can be used after a Grid State reset)
     * The reset will clear the Filters & Sort, then will reset the Columns to their original state
     */
    resetGrid(columnDefinitions) {
        var _a, _b, _c;
        // clear any Pinning/Frozen columns/rows
        // do it prior to setting the Columns back on the next few lines
        this.clearPinning(false);
        // reset columns to original states & refresh the grid
        if (this._grid) {
            const originalColumns = this.sharedService.allColumns || [];
            if (Array.isArray(originalColumns) && originalColumns.length > 0) {
                // set the grid columns to it's original column definitions
                this._grid.setColumns(originalColumns);
                if ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableAutoSizeColumns) {
                    this._grid.autosizeColumns();
                }
                this.gridStateService.resetColumns(columnDefinitions);
            }
        }
        if (typeof ((_b = this.filterService) === null || _b === void 0 ? void 0 : _b.clearFilters) === 'function') {
            this.filterService.clearFilters();
        }
        if (typeof ((_c = this.sortService) === null || _c === void 0 ? void 0 : _c.clearSorting) === 'function') {
            this.sortService.clearSorting();
        }
    }
    /**
     * Add an item (data item) to the datagrid, by default it will highlight (flashing) the inserted row but we can disable it too
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, resortGrid, selectRow, triggerEvent)
     * @return rowIndex: typically index 0 when adding to position "top" or a different number when adding to the "bottom"
     */
    addItem(item, options) {
        var _a, _b, _c, _d, _e;
        const insertOptions = { ...GridServiceInsertOptionDefaults, ...options };
        if (!(insertOptions === null || insertOptions === void 0 ? void 0 : insertOptions.skipError) && (!this._grid || !this._gridOptions || !this._dataView)) {
            throw new Error('[Slickgrid-Universal] We could not find SlickGrid Grid, DataView objects');
        }
        const idPropName = this._gridOptions.datasetIdPropertyName || 'id';
        if (!(insertOptions === null || insertOptions === void 0 ? void 0 : insertOptions.skipError) && (!item || !item.hasOwnProperty(idPropName))) {
            throw new Error(`[Slickgrid-Universal] Adding an item requires the item to include an "${idPropName}" property`);
        }
        if (((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableTreeData) && (options === null || options === void 0 ? void 0 : options.position) === 'top') {
            throw new Error('[Slickgrid-Universal] Please note that `addItem({ position: "top" })` is not supported when used with Tree Data because of the extra complexity.');
        }
        const insertPosition = insertOptions === null || insertOptions === void 0 ? void 0 : insertOptions.position;
        // insert position top/bottom, defaults to top
        // when position is top we'll call insert at index 0, else call addItem which just push to the DataView array
        if (insertPosition === 'bottom' || ((_b = this._gridOptions) === null || _b === void 0 ? void 0 : _b.enableTreeData)) {
            this._dataView.addItem(item);
        }
        else {
            this._dataView.insertItem(0, item); // insert at index 0
        }
        // row number in the grid, by default it will be on first row (top is the default)
        let rowNumber = 0;
        const itemId = (_c = item === null || item === void 0 ? void 0 : item[idPropName]) !== null && _c !== void 0 ? _c : '';
        if ((_d = this._gridOptions) === null || _d === void 0 ? void 0 : _d.enableTreeData) {
            // if we add/remove item(s) from the dataset, we need to also refresh our tree data filters
            this.invalidateHierarchicalDataset();
            rowNumber = this._dataView.getRowById(itemId);
            if (insertOptions.scrollRowIntoView) {
                this._grid.scrollRowIntoView(rowNumber !== null && rowNumber !== void 0 ? rowNumber : 0, false);
            }
        }
        else if (insertOptions.resortGrid) {
            // do we want the item to be sorted in the grid, when set to False it will insert on first row (defaults to false)
            this._dataView.reSort();
            // find the row number in the grid and if user wanted to see highlighted row
            // we need to do it here after resort and get each row number because it possibly changes after the sort
            rowNumber = this._dataView.getRowById(itemId);
        }
        else {
            // scroll to row index 0 when inserting on top else scroll to the bottom where it got inserted
            rowNumber = (insertPosition === 'bottom') ? this._dataView.getRowById(itemId) : 0;
            if (insertOptions.scrollRowIntoView) {
                this._grid.scrollRowIntoView(rowNumber !== null && rowNumber !== void 0 ? rowNumber : 0);
            }
        }
        // if highlight is enabled, we'll highlight the row we just added
        if (insertOptions.highlightRow && rowNumber !== undefined) {
            this.highlightRow(rowNumber);
        }
        // if row selection (checkbox selector) is enabled, we'll select the row in the grid
        if (rowNumber !== undefined && insertOptions.selectRow && this._gridOptions && (this._gridOptions.enableCheckboxSelector || this._gridOptions.enableRowSelection)) {
            this.setSelectedRow(rowNumber);
        }
        // do we want to trigger an event after adding the item
        if (insertOptions.triggerEvent) {
            this.pubSubService.publish('onItemAdded', item);
        }
        // when using Pagination in a local grid, we need to either go to first page or last page depending on which position user want to insert the new row
        const isLocalGrid = !((_e = this._gridOptions) === null || _e === void 0 ? void 0 : _e.backendServiceApi);
        if (isLocalGrid && this._gridOptions.enablePagination) {
            insertPosition === 'bottom' ? this.paginationService.goToLastPage() : this.paginationService.goToFirstPage();
        }
        return rowNumber;
    }
    /**
     * Add item array (data item) to the datagrid, by default it will highlight (flashing) the inserted row but we can disable it too
     * @param item object arrays, which must contain unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, resortGrid, selectRow, triggerEvent)
     */
    addItems(items, options) {
        var _a, _b, _c, _d, _e;
        const insertOptions = { ...GridServiceInsertOptionDefaults, ...options };
        const idPropName = this._gridOptions.datasetIdPropertyName || 'id';
        const insertPosition = insertOptions === null || insertOptions === void 0 ? void 0 : insertOptions.position;
        const rowNumbers = [];
        // loop through all items to add
        if (!Array.isArray(items)) {
            return [this.addItem(items, insertOptions) || 0]; // on a single item, just call addItem()
        }
        else {
            // begin bulk transaction
            this._dataView.beginUpdate(true);
            // insert position top/bottom, defaults to top
            // when position is top we'll call insert at index 0, else call addItem which just push to the DataView array
            if (insertPosition === 'bottom' || ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableTreeData)) {
                this._dataView.addItems(items);
            }
            else {
                this._dataView.insertItems(0, items); // insert at index 0 to the start of the dataset
            }
            // end the bulk transaction since we're all done
            this._dataView.endUpdate();
        }
        if ((_b = this._gridOptions) === null || _b === void 0 ? void 0 : _b.enableTreeData) {
            // if we add/remove item(s) from the dataset, we need to also refresh our tree data filters
            this.invalidateHierarchicalDataset();
            const firstItemId = (_d = (_c = items[0]) === null || _c === void 0 ? void 0 : _c[idPropName]) !== null && _d !== void 0 ? _d : '';
            const rowNumber = this._dataView.getRowById(firstItemId);
            if (insertOptions.scrollRowIntoView) {
                this._grid.scrollRowIntoView(rowNumber !== null && rowNumber !== void 0 ? rowNumber : 0, false);
            }
        }
        else if (insertOptions.resortGrid) {
            // do we want the item to be sorted in the grid, when set to False it will insert on first row (defaults to false)
            this._dataView.reSort();
        }
        // when insert position if defined and we're not using a Tree Data grid
        if (insertPosition && insertOptions.scrollRowIntoView && !((_e = this._gridOptions) === null || _e === void 0 ? void 0 : _e.enableTreeData)) {
            // "top" insert will scroll to row index 0 or else "bottom" will scroll to the bottom of the grid
            insertPosition === 'bottom' ? this._grid.navigateBottom() : this._grid.navigateTop();
        }
        // get row numbers of all new inserted items
        // we need to do it after resort and get each row number because it possibly changed after the sort
        items.forEach((item) => rowNumbers.push(this._dataView.getRowById(item[idPropName])));
        // if user wanted to see highlighted row
        if (insertOptions.highlightRow) {
            this.highlightRow(rowNumbers);
        }
        // select the row in the grid
        if (insertOptions.selectRow && this._gridOptions && (this._gridOptions.enableCheckboxSelector || this._gridOptions.enableRowSelection)) {
            this.setSelectedRows(rowNumbers);
        }
        // do we want to trigger an event after adding the item
        if (insertOptions.triggerEvent) {
            this.pubSubService.publish('onItemAdded', items);
        }
        return rowNumbers;
    }
    /**
     * Delete an existing item from the datagrid (dataView)
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (triggerEvent)
     * @return item id deleted
     */
    deleteItem(item, options) {
        options = { ...GridServiceDeleteOptionDefaults, ...options };
        const idPropName = this._gridOptions.datasetIdPropertyName || 'id';
        if (!(options === null || options === void 0 ? void 0 : options.skipError) && (!item || !item.hasOwnProperty(idPropName))) {
            throw new Error(`[Slickgrid-Universal] Deleting an item requires the item to include an "${idPropName}" property`);
        }
        return this.deleteItemById(item[idPropName], options);
    }
    /**
     * Delete an array of existing items from the datagrid
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (triggerEvent)
     * @return item id deleted
     */
    deleteItems(items, options) {
        options = { ...GridServiceDeleteOptionDefaults, ...options };
        const idPropName = this._gridOptions.datasetIdPropertyName || 'id';
        // when it's not an array, we can call directly the single item delete
        if (!Array.isArray(items)) {
            this.deleteItem(items, options);
            return [items[idPropName]];
        }
        // begin bulk transaction
        this._dataView.beginUpdate(true);
        const itemIds = [];
        items.forEach((item) => {
            if ((item === null || item === void 0 ? void 0 : item[idPropName]) !== undefined) {
                itemIds.push(item[idPropName]);
            }
        });
        // delete the item from the dataView
        this._dataView.deleteItems(itemIds);
        // end the bulk transaction since we're all done
        this._dataView.endUpdate();
        // do we want to trigger an event after deleting the item
        if (options.triggerEvent) {
            this.pubSubService.publish('onItemDeleted', items);
        }
        return itemIds;
    }
    /**
     * Delete an existing item from the datagrid (dataView) by it's id
     * @param itemId: item unique id
     * @param options: provide the possibility to do certain actions after or during the upsert (triggerEvent)
     * @return item id deleted
     */
    deleteItemById(itemId, options) {
        options = { ...GridServiceDeleteOptionDefaults, ...options };
        if (!(options === null || options === void 0 ? void 0 : options.skipError) && (itemId === null || itemId === undefined)) {
            throw new Error(`[Slickgrid-Universal] Cannot delete a row without a valid "id"`);
        }
        // when user has row selection enabled, we should clear any selection to avoid confusion after a delete
        const isSyncGridSelectionEnabled = this.gridStateService && this.gridStateService.needToPreserveRowSelection() || false;
        if (!isSyncGridSelectionEnabled && this._grid && this._gridOptions && (this._gridOptions.enableCheckboxSelector || this._gridOptions.enableRowSelection)) {
            this.setSelectedRows([]);
        }
        // delete the item from the dataView
        this._dataView.deleteItem(itemId);
        // do we want to trigger an event after deleting the item
        if (options.triggerEvent) {
            this.pubSubService.publish('onItemDeleted', itemId);
        }
        return itemId;
    }
    /**
     * Delete an array of existing items from the datagrid
     * @param itemIds array of item unique IDs
     * @param options: provide the possibility to do certain actions after or during the upsert (triggerEvent)
     */
    deleteItemByIds(itemIds, options) {
        options = { ...GridServiceDeleteOptionDefaults, ...options };
        // when it's not an array, we can call directly the single item delete
        if (Array.isArray(itemIds)) {
            // begin bulk transaction
            this._dataView.beginUpdate(true);
            for (let i = 0; i < itemIds.length; i++) {
                if (itemIds[i] !== null) {
                    this.deleteItemById(itemIds[i], { triggerEvent: false });
                }
            }
            // end the bulk transaction since we're all done
            this._dataView.endUpdate();
            // do we want to trigger an event after deleting the item
            if (options.triggerEvent) {
                this.pubSubService.publish('onItemDeleted', itemIds);
            }
            return itemIds;
        }
        return [];
    }
    /**
     * Update an existing item with new properties inside the datagrid
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, selectRow, triggerEvent)
     * @return grid row index
     */
    updateItem(item, options) {
        options = { ...GridServiceUpdateOptionDefaults, ...options };
        const idPropName = this._gridOptions.datasetIdPropertyName || 'id';
        const itemId = (!item || !item.hasOwnProperty(idPropName)) ? undefined : item[idPropName];
        if (!(options === null || options === void 0 ? void 0 : options.skipError) && itemId === undefined) {
            throw new Error(`[Slickgrid-Universal] Calling Update of an item requires the item to include an "${idPropName}" property`);
        }
        return this.updateItemById(itemId, item, options);
    }
    /**
     * Update an array of existing items with new properties inside the datagrid
     * @param item object arrays, which must contain unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the update (highlightRow, selectRow, triggerEvent)
     * @return grid row indexes
     */
    updateItems(items, options) {
        var _a;
        options = { ...GridServiceUpdateOptionDefaults, ...options };
        const idPropName = this._gridOptions.datasetIdPropertyName || 'id';
        // when it's not an array, we can call directly the single item update
        if (!Array.isArray(items)) {
            return [this.updateItem(items, options)];
        }
        // begin bulk transaction
        this._dataView.beginUpdate(true);
        // loop through each item, get their Ids and row number position in the grid
        // also call a grid render on the modified row for the item to be reflected in the UI
        const rowNumbers = [];
        const itemIds = [];
        items.forEach((item) => {
            const itemId = (!item || !item.hasOwnProperty(idPropName)) ? undefined : item[idPropName];
            itemIds.push(itemId);
            if (this._dataView.getIdxById(itemId) !== undefined) {
                const rowNumber = this._dataView.getRowById(itemId);
                if (rowNumber !== undefined) {
                    rowNumbers.push(rowNumber);
                    this._grid.updateRow(rowNumber);
                }
            }
        });
        // Update the items in the dataView, note that the itemIds must be in the same order as the items
        this._dataView.updateItems(itemIds, items);
        // end the bulk transaction since we're all done
        this._dataView.endUpdate();
        if ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableTreeData) {
            // if we add/remove item(s) from the dataset, we need to also refresh our tree data filters
            this.invalidateHierarchicalDataset();
        }
        // only highlight at the end, all at once
        // we have to do this because doing highlight 1 by 1 would only re-select the last highlighted row which is wrong behavior
        if (options.highlightRow) {
            this.highlightRow(rowNumbers);
        }
        // select the row in the grid
        if (options.selectRow && this._gridOptions && (this._gridOptions.enableCheckboxSelector || this._gridOptions.enableRowSelection)) {
            this.setSelectedRows(rowNumbers);
        }
        // do we want to trigger an event after updating the item
        if (options.triggerEvent) {
            this.pubSubService.publish('onItemUpdated', items);
        }
        return rowNumbers;
    }
    /**
     * Update an existing item in the datagrid by it's id and new properties
     * @param itemId: item unique id
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, selectRow, triggerEvent)
     * @return grid row number
     */
    updateItemById(itemId, item, options) {
        var _a;
        options = { ...GridServiceUpdateOptionDefaults, ...options };
        if (!(options === null || options === void 0 ? void 0 : options.skipError) && itemId === undefined) {
            throw new Error(`[Slickgrid-Universal] Cannot update a row without a valid "id"`);
        }
        const rowNumber = this._dataView.getRowById(itemId);
        // when using pagination the item to update might not be on current page, so we bypass this condition
        if (!(options === null || options === void 0 ? void 0 : options.skipError) && (!item && !this._gridOptions.enablePagination)) {
            throw new Error(`[Slickgrid-Universal] The item to update in the grid was not found with id: ${itemId}`);
        }
        if (this._dataView.getIdxById(itemId) !== undefined) {
            // Update the item itself inside the dataView
            this._dataView.updateItem(itemId, item);
            if (rowNumber !== undefined) {
                this._grid.updateRow(rowNumber);
            }
            if ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableTreeData) {
                // if we add/remove item(s) from the dataset, we need to also refresh our tree data filters
                this.invalidateHierarchicalDataset();
            }
            // do we want to scroll to the row so that it shows in the Viewport (UI)
            if (options.scrollRowIntoView && rowNumber !== undefined) {
                this._grid.scrollRowIntoView(rowNumber);
            }
            // highlight the row we just updated, if defined
            if (options.highlightRow && rowNumber !== undefined) {
                this.highlightRow(rowNumber);
            }
            // select the row in the grid
            if (rowNumber !== undefined && options.selectRow && this._gridOptions && (this._gridOptions.enableCheckboxSelector || this._gridOptions.enableRowSelection)) {
                this.setSelectedRow(rowNumber);
            }
            // do we want to trigger an event after updating the item
            if (options.triggerEvent) {
                this.pubSubService.publish('onItemUpdated', item);
            }
        }
        return rowNumber;
    }
    /**
     * Insert a row into the grid if it doesn't already exist or update if it does.
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, resortGrid, selectRow, triggerEvent)
     */
    upsertItem(item, options) {
        options = { ...GridServiceInsertOptionDefaults, ...options };
        const idPropName = this._gridOptions.datasetIdPropertyName || 'id';
        const itemId = (!item || !item.hasOwnProperty(idPropName)) ? undefined : item[idPropName];
        if (!(options === null || options === void 0 ? void 0 : options.skipError) && itemId === undefined) {
            throw new Error(`[Slickgrid-Universal] Calling Upsert of an item requires the item to include an "${idPropName}" property`);
        }
        return this.upsertItemById(itemId, item, options);
    }
    /**
     * Update an array of existing items with new properties inside the datagrid
     * @param item object arrays, which must contain unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, resortGrid, selectRow, triggerEvent)
     * @return row numbers in the grid
     */
    upsertItems(items, options) {
        options = { ...GridServiceInsertOptionDefaults, ...options };
        // when it's not an array, we can call directly the single item upsert
        if (!Array.isArray(items)) {
            return [this.upsertItem(items, options)];
        }
        // begin bulk transaction
        this._dataView.beginUpdate(true);
        const upsertedRows = [];
        items.forEach((item) => {
            upsertedRows.push(this.upsertItem(item, { ...options, highlightRow: false, resortGrid: false, selectRow: false, triggerEvent: false }));
        });
        // end the bulk transaction since we're all done
        this._dataView.endUpdate();
        const rowNumbers = upsertedRows.map((upsertRow) => upsertRow.added !== undefined ? upsertRow.added : upsertRow.updated);
        // only highlight at the end, all at once
        // we have to do this because doing highlight 1 by 1 would only re-select the last highlighted row which is wrong behavior
        if (options.highlightRow) {
            this.highlightRow(rowNumbers);
        }
        // select the row in the grid
        if (options.selectRow && this._gridOptions && (this._gridOptions.enableCheckboxSelector || this._gridOptions.enableRowSelection)) {
            this.setSelectedRows(rowNumbers);
        }
        // do we want to trigger an event after updating the item
        if (options.triggerEvent) {
            this.pubSubService.publish('onItemUpserted', items);
            const addedItems = upsertedRows.filter((upsertRow) => upsertRow.added !== undefined);
            if (Array.isArray(addedItems) && addedItems.length > 0) {
                this.pubSubService.publish('onItemAdded', addedItems);
            }
            const updatedItems = upsertedRows.filter((upsertRow) => upsertRow.updated !== undefined);
            if (Array.isArray(updatedItems) && updatedItems.length > 0) {
                this.pubSubService.publish('onItemUpdated', updatedItems);
            }
        }
        return upsertedRows;
    }
    /**
     * Update an existing item in the datagrid by it's id and new properties
     * @param itemId: item unique id
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, resortGrid, selectRow, triggerEvent)
     * @return grid row number in the grid
     */
    upsertItemById(itemId, item, options) {
        let isItemAdded = false;
        options = { ...GridServiceInsertOptionDefaults, ...options };
        if (!(options === null || options === void 0 ? void 0 : options.skipError) && (itemId === undefined && !this.hasRowSelectionEnabled())) {
            throw new Error(`[Slickgrid-Universal] Calling Upsert of an item requires the item to include a valid and unique "id" property`);
        }
        let rowNumberAdded;
        let rowNumberUpdated;
        if (this._dataView.getRowById(itemId) === undefined) {
            rowNumberAdded = this.addItem(item, options);
            isItemAdded = true;
        }
        else {
            rowNumberUpdated = this.updateItem(item, { highlightRow: options.highlightRow, selectRow: options.selectRow, triggerEvent: options.triggerEvent });
            isItemAdded = false;
        }
        // do we want to trigger an event after updating the item
        if (options.triggerEvent) {
            this.pubSubService.publish('onItemUpserted', item);
            isItemAdded ? this.pubSubService.publish('onItemAdded', item) : this.pubSubService.publish('onItemUpdated', item);
        }
        return { added: rowNumberAdded, updated: rowNumberUpdated };
    }
    /**
     * When dealing with hierarchical (tree) dataset, we can invalidate all the rows and force a full resort & re-render of the hierarchical tree dataset.
     * This method will automatically be called anytime user called `addItem()` or `addItems()`.
     * However please note that it won't be called when `updateItem`, if the data that gets updated does change the tree data column then you should call this method.
     * @param {Array<Object>} [items] - optional flat array of parent/child items to use while redoing the full sort & refresh
     */
    invalidateHierarchicalDataset(items) {
        var _a;
        // if we add/remove item(s) from the dataset, we need to also refresh our tree data filters
        if (((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableTreeData) && this.treeDataService) {
            const inputItems = items !== null && items !== void 0 ? items : this._dataView.getItems();
            const sortedDatasetResult = this.treeDataService.convertFlatParentChildToTreeDatasetAndSort(inputItems || [], this.sharedService.allColumns, this._gridOptions);
            this.sharedService.hierarchicalDataset = sortedDatasetResult.hierarchical;
            this.filterService.refreshTreeDataFilters(items);
            this._dataView.setItems(sortedDatasetResult.flat);
            this._grid.invalidate();
        }
    }
    // --
    // protected functions
    // -------------------
    /** Check wether the grid has the Row Selection enabled */
    hasRowSelectionEnabled() {
        const selectionModel = this._grid.getSelectionModel();
        const isRowSelectionEnabled = this._gridOptions.enableRowSelection || this._gridOptions.enableCheckboxSelector;
        return (isRowSelectionEnabled && selectionModel);
    }
}
exports.GridService = GridService;
//# sourceMappingURL=grid.service.js.map