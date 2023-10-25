"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridStateService = void 0;
const lite_1 = require("dequal/lite");
const index_1 = require("../enums/index");
class GridStateService {
    constructor(extensionService, filterService, pubSubService, sharedService, sortService, treeDataService) {
        this.extensionService = extensionService;
        this.filterService = filterService;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this.sortService = sortService;
        this.treeDataService = treeDataService;
        this._eventHandler = new Slick.EventHandler();
        this._columns = [];
        this._subscriptions = [];
        this._selectedRowIndexes = [];
        this._selectedRowDataContextIds = []; // used with row selection
        this._wasRecheckedAfterPageChange = true; // used with row selection & pagination
    }
    /** Getter of SlickGrid DataView object */
    get _dataView() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getData) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get _gridOptions() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    /** Getter of the selected data context object IDs */
    get selectedRowDataContextIds() {
        return this._selectedRowDataContextIds;
    }
    /** Setter of the selected data context object IDs */
    set selectedRowDataContextIds(dataContextIds) {
        this._selectedRowDataContextIds = dataContextIds;
    }
    /**
     * Initialize the Service
     * @param grid
     */
    init(grid) {
        this._grid = grid;
        this.subscribeToAllGridChanges(grid);
    }
    /** Dispose of all the SlickGrid & PubSub subscriptions */
    dispose() {
        this._columns = [];
        // unsubscribe all SlickGrid events
        this._eventHandler.unsubscribeAll();
        // also dispose of all Subscriptions
        this.pubSubService.unsubscribeAll(this._subscriptions);
    }
    /**
     * Dynamically change the arrangement/distribution of the columns Positions/Visibilities and optionally Widths.
     * For a column to have its visibly as hidden, it has to be part of the original list but excluded from the list provided as argument to be considered a hidden field.
     * If you are passing columns Width, then you probably don't want to trigger the autosizeColumns (2nd argument to False).
     * We could also resize the columns by their content but be aware that you can only trigger 1 type of resize at a time (either the 2nd argument or the 3rd last argument but not both at same time)
     * The resize by content could be called by the 3rd argument OR simply by enabling `enableAutoResizeColumnsByCellContent` but again this will only get executed when the 2nd argument is set to false.
     * @param {Array<Column>} definedColumns - defined columns
     * @param {Boolean} triggerAutoSizeColumns - True by default, do we also want to call the "autosizeColumns()" method to make the columns fit in the grid?
     * @param {Boolean} triggerColumnsFullResizeByContent - False by default, do we also want to call full columns resize by their content?
     */
    changeColumnsArrangement(definedColumns, triggerAutoSizeColumns = true, triggerColumnsFullResizeByContent = false) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k;
        if (Array.isArray(definedColumns) && definedColumns.length > 0) {
            const newArrangedColumns = this.getAssociatedGridColumns(this._grid, definedColumns);
            if (newArrangedColumns && Array.isArray(newArrangedColumns) && newArrangedColumns.length > 0) {
                // make sure that the checkbox selector is still visible in the list when it is enabled
                if (Array.isArray(this.sharedService.allColumns)) {
                    const dynamicAddonColumnByIndexPositionList = [];
                    if (this._gridOptions.enableCheckboxSelector) {
                        const columnIndexPosition = (_c = (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.checkboxSelector) === null || _b === void 0 ? void 0 : _b.columnIndexPosition) !== null && _c !== void 0 ? _c : 0;
                        dynamicAddonColumnByIndexPositionList.push({ columnId: '_checkbox_selector', columnIndexPosition });
                    }
                    if (this._gridOptions.enableRowDetailView) {
                        const columnIndexPosition = (_g = (_f = (_d = this._gridOptions) === null || _d === void 0 ? void 0 : _d.rowDetailView) === null || _f === void 0 ? void 0 : _f.columnIndexPosition) !== null && _g !== void 0 ? _g : 0;
                        dynamicAddonColumnByIndexPositionList.push({ columnId: '_detail_selector', columnIndexPosition });
                    }
                    if (this._gridOptions.enableRowMoveManager) {
                        const columnIndexPosition = (_k = (_j = (_h = this._gridOptions) === null || _h === void 0 ? void 0 : _h.rowMoveManager) === null || _j === void 0 ? void 0 : _j.columnIndexPosition) !== null && _k !== void 0 ? _k : 0;
                        dynamicAddonColumnByIndexPositionList.push({ columnId: '_move', columnIndexPosition });
                    }
                    // since some features could have a `columnIndexPosition`, we need to make sure these indexes are respected in the column definitions
                    this.addColumnDynamicWhenFeatureEnabled(dynamicAddonColumnByIndexPositionList, this.sharedService.allColumns, newArrangedColumns);
                }
                // keep copy the original optional `width` properties optionally provided by the user.
                // We will use this when doing a resize by cell content, if user provided a `width` it won't override it.
                newArrangedColumns.forEach(col => col.originalWidth = col.width || col.originalWidth);
                // finally set the new presets columns (including checkbox selector if need be)
                this._grid.setColumns(newArrangedColumns);
                this.sharedService.visibleColumns = newArrangedColumns;
                // resize the columns to fit the grid canvas
                if (triggerAutoSizeColumns) {
                    this._grid.autosizeColumns();
                }
                else if (triggerColumnsFullResizeByContent || (this._gridOptions.enableAutoResizeColumnsByCellContent && !this._gridOptions.autosizeColumnsByCellContentOnFirstLoad)) {
                    this.pubSubService.publish('onFullResizeByContentRequested', { caller: 'GridStateService' });
                }
            }
        }
    }
    /**
     * Get the current grid state (filters/sorters/pagination)
     * @return grid state
     */
    getCurrentGridState() {
        var _a;
        const { frozenColumn, frozenRow, frozenBottom } = this.sharedService.gridOptions;
        const gridState = {
            columns: this.getCurrentColumns(),
            filters: this.getCurrentFilters(),
            sorters: this.getCurrentSorters(),
            pinning: { frozenColumn, frozenRow, frozenBottom },
        };
        // optional Pagination
        const currentPagination = this.getCurrentPagination();
        if (currentPagination) {
            gridState.pagination = currentPagination;
        }
        // optional Row Selection
        if (this.hasRowSelectionEnabled()) {
            const currentRowSelection = this.getCurrentRowSelections();
            if (currentRowSelection) {
                gridState.rowSelection = currentRowSelection;
            }
        }
        // optional Tree Data toggle items
        if ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableTreeData) {
            const treeDataTreeToggleState = this.getCurrentTreeDataToggleState();
            if (treeDataTreeToggleState) {
                gridState.treeData = treeDataTreeToggleState;
            }
        }
        return gridState;
    }
    /**
     * Get the Columns (and their state: visibility/position) that are currently applied in the grid
     * @return current columns
     */
    getColumns() {
        return this._columns;
    }
    /**
     * From an array of Grid Column Definitions, get the associated Current Columns
     * @param gridColumns
     */
    getAssociatedCurrentColumns(gridColumns) {
        const currentColumns = [];
        if (gridColumns && Array.isArray(gridColumns)) {
            gridColumns.forEach((column) => {
                if (column === null || column === void 0 ? void 0 : column.id) {
                    currentColumns.push({
                        columnId: column.id,
                        cssClass: column.cssClass || '',
                        headerCssClass: column.headerCssClass || '',
                        width: column.width || 0
                    });
                }
            });
        }
        return currentColumns;
    }
    /**
     * From an array of Current Columns, get the associated Grid Column Definitions
     * @param grid
     * @param currentColumns
     */
    getAssociatedGridColumns(grid, currentColumns) {
        const columns = [];
        const gridColumns = this.sharedService.allColumns || grid.getColumns();
        if (currentColumns && Array.isArray(currentColumns)) {
            currentColumns.forEach((currentColumn) => {
                const gridColumn = gridColumns.find((c) => c.id === currentColumn.columnId);
                if (gridColumn === null || gridColumn === void 0 ? void 0 : gridColumn.id) {
                    columns.push({
                        ...gridColumn,
                        cssClass: currentColumn.cssClass || gridColumn.cssClass,
                        headerCssClass: currentColumn.headerCssClass || gridColumn.headerCssClass,
                        // for the width we will only pull the custom width or else nothing
                        // since we don't want to use the default width that SlickGrid uses internally (which is 60px),
                        // because that would cancel any column resize done by Slickgrid-Universal (like autoResizeColumnsByCellContent)
                        width: currentColumn.width
                    });
                }
            });
        }
        this._columns = columns;
        return columns;
    }
    /**
     * Get the Columns (and their states: visibility/position/width) that are currently applied in the grid
     * @return current columns
     */
    getCurrentColumns() {
        return this.getAssociatedCurrentColumns(this._grid.getColumns() || []);
    }
    /**
     * Get the Filters (and their state, columnId, searchTerm(s)) that are currently applied in the grid
     * @return current filters
     */
    getCurrentFilters() {
        var _a, _b;
        if ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.backendServiceApi) {
            const backendService = this._gridOptions.backendServiceApi.service;
            if (backendService === null || backendService === void 0 ? void 0 : backendService.getCurrentFilters) {
                return backendService.getCurrentFilters();
            }
        }
        else if ((_b = this.filterService) === null || _b === void 0 ? void 0 : _b.getCurrentLocalFilters) {
            return this.filterService.getCurrentLocalFilters();
        }
        return null;
    }
    /**
     * Get current Pagination (and its state, pageNumber, pageSize) that are currently applied in the grid
     * @return current pagination state
     */
    getCurrentPagination() {
        var _a;
        if ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enablePagination) {
            if (this._gridOptions.backendServiceApi) {
                const backendService = this._gridOptions.backendServiceApi.service;
                if (backendService === null || backendService === void 0 ? void 0 : backendService.getCurrentPagination) {
                    return backendService.getCurrentPagination();
                }
            }
            else {
                return this.sharedService.currentPagination;
            }
        }
        return null;
    }
    /**
     * Get the current Row Selections (and its state, gridRowIndexes, dataContextIds, filteredDataContextIds) that are currently applied in the grid
     * @param boolean are we requesting a refresh of the Section FilteredRow
     * @return current row selection
     */
    getCurrentRowSelections() {
        if (this._grid && this._dataView && this.hasRowSelectionEnabled()) {
            return {
                gridRowIndexes: this._grid.getSelectedRows() || [],
                dataContextIds: this._dataView.getAllSelectedIds() || [],
                filteredDataContextIds: this._dataView.getAllSelectedFilteredIds() || []
            };
        }
        return null;
    }
    /**
     * Get the current Sorters (and their state, columnId, direction) that are currently applied in the grid
     * @return current sorters
     */
    getCurrentSorters() {
        var _a, _b;
        if ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.backendServiceApi) {
            const backendService = this._gridOptions.backendServiceApi.service;
            if (backendService === null || backendService === void 0 ? void 0 : backendService.getCurrentSorters) {
                return backendService.getCurrentSorters();
            }
        }
        else if ((_b = this.sortService) === null || _b === void 0 ? void 0 : _b.getCurrentLocalSorters) {
            return this.sortService.getCurrentLocalSorters();
        }
        return null;
    }
    /**
     * Get the current list of Tree Data item(s) that got toggled in the grid
     * @returns {Array<TreeToggledItem>} treeDataToggledItems - items that were toggled (array of `parentId` and `isCollapsed` flag)
     */
    getCurrentTreeDataToggleState() {
        var _a;
        if (((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableTreeData) && this.treeDataService) {
            return this.treeDataService.getCurrentToggleState();
        }
        return null;
    }
    /** Check whether the row selection needs to be preserved */
    needToPreserveRowSelection() {
        var _a;
        let preservedRowSelection = false;
        if (((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.dataView) && this._gridOptions.dataView.hasOwnProperty('syncGridSelection')) {
            const syncGridSelection = this._gridOptions.dataView.syncGridSelection;
            if (typeof syncGridSelection === 'boolean') {
                preservedRowSelection = this._gridOptions.dataView.syncGridSelection;
            }
            else if (typeof syncGridSelection === 'object') {
                preservedRowSelection = syncGridSelection.preserveHidden || syncGridSelection.preserveHiddenOnSelectionChange;
            }
            // if the result is True but the grid is using a Backend Service, we will do an extra flag check the reason is because it might have some unintended behaviors
            // with the BackendServiceApi because technically the data in the page changes the DataView on every page.
            if (preservedRowSelection && this._gridOptions.backendServiceApi && this._gridOptions.dataView.hasOwnProperty('syncGridSelectionWithBackendService')) {
                preservedRowSelection = this._gridOptions.dataView.syncGridSelectionWithBackendService;
            }
        }
        return preservedRowSelection;
    }
    resetColumns(columnDefinitions) {
        const columns = columnDefinitions || this._columns;
        const currentColumns = this.getAssociatedCurrentColumns(columns);
        this.pubSubService.publish('onGridStateChanged', { change: { newValues: currentColumns, type: index_1.GridStateType.columns }, gridState: this.getCurrentGridState() });
    }
    /**
     * Reset the grid to its original (all) columns, that is to display the entire set of columns with their original positions & visibilities
     * @param {Boolean} triggerAutoSizeColumns - True by default, do we also want to call the "autosizeColumns()" method to make the columns fit in the grid?
     */
    resetToOriginalColumns(triggerAutoSizeColumns = true) {
        this._grid.setColumns(this.sharedService.allColumns);
        this.sharedService.visibleColumns = this.sharedService.allColumns;
        // resize the columns to fit the grid canvas
        if (triggerAutoSizeColumns) {
            this._grid.autosizeColumns();
        }
    }
    /** if we use Row Selection or the Checkbox Selector, we need to reset any selection */
    resetRowSelectionWhenRequired() {
        var _a, _b;
        if (!this.needToPreserveRowSelection() && (this._gridOptions.enableRowSelection || this._gridOptions.enableCheckboxSelector)) {
            // this also requires the Row Selection Model to be registered as well
            const rowSelectionExtension = (_b = (_a = this.extensionService) === null || _a === void 0 ? void 0 : _a.getExtensionByName) === null || _b === void 0 ? void 0 : _b.call(_a, index_1.ExtensionName.rowSelection);
            if (rowSelectionExtension === null || rowSelectionExtension === void 0 ? void 0 : rowSelectionExtension.instance) {
                this._grid.setSelectedRows([]);
            }
        }
    }
    /**
     * Subscribe to all necessary SlickGrid or Service Events that deals with a Grid change,
     * when triggered, we will publish a Grid State Event with current Grid State
     */
    subscribeToAllGridChanges(grid) {
        // Subscribe to Event Emitter of Filter changed
        this._subscriptions.push(this.pubSubService.subscribe('onFilterChanged', currentFilters => {
            this.resetRowSelectionWhenRequired();
            this.pubSubService.publish('onGridStateChanged', { change: { newValues: currentFilters, type: index_1.GridStateType.filter }, gridState: this.getCurrentGridState() });
        }));
        // Subscribe to Event Emitter of Filter cleared
        this._subscriptions.push(this.pubSubService.subscribe('onFilterCleared', () => {
            this.resetRowSelectionWhenRequired();
            this.pubSubService.publish('onGridStateChanged', { change: { newValues: [], type: index_1.GridStateType.filter }, gridState: this.getCurrentGridState() });
        }));
        // Subscribe to Event Emitter of Sort changed
        this._subscriptions.push(this.pubSubService.subscribe('onSortChanged', currentSorters => {
            this.resetRowSelectionWhenRequired();
            this.pubSubService.publish('onGridStateChanged', { change: { newValues: currentSorters, type: index_1.GridStateType.sorter }, gridState: this.getCurrentGridState() });
        }));
        // Subscribe to Event Emitter of Sort cleared
        this._subscriptions.push(this.pubSubService.subscribe('onSortCleared', () => {
            this.resetRowSelectionWhenRequired();
            this.pubSubService.publish('onGridStateChanged', { change: { newValues: [], type: index_1.GridStateType.sorter }, gridState: this.getCurrentGridState() });
        }));
        // Subscribe to ColumnPicker and/or GridMenu for show/hide Columns visibility changes
        this.bindExtensionAddonEventToGridStateChange(index_1.ExtensionName.columnPicker, 'onColumnsChanged');
        this.bindExtensionAddonEventToGridStateChange(index_1.ExtensionName.gridMenu, 'onColumnsChanged');
        // subscribe to Column Resize & Reordering
        this.bindSlickGridColumnChangeEventToGridStateChange('onColumnsReordered', grid);
        this.bindSlickGridColumnChangeEventToGridStateChange('onColumnsResized', grid);
        this.bindSlickGridOnSetOptionsEventToGridStateChange(grid);
        // subscribe to Row Selection changes (when enabled)
        if (this._gridOptions.enableRowSelection || this._gridOptions.enableCheckboxSelector) {
            this._eventHandler.subscribe(this._dataView.onSelectedRowIdsChanged, (e, args) => {
                const previousSelectedRowIndexes = (this._selectedRowIndexes || []).slice();
                const previousSelectedFilteredRowDataContextIds = (this.selectedRowDataContextIds || []).slice();
                this.selectedRowDataContextIds = args.filteredIds;
                this._selectedRowIndexes = args.rows;
                if (!(0, lite_1.dequal)(this.selectedRowDataContextIds, previousSelectedFilteredRowDataContextIds) || !(0, lite_1.dequal)(this._selectedRowIndexes, previousSelectedRowIndexes)) {
                    const newValues = { gridRowIndexes: this._selectedRowIndexes || [], dataContextIds: args.selectedRowIds, filteredDataContextIds: args.filteredIds };
                    this.pubSubService.publish('onGridStateChanged', { change: { newValues, type: index_1.GridStateType.rowSelection }, gridState: this.getCurrentGridState() });
                }
            });
        }
        // subscribe to HeaderMenu (hide column)
        this._subscriptions.push(this.pubSubService.subscribe('onHeaderMenuHideColumns', visibleColumns => {
            const currentColumns = this.getAssociatedCurrentColumns(visibleColumns);
            this.pubSubService.publish('onGridStateChanged', { change: { newValues: currentColumns, type: index_1.GridStateType.columns }, gridState: this.getCurrentGridState() });
        }));
        // subscribe to Tree Data toggle items changes
        this._subscriptions.push(this.pubSubService.subscribe('onTreeItemToggled', toggleChange => {
            this.pubSubService.publish('onGridStateChanged', { change: { newValues: toggleChange, type: index_1.GridStateType.treeData }, gridState: this.getCurrentGridState() });
        }));
        // subscribe to Tree Data full tree toggle changes
        this._subscriptions.push(this.pubSubService.subscribe('onTreeFullToggleEnd', toggleChange => {
            this.pubSubService.publish('onGridStateChanged', { change: { newValues: toggleChange, type: index_1.GridStateType.treeData }, gridState: this.getCurrentGridState() });
        }));
    }
    // --
    // protected methods
    // ------------------
    /**
     * Add certain column(s), when the feature is/are enabled, to an output column definitions array (by reference).
     * Basically some features (for example: Row Selection, Row Detail, Row Move) will be added as column(s) dynamically and internally by the lib,
     * we just ask the developer to enable the feature, via flags, and internally the lib will create the necessary column.
     * So specifically for these column(s) and feature(s), we need to re-add them internally when the user calls the `changeColumnsArrangement()` method.
     * @param {Array<Object>} dynamicAddonColumnByIndexPositionList - array of plugin columnId and columnIndexPosition that will be re-added (if it wasn't already found in the output array) dynamically
     * @param {Array<Column>} fullColumnDefinitions - full column definitions array that includes every columns (including Row Selection, Row Detail, Row Move when enabled)
     * @param {Array<Column>} newArrangedColumns - output array that will be use to show in the UI (it could have less columns than fullColumnDefinitions array since user might hide some columns)
     */
    addColumnDynamicWhenFeatureEnabled(dynamicAddonColumnByIndexPositionList, fullColumnDefinitions, newArrangedColumns) {
        // 1- first step is to sort them by their index position
        dynamicAddonColumnByIndexPositionList.sort((feat1, feat2) => feat1.columnIndexPosition - feat2.columnIndexPosition);
        // 2- second step, we can now proceed to create each extension/addon and that will position them accordingly in the column definitions list
        dynamicAddonColumnByIndexPositionList.forEach(feature => {
            const pluginColumnIdx = fullColumnDefinitions.findIndex(col => col.id === feature.columnId);
            const associatedGridCheckboxColumnIdx = newArrangedColumns.findIndex(col => col.id === feature.columnId);
            if (pluginColumnIdx >= 0 && associatedGridCheckboxColumnIdx === -1) {
                const pluginColumn = fullColumnDefinitions[pluginColumnIdx];
                pluginColumnIdx === 0 ? newArrangedColumns.unshift(pluginColumn) : newArrangedColumns.splice(pluginColumnIdx, 0, pluginColumn);
            }
        });
    }
    /**
     * Bind a SlickGrid Extension Event to a Grid State change event
     * @param extension name
     * @param event name
     */
    bindExtensionAddonEventToGridStateChange(extensionName, eventName) {
        var _a, _b, _c;
        const extension = (_b = (_a = this.extensionService) === null || _a === void 0 ? void 0 : _a.getExtensionByName) === null || _b === void 0 ? void 0 : _b.call(_a, extensionName);
        const slickEvent = (_c = extension === null || extension === void 0 ? void 0 : extension.instance) === null || _c === void 0 ? void 0 : _c[eventName];
        if (slickEvent && typeof slickEvent.subscribe === 'function') {
            this._eventHandler.subscribe(slickEvent, (_e, args) => {
                const columns = args === null || args === void 0 ? void 0 : args.columns;
                const currentColumns = this.getAssociatedCurrentColumns(columns);
                this.pubSubService.publish('onGridStateChanged', { change: { newValues: currentColumns, type: index_1.GridStateType.columns }, gridState: this.getCurrentGridState() });
            });
        }
    }
    /**
     * Bind a Grid Event (of Column changes) to a Grid State change event
     * @param event - event name
     * @param grid - SlickGrid object
     */
    bindSlickGridColumnChangeEventToGridStateChange(eventName, grid) {
        const slickGridEvent = grid === null || grid === void 0 ? void 0 : grid[eventName];
        if (slickGridEvent && typeof slickGridEvent.subscribe === 'function') {
            this._eventHandler.subscribe(slickGridEvent, () => {
                const columns = grid.getColumns();
                const currentColumns = this.getAssociatedCurrentColumns(columns);
                this.pubSubService.publish('onGridStateChanged', { change: { newValues: currentColumns, type: index_1.GridStateType.columns }, gridState: this.getCurrentGridState() });
            });
        }
    }
    /**
     * Bind a Grid Event (of grid option changes) to a Grid State change event, if we detect that any of the pinning (frozen) options changes then we'll trigger a Grid State change
     * @param grid - SlickGrid object
     */
    bindSlickGridOnSetOptionsEventToGridStateChange(grid) {
        const onSetOptionsHandler = grid.onSetOptions;
        this._eventHandler.subscribe(onSetOptionsHandler, (_e, args) => {
            const { frozenBottom: frozenBottomBefore, frozenColumn: frozenColumnBefore, frozenRow: frozenRowBefore } = args.optionsBefore;
            const { frozenBottom: frozenBottomAfter, frozenColumn: frozenColumnAfter, frozenRow: frozenRowAfter } = args.optionsAfter;
            if ((frozenBottomBefore !== frozenBottomAfter) || (frozenColumnBefore !== frozenColumnAfter) || (frozenRowBefore !== frozenRowAfter)) {
                const newValues = { frozenBottom: frozenBottomAfter, frozenColumn: frozenColumnAfter, frozenRow: frozenRowAfter };
                const currentGridState = this.getCurrentGridState();
                this.pubSubService.publish('onGridStateChanged', { change: { newValues, type: index_1.GridStateType.pinning }, gridState: currentGridState });
            }
        });
    }
    /** Check wether the grid has the Row Selection enabled */
    hasRowSelectionEnabled() {
        const selectionModel = this._grid.getSelectionModel();
        const isRowSelectionEnabled = this._gridOptions.enableRowSelection || this._gridOptions.enableCheckboxSelector;
        return (isRowSelectionEnabled && selectionModel);
    }
}
exports.GridStateService = GridStateService;
//# sourceMappingURL=gridState.service.js.map