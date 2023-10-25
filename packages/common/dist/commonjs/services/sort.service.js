"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortService = void 0;
const index_1 = require("../enums/index");
const utilities_1 = require("./utilities");
const sortUtilities_1 = require("../sortComparers/sortUtilities");
class SortService {
    constructor(sharedService, pubSubService, backendUtilities, rxjs) {
        this.sharedService = sharedService;
        this.pubSubService = pubSubService;
        this.backendUtilities = backendUtilities;
        this.rxjs = rxjs;
        this._currentLocalSorters = [];
        this._isBackendGrid = false;
        this._eventHandler = new Slick.EventHandler();
        if (this.rxjs) {
            this.httpCancelRequests$ = this.rxjs.createSubject();
        }
    }
    /** Getter of the SlickGrid Event Handler */
    get eventHandler() {
        return this._eventHandler;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get _gridOptions() {
        return (this._grid && this._grid.getOptions) ? this._grid.getOptions() : {};
    }
    /** Getter for the Column Definitions pulled through the Grid Object */
    get _columnDefinitions() {
        return (this._grid && this._grid.getColumns) ? this._grid.getColumns() : [];
    }
    dispose() {
        var _a, _b;
        // unsubscribe all SlickGrid events
        if ((_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.unsubscribeAll) {
            this._eventHandler.unsubscribeAll();
        }
        if (this.httpCancelRequests$ && ((_b = this.rxjs) === null || _b === void 0 ? void 0 : _b.isObservable(this.httpCancelRequests$))) {
            this.httpCancelRequests$.next(); // this cancels any pending http requests
            this.httpCancelRequests$.complete();
        }
    }
    addRxJsResource(rxjs) {
        this.rxjs = rxjs;
    }
    /**
     * Bind a backend sort (single/multi) hook to the grid
     * @param grid SlickGrid Grid object
     * @param dataView SlickGrid DataView object
     */
    bindBackendOnSort(grid) {
        var _a, _b;
        this._isBackendGrid = true;
        this._grid = grid;
        this._dataView = (_b = (_a = grid === null || grid === void 0 ? void 0 : grid.getData) === null || _a === void 0 ? void 0 : _a.call(grid)) !== null && _b !== void 0 ? _b : {};
        // subscribe to the SlickGrid event and call the backend execution
        this._eventHandler.subscribe(grid.onSort, this.onBackendSortChanged.bind(this));
    }
    /**
     * Bind a local sort (single/multi) hook to the grid
     * @param grid SlickGrid Grid object
     * @param gridOptions Grid Options object
     * @param dataView
     */
    bindLocalOnSort(grid) {
        this._isBackendGrid = false;
        this._grid = grid;
        this._dataView = grid.getData();
        this.processTreeDataInitialSort();
        this._eventHandler.subscribe(grid.onSort, this.handleLocalOnSort.bind(this));
    }
    handleLocalOnSort(_e, args) {
        var _a, _b;
        // multiSort and singleSort are not exactly the same, but we want to structure it the same for the (for loop) after
        // also to avoid having to rewrite the for loop in the sort, we will make the singleSort an array of 1 object
        const sortColumns = (args.multiColumnSort) ? args.sortCols : new Array({ columnId: (_b = (_a = args.sortCol) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '', sortAsc: args.sortAsc, sortCol: args.sortCol });
        // keep current sorters
        this._currentLocalSorters = []; // reset current local sorters
        if (Array.isArray(sortColumns)) {
            sortColumns.forEach((sortColumn) => {
                if (sortColumn.sortCol) {
                    this._currentLocalSorters.push({
                        columnId: sortColumn.sortCol.id,
                        direction: sortColumn.sortAsc ? index_1.SortDirection.ASC : index_1.SortDirection.DESC
                    });
                }
            });
        }
        this.onLocalSortChanged(this._grid, sortColumns);
        this.emitSortChanged(index_1.EmitterType.local);
    }
    clearSortByColumnId(event, columnId) {
        var _a, _b;
        // get previously sorted columns
        const allSortedCols = this.getCurrentColumnSorts();
        const sortedColsWithoutCurrent = this.getCurrentColumnSorts(`${columnId}`);
        if (Array.isArray(allSortedCols) && Array.isArray(sortedColsWithoutCurrent) && allSortedCols.length !== sortedColsWithoutCurrent.length) {
            if (this._gridOptions.backendServiceApi) {
                this.onBackendSortChanged(event, { multiColumnSort: true, sortCols: sortedColsWithoutCurrent, grid: this._grid });
            }
            else if (this._dataView) {
                this.onLocalSortChanged(this._grid, sortedColsWithoutCurrent, true, true);
            }
            else {
                // when using customDataView, we will simply send it as a onSort event with notify
                const isMultiSort = (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.multiColumnSort) !== null && _b !== void 0 ? _b : false;
                const sortOutput = isMultiSort ? sortedColsWithoutCurrent : sortedColsWithoutCurrent[0];
                this._grid.onSort.notify(sortOutput);
            }
            // update the grid sortColumns array which will at the same add the visual sort icon(s) on the UI
            const updatedSortColumns = sortedColsWithoutCurrent.map((col) => {
                return {
                    columnId: col && col.sortCol && col.sortCol.id,
                    sortAsc: col && col.sortAsc,
                    sortCol: col && col.sortCol,
                };
            });
            this._grid.setSortColumns(updatedSortColumns); // add sort icon in UI
        }
        // when there's no more sorting, we re-sort by the default sort field, user can customize it "defaultColumnSortFieldId", defaults to "id"
        if (Array.isArray(sortedColsWithoutCurrent) && sortedColsWithoutCurrent.length === 0) {
            this.sortLocalGridByDefaultSortFieldId();
        }
    }
    /**
     * Clear Sorting
     * - 1st, remove the SlickGrid sort icons (this setSortColumns function call really does only that)
     * - 2nd, we also need to trigger a sort change
     *   - for a backend grid, we will trigger a backend sort changed with an empty sort columns array
     *   - however for a local grid, we need to pass a sort column and so we will sort by the 1st column
     * @param trigger query event after executing clear filter?
     */
    clearSorting(triggerQueryEvent = true) {
        var _a, _b;
        if (this._grid && this._gridOptions && this._dataView) {
            // remove any sort icons (this setSortColumns function call really does only that)
            this._grid.setSortColumns([]);
            // we also need to trigger a sort change
            // for a backend grid, we will trigger a backend sort changed with an empty sort columns array
            // however for a local grid, we need to pass a sort column and so we will sort by the 1st column
            if (triggerQueryEvent) {
                if (this._isBackendGrid) {
                    this.onBackendSortChanged(undefined, { grid: this._grid, multiColumnSort: true, sortCols: [], clearSortTriggered: true });
                }
                else {
                    if (this._columnDefinitions && Array.isArray(this._columnDefinitions) && this._columnDefinitions.length > 0) {
                        this.sortLocalGridByDefaultSortFieldId();
                    }
                }
            }
            else if (this._isBackendGrid) {
                const backendService = (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.backendServiceApi) === null || _b === void 0 ? void 0 : _b.service;
                if (backendService === null || backendService === void 0 ? void 0 : backendService.clearSorters) {
                    backendService.clearSorters();
                }
            }
        }
        // set current sorter to empty & emit a sort changed event
        this._currentLocalSorters = [];
        // emit an event when sorts are all cleared
        this.pubSubService.publish('onSortCleared', true);
    }
    /**
     * Toggle the Sorting Functionality
     * @param {boolean} isSortingDisabled - optionally force a disable/enable of the Sort Functionality? Defaults to True
     * @param {boolean} clearSortingWhenDisabled - when disabling the sorting, do we also want to clear the sorting as well? Defaults to True
     */
    disableSortFunctionality(isSortingDisabled = true, clearSortingWhenDisabled = true) {
        const prevSorting = this._gridOptions.enableSorting;
        const newSorting = !prevSorting;
        this._gridOptions.enableSorting = newSorting;
        let updatedColumnDefinitions;
        if (isSortingDisabled) {
            if (clearSortingWhenDisabled) {
                this.clearSorting();
            }
            this._eventHandler.unsubscribeAll();
            updatedColumnDefinitions = this.disableAllSortingCommands(true);
        }
        else {
            updatedColumnDefinitions = this.disableAllSortingCommands(false);
            this._eventHandler.subscribe(this._grid.onSort, (e, args) => this.handleLocalOnSort(e, args));
        }
        this._grid.setOptions({ enableSorting: this._gridOptions.enableSorting }, false, true);
        this.sharedService.gridOptions = this._gridOptions;
        // reset columns so that it recreate the column headers and remove/add the sort icon hints
        // basically without this, the sort icon hints were still showing up even after disabling the Sorting
        this._grid.setColumns(updatedColumnDefinitions);
    }
    /**
     * Toggle the Sorting functionality
     * @param {boolean} clearSortingWhenDisabled - when disabling the sorting, do we also want to clear the sorting as well? Defaults to True
     */
    toggleSortFunctionality(clearSortingOnDisable = true) {
        const previousSorting = this._gridOptions.enableSorting;
        this.disableSortFunctionality(previousSorting, clearSortingOnDisable);
    }
    /**
     * A simple function that will be called to emit a change when a sort changes.
     * Other services, like Pagination, can then subscribe to it.
     * @param sender
     */
    emitSortChanged(sender, currentLocalSorters) {
        var _a;
        if (sender === index_1.EmitterType.remote && ((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.backendServiceApi)) {
            let currentSorters = [];
            const backendService = this._gridOptions.backendServiceApi.service;
            if (backendService === null || backendService === void 0 ? void 0 : backendService.getCurrentSorters) {
                currentSorters = backendService.getCurrentSorters();
            }
            this.pubSubService.publish('onSortChanged', currentSorters);
        }
        else if (sender === index_1.EmitterType.local) {
            if (currentLocalSorters) {
                this._currentLocalSorters = currentLocalSorters;
            }
            this.pubSubService.publish('onSortChanged', this.getCurrentLocalSorters());
        }
    }
    getCurrentLocalSorters() {
        return this._currentLocalSorters;
    }
    /**
     * Get current column sorts,
     * If a column is passed as an argument, that will be exclusion so we won't add this column to our output array since it is already in the array.
     * The usage of this method is that we want to know the sort prior to calling the next sorting command
     */
    getCurrentColumnSorts(excludedColumnId) {
        // getSortColumns() only returns sortAsc & columnId, we want the entire column definition
        if (this._grid) {
            const oldSortColumns = this._grid.getSortColumns();
            // get the column definition but only keep column which are not equal to our current column
            if (Array.isArray(oldSortColumns)) {
                const sortedCols = oldSortColumns.reduce((cols, col) => {
                    if (col && (!excludedColumnId || col.columnId !== excludedColumnId)) {
                        cols.push({ columnId: col.columnId || '', sortCol: this._columnDefinitions[this._grid.getColumnIndex(col.columnId || '')], sortAsc: col.sortAsc });
                    }
                    return cols;
                }, []);
                return sortedCols;
            }
        }
        return [];
    }
    /** Load defined Sorting (sorters) into the grid */
    loadGridSorters(sorters) {
        this._currentLocalSorters = []; // reset current local sorters
        const sortCols = [];
        if (Array.isArray(sorters)) {
            const tmpSorters = this._gridOptions.multiColumnSort ? sorters : sorters.slice(0, 1);
            tmpSorters.forEach((sorter) => {
                const gridColumn = this._columnDefinitions.find((col) => col.id === sorter.columnId);
                if (gridColumn) {
                    sortCols.push({
                        columnId: gridColumn.id,
                        sortAsc: ((sorter.direction.toUpperCase() === index_1.SortDirection.ASC) ? true : false),
                        sortCol: gridColumn
                    });
                    // keep current sorters
                    this._currentLocalSorters.push({
                        columnId: gridColumn.id + '',
                        direction: sorter.direction.toUpperCase()
                    });
                }
            });
            this.onLocalSortChanged(this._grid, sortCols);
            this._grid.setSortColumns(sortCols.map(col => ({ columnId: col.columnId, sortAsc: col.sortAsc }))); // use this to add sort icon(s) in UI
        }
        return sortCols;
    }
    /** Process the initial sort, typically it will sort ascending by the column that has the Tree Data unless user specifies a different initialSort */
    processTreeDataInitialSort() {
        var _a, _b, _c;
        // when a Tree Data view is defined, we must sort the data so that the UI works correctly
        if (((_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.enableTreeData) && this._gridOptions.treeDataOptions) {
            // first presort it once by tree level
            const treeDataOptions = this._gridOptions.treeDataOptions;
            const columnWithTreeData = this._columnDefinitions.find((col) => col.id === treeDataOptions.columnId);
            if (columnWithTreeData) {
                let sortDirection = index_1.SortDirection.ASC;
                let sortTreeLevelColumn = { columnId: treeDataOptions.columnId, sortCol: columnWithTreeData, sortAsc: true };
                // user could provide a custom sort field id, if so get that column and sort by it
                if ((_b = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.initialSort) === null || _b === void 0 ? void 0 : _b.columnId) {
                    const initialSortColumnId = treeDataOptions.initialSort.columnId;
                    const initialSortColumn = this._columnDefinitions.find((col) => col.id === initialSortColumnId);
                    sortDirection = (treeDataOptions.initialSort.direction || index_1.SortDirection.ASC).toUpperCase();
                    sortTreeLevelColumn = { columnId: initialSortColumnId, sortCol: initialSortColumn, sortAsc: (sortDirection === index_1.SortDirection.ASC) };
                }
                // when we have a valid column with Tree Data, we can sort by that column
                if ((sortTreeLevelColumn === null || sortTreeLevelColumn === void 0 ? void 0 : sortTreeLevelColumn.columnId) && ((_c = this.sharedService) === null || _c === void 0 ? void 0 : _c.hierarchicalDataset)) {
                    this.updateSorting([{ columnId: sortTreeLevelColumn.columnId || '', direction: sortDirection }]);
                }
            }
        }
    }
    /**
     * When working with Backend Service, we'll use the `onBeforeSort` which will return false since we want to manually apply the sort icons only after the server response
     * @param event - optional Event that triggered the sort
     * @param args - sort event arguments
     * @returns - False since we'll apply the sort icon(s) manually only after server responded
     */
    onBackendSortChanged(event, args) {
        var _a, _b;
        if (!args || !args.grid) {
            throw new Error('Something went wrong when trying to bind the "onBackendSortChanged(event, args)" function, it seems that "args" is not populated correctly');
        }
        const gridOptions = (args.grid && args.grid.getOptions) ? args.grid.getOptions() : {};
        const backendApi = gridOptions.backendServiceApi;
        if (!backendApi || !backendApi.process || !backendApi.service) {
            throw new Error(`BackendServiceApi requires at least a "process" function and a "service" defined`);
        }
        // keep start time & end timestamps & return it after process execution
        const startTime = new Date();
        if (backendApi.preProcess) {
            backendApi.preProcess();
        }
        // query backend
        const query = backendApi.service.processOnSortChanged(event, args);
        const totalItems = ((_a = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.pagination) === null || _a === void 0 ? void 0 : _a.totalItems) || 0;
        (_b = this.backendUtilities) === null || _b === void 0 ? void 0 : _b.executeBackendCallback(backendApi, query, args, startTime, totalItems, {
            emitActionChangedCallback: this.emitSortChanged.bind(this),
            errorCallback: () => {
                var _a, _b, _c;
                // revert to previous sort icons & also revert backend service query
                this._grid.setSortColumns(args.previousSortColumns || []);
                // we also need to provide the `sortCol` when using the backend service `updateSorters` method
                const sorterData = (_a = args.previousSortColumns) === null || _a === void 0 ? void 0 : _a.map(cs => ({
                    columnId: cs.columnId,
                    sortAsc: cs.sortAsc,
                    sortCol: this._columnDefinitions.find(col => col.id === cs.columnId)
                }));
                (_c = (_b = backendApi === null || backendApi === void 0 ? void 0 : backendApi.service) === null || _b === void 0 ? void 0 : _b.updateSorters) === null || _c === void 0 ? void 0 : _c.call(_b, sorterData || []);
            },
            httpCancelRequestSubject: this.httpCancelRequests$
        });
    }
    /** When a Sort Changes on a Local grid (JSON dataset) */
    async onLocalSortChanged(grid, sortColumns, forceReSort = false, emitSortChanged = false) {
        var _a, _b, _c, _d, _f;
        const datasetIdPropertyName = (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.datasetIdPropertyName) !== null && _b !== void 0 ? _b : 'id';
        const isTreeDataEnabled = (_d = (_c = this._gridOptions) === null || _c === void 0 ? void 0 : _c.enableTreeData) !== null && _d !== void 0 ? _d : false;
        const dataView = (_f = grid.getData) === null || _f === void 0 ? void 0 : _f.call(grid);
        await this.pubSubService.publish('onBeforeSortChange', { sortColumns }, 0);
        if (grid && dataView) {
            if (forceReSort && !isTreeDataEnabled) {
                dataView.reSort();
            }
            if (isTreeDataEnabled && this.sharedService && Array.isArray(this.sharedService.hierarchicalDataset)) {
                const datasetSortResult = this.sortHierarchicalDataset(this.sharedService.hierarchicalDataset, sortColumns);
                // we could use the DataView sort but that would require re-sorting again (since the 2nd array that is currently in the DataView would have to be resorted against the 1st array that was sorting from tree sort)
                // it is simply much faster to just replace the entire dataset
                this._dataView.setItems(datasetSortResult.flat, datasetIdPropertyName);
                // also trigger a row count changed to avoid having an invalid filtered item count in the grid footer
                // basically without this the item count in the footer is incorrect and shows the full dataset length instead of the previous filtered count
                // that happens because we just overwrote the entire dataset the DataView.refresh() doesn't detect a row count change so we trigger it manually
                this._dataView.onRowCountChanged.notify({ previous: this._dataView.getFilteredItemCount(), current: this._dataView.getLength(), itemCount: this._dataView.getItemCount(), dataView: this._dataView, callingOnRowsChanged: true });
            }
            else {
                dataView.sort(this.sortComparers.bind(this, sortColumns));
            }
            grid.invalidate();
            if (emitSortChanged) {
                this.emitSortChanged(index_1.EmitterType.local, sortColumns.map(col => {
                    var _a, _b;
                    return {
                        columnId: (_b = (_a = col.sortCol) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : 'id',
                        direction: col.sortAsc ? index_1.SortDirection.ASC : index_1.SortDirection.DESC
                    };
                }));
            }
        }
    }
    /** Takes a hierarchical dataset and sort it recursively,  */
    sortHierarchicalDataset(hierarchicalDataset, sortColumns, emitSortChanged = false) {
        var _a, _b, _c, _d, _f, _g;
        this.sortTreeData(hierarchicalDataset, sortColumns);
        const dataViewIdIdentifier = (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.datasetIdPropertyName) !== null && _b !== void 0 ? _b : 'id';
        const treeDataOpt = (_d = (_c = this._gridOptions) === null || _c === void 0 ? void 0 : _c.treeDataOptions) !== null && _d !== void 0 ? _d : { columnId: '' };
        const treeDataOptions = { ...treeDataOpt, identifierPropName: (_f = treeDataOpt.identifierPropName) !== null && _f !== void 0 ? _f : dataViewIdIdentifier, shouldAddTreeLevelNumber: true };
        const sortedFlatArray = (0, utilities_1.flattenToParentChildArray)(hierarchicalDataset, treeDataOptions);
        if (emitSortChanged) {
            // update current sorters
            this._currentLocalSorters = [];
            for (const sortCol of sortColumns) {
                this._currentLocalSorters.push({ columnId: sortCol.columnId, direction: sortCol.sortAsc ? 'ASC' : 'DESC' });
            }
            const emitterType = ((_g = this._gridOptions) === null || _g === void 0 ? void 0 : _g.backendServiceApi) ? index_1.EmitterType.remote : index_1.EmitterType.local;
            this.emitSortChanged(emitterType);
        }
        return { hierarchical: hierarchicalDataset, flat: sortedFlatArray };
    }
    /** Call a local grid sort by its default sort field id (user can customize default field by configuring "defaultColumnSortFieldId" in the grid options, defaults to "id") */
    sortLocalGridByDefaultSortFieldId() {
        const sortColFieldId = this._gridOptions && this._gridOptions.defaultColumnSortFieldId || this._gridOptions.datasetIdPropertyName || 'id';
        const sortCol = { id: sortColFieldId, field: sortColFieldId };
        this.onLocalSortChanged(this._grid, new Array({ columnId: sortCol.id, sortAsc: true, sortCol, clearSortTriggered: true }), false, true);
    }
    sortComparers(sortColumns, dataRow1, dataRow2) {
        if (Array.isArray(sortColumns)) {
            for (const sortColumn of sortColumns) {
                const result = this.sortComparer(sortColumn, dataRow1, dataRow2);
                if (result !== undefined) {
                    return result;
                }
            }
        }
        return index_1.SortDirectionNumber.neutral;
    }
    sortComparer(sortColumn, dataRow1, dataRow2, querySortField) {
        if (sortColumn === null || sortColumn === void 0 ? void 0 : sortColumn.sortCol) {
            const columnDef = sortColumn.sortCol;
            const sortDirection = sortColumn.sortAsc ? index_1.SortDirectionNumber.asc : index_1.SortDirectionNumber.desc;
            let queryFieldName1 = querySortField || columnDef.queryFieldSorter || columnDef.queryField || columnDef.field;
            let queryFieldName2 = queryFieldName1;
            const fieldType = columnDef.type || index_1.FieldType.string;
            // if user provided a query field name getter callback, we need to get the name on each item independently
            if (typeof columnDef.queryFieldNameGetterFn === 'function') {
                queryFieldName1 = columnDef.queryFieldNameGetterFn(dataRow1);
                queryFieldName2 = columnDef.queryFieldNameGetterFn(dataRow2);
            }
            let value1 = dataRow1[queryFieldName1];
            let value2 = dataRow2[queryFieldName2];
            // when item is a complex object (dot "." notation), we need to filter the value contained in the object tree
            if (queryFieldName1 && queryFieldName1.indexOf('.') >= 0) {
                value1 = (0, utilities_1.getDescendantProperty)(dataRow1, queryFieldName1);
            }
            if (queryFieldName2 && queryFieldName2.indexOf('.') >= 0) {
                value2 = (0, utilities_1.getDescendantProperty)(dataRow2, queryFieldName2);
            }
            // user could provide his own custom Sorter
            if (columnDef.sortComparer) {
                const customSortResult = columnDef.sortComparer(value1, value2, sortDirection, columnDef, this._gridOptions);
                if (customSortResult !== index_1.SortDirectionNumber.neutral) {
                    return customSortResult;
                }
            }
            else {
                const sortResult = (0, sortUtilities_1.sortByFieldType)(fieldType, value1, value2, sortDirection, columnDef, this._gridOptions);
                if (sortResult !== index_1.SortDirectionNumber.neutral) {
                    return sortResult;
                }
            }
        }
        return undefined;
    }
    sortTreeData(treeArray, sortColumns) {
        if (Array.isArray(sortColumns)) {
            for (const sortColumn of sortColumns) {
                this.sortTreeChildren(treeArray, sortColumn, 0);
            }
        }
    }
    /** Sort the Tree Children of a hierarchical dataset by recursion */
    sortTreeChildren(treeArray, sortColumn, treeLevel) {
        var _a, _b;
        const treeDataOptions = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.treeDataOptions;
        const childrenPropName = (_b = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.childrenPropName) !== null && _b !== void 0 ? _b : 'children';
        treeArray.sort((a, b) => { var _a; return (_a = this.sortComparer(sortColumn, a, b)) !== null && _a !== void 0 ? _a : index_1.SortDirectionNumber.neutral; });
        // when item has a child, we'll sort recursively
        for (const item of treeArray) {
            if (item) {
                const hasChildren = item.hasOwnProperty(childrenPropName) && Array.isArray(item[childrenPropName]);
                // when item has a child, we'll sort recursively
                if (hasChildren) {
                    treeLevel++;
                    this.sortTreeChildren(item[childrenPropName], sortColumn, treeLevel);
                    treeLevel--;
                }
            }
        }
    }
    /**
     * Update Sorting (sorters) dynamically just by providing an array of sorter(s).
     * You can also choose emit (default) a Sort Changed event that will be picked by the Grid State Service.
     *
     * Also for backend service only, you can choose to trigger a backend query (default) or not if you wish to do it later,
     * this could be useful when using updateFilters & updateSorting and you wish to only send the backend query once.
     * @param sorters array
     * @param triggerEvent defaults to True, do we want to emit a sort changed event?
     * @param triggerBackendQuery defaults to True, which will query the backend.
     */
    updateSorting(sorters, emitChangedEvent = true, triggerBackendQuery = true) {
        var _a, _b;
        if (!this._gridOptions || !this._gridOptions.enableSorting) {
            throw new Error('[Slickgrid-Universal] in order to use "updateSorting" method, you need to have Sortable Columns defined in your grid and "enableSorting" set in your Grid Options');
        }
        if (Array.isArray(sorters)) {
            const backendApi = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.backendServiceApi;
            if (backendApi) {
                const backendApiService = backendApi === null || backendApi === void 0 ? void 0 : backendApi.service;
                if (backendApiService === null || backendApiService === void 0 ? void 0 : backendApiService.updateSorters) {
                    backendApiService.updateSorters(undefined, sorters);
                    if (triggerBackendQuery) {
                        (_b = this.backendUtilities) === null || _b === void 0 ? void 0 : _b.refreshBackendDataset(this._gridOptions);
                    }
                }
            }
            else {
                this.loadGridSorters(sorters);
            }
            if (emitChangedEvent) {
                const emitterType = backendApi ? index_1.EmitterType.remote : index_1.EmitterType.local;
                this.emitSortChanged(emitterType);
            }
        }
    }
    // --
    // protected functions
    // -------------------
    /**
     * Loop through all column definitions and do the following 2 things
     * 1. disable/enable the "sortable" property of each column
     * 2. loop through each Header Menu commands and change the "hidden" commands to show/hide depending if it's enabled/disabled
     * Also note that we aren't deleting any properties, we just toggle their flags so that we can reloop through at later point in time.
     * (if we previously deleted these properties we wouldn't be able to change them back since these properties wouldn't exist anymore, hence why we just hide the commands)
     * @param {boolean} isDisabling - are we disabling the sort functionality? Defaults to true
     */
    disableAllSortingCommands(isDisabling = true) {
        var _a, _b;
        const columnDefinitions = this._grid.getColumns();
        // loop through column definition to hide/show header menu commands
        columnDefinitions.forEach((col) => {
            var _a;
            if (typeof col.sortable !== undefined) {
                col.sortable = !isDisabling;
            }
            if ((_a = col === null || col === void 0 ? void 0 : col.header) === null || _a === void 0 ? void 0 : _a.menu) {
                col.header.menu.items.forEach(menuItem => {
                    if (menuItem && typeof menuItem !== 'string') {
                        const menuCommand = menuItem.command;
                        if (menuCommand === 'sort-asc' || menuCommand === 'sort-desc' || menuCommand === 'clear-sort') {
                            menuItem.hidden = isDisabling;
                        }
                    }
                });
            }
        });
        // loop through column definition to hide/show grid menu commands
        const commandItems = (_b = (_a = this._gridOptions) === null || _a === void 0 ? void 0 : _a.gridMenu) === null || _b === void 0 ? void 0 : _b.commandItems;
        if (commandItems) {
            commandItems.forEach((menuItem) => {
                if (menuItem && typeof menuItem !== 'string') {
                    const menuCommand = menuItem.command;
                    if (menuCommand === 'clear-sorting') {
                        menuItem.hidden = isDisabling;
                    }
                }
            });
        }
        return columnDefinitions;
    }
}
exports.SortService = SortService;
//# sourceMappingURL=sort.service.js.map