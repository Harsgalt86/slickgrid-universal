"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeDataService = void 0;
const constants_1 = require("../constants");
const index_1 = require("../enums/index");
const utilities_1 = require("./utilities");
class TreeDataService {
    constructor(pubSubService, sharedService, sortService) {
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this.sortService = sortService;
        this._currentToggledItems = [];
        this._isLastFullToggleCollapsed = false;
        this._isOneCpuCyclePassed = false;
        this._isTreeDataEnabled = false;
        this._subscriptions = [];
        this._treeDataRecalcHandler = null;
        this._eventHandler = new Slick.EventHandler();
        setTimeout(() => this._isOneCpuCyclePassed = true);
    }
    set currentToggledItems(newToggledItems) {
        this._currentToggledItems = newToggledItems;
    }
    get dataset() {
        var _a;
        return (_a = this.dataView) === null || _a === void 0 ? void 0 : _a.getItems();
    }
    get datasetHierarchical() {
        return this.sharedService.hierarchicalDataset;
    }
    /** Getter of SlickGrid DataView object */
    get dataView() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getData) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    /** Getter of the SlickGrid Event Handler */
    get eventHandler() {
        return this._eventHandler;
    }
    get gridOptions() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    get treeDataOptions() {
        return this.gridOptions.treeDataOptions;
    }
    dispose() {
        // unsubscribe all SlickGrid events
        this._eventHandler.unsubscribeAll();
        this.pubSubService.unsubscribeAll(this._subscriptions);
    }
    init(grid) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        this._grid = grid;
        this._isTreeDataEnabled = (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.enableTreeData) !== null && _b !== void 0 ? _b : false;
        this._isLastFullToggleCollapsed = (_d = (_c = this.treeDataOptions) === null || _c === void 0 ? void 0 : _c.initiallyCollapsed) !== null && _d !== void 0 ? _d : false;
        this._currentToggledItems = (_g = (_f = (_e = this.gridOptions.presets) === null || _e === void 0 ? void 0 : _e.treeData) === null || _f === void 0 ? void 0 : _f.toggledItems) !== null && _g !== void 0 ? _g : [];
        this._lastToggleStateChange = {
            type: this._isLastFullToggleCollapsed ? 'full-collapse' : 'full-expand',
            previousFullToggleType: this._isLastFullToggleCollapsed ? 'full-collapse' : 'full-expand',
            toggledItems: this._currentToggledItems
        };
        // there's a few limitations with Tree Data, we'll just throw error when that happens
        if (this._isTreeDataEnabled) {
            if ((_h = this.gridOptions) === null || _h === void 0 ? void 0 : _h.multiColumnSort) {
                throw new Error('[Slickgrid-Universal] It looks like you are trying to use Tree Data with multi-column sorting, unfortunately it is not supported because of its complexity, you can disable it via "multiColumnSort: false" grid option and/or help in providing support for this feature.');
            }
            if (!((_j = this.gridOptions) === null || _j === void 0 ? void 0 : _j.enableFiltering)) {
                throw new Error('[Slickgrid-Universal] It looks like you are trying to use Tree Data without using the filtering option, unfortunately that is not possible with Tree Data since it relies heavily on the filters to expand/collapse the tree. You need to enable it via "enableFiltering: true"');
            }
            if (((_k = this.gridOptions) === null || _k === void 0 ? void 0 : _k.backendServiceApi) || ((_l = this.gridOptions) === null || _l === void 0 ? void 0 : _l.enablePagination)) {
                throw new Error('[Slickgrid-Universal] It looks like you are trying to use Tree Data with Pagination and/or a Backend Service (OData, GraphQL) but unfortunately that is simply not supported because of its complexity.');
            }
            if (!this.gridOptions.treeDataOptions || !this.gridOptions.treeDataOptions.columnId) {
                throw new Error('[Slickgrid-Universal] When enabling tree data, you must also provide the "treeDataOption" property in your Grid Options with "childrenPropName" or "parentPropName" (depending if your array is hierarchical or flat) for the Tree Data to work properly.');
            }
        }
        // subscribe to the SlickGrid event and call the backend execution
        this._eventHandler.subscribe(grid.onClick, this.handleOnCellClick.bind(this));
        // when "Clear all Sorting" is triggered by the Grid Menu, we'll resort with `initialSort` when defined (or else by 'id')
        this._subscriptions.push(this.pubSubService.subscribe('onGridMenuClearAllSorting', this.clearSorting.bind(this)));
        // when Tree Data totals auto-recalc feature is enabled, we will define its handler to do the recalc
        this._treeDataRecalcHandler = this.setAutoRecalcTotalsCallbackWhenFeatEnabled(this.gridOptions);
        this._eventHandler.subscribe(this.dataView.onRowCountChanged, () => {
            var _a, _b;
            // call Tree Data recalc handler, inside a debounce, when defined but only when at least 1 CPU cycle is passed
            // we wait for 1 CPU cycle to make sure that we only run it after filtering and grid initialization of tree & grid is over
            if (typeof this._treeDataRecalcHandler === 'function' && this._isOneCpuCyclePassed) {
                clearTimeout(this._timer);
                this._timer = setTimeout(() => { var _a; return (_a = this._treeDataRecalcHandler) === null || _a === void 0 ? void 0 : _a.call(this); }, (_b = (_a = this.treeDataOptions) === null || _a === void 0 ? void 0 : _a.autoRecalcTotalsDebounce) !== null && _b !== void 0 ? _b : 0);
            }
        });
    }
    /**
     * Apply different tree toggle state changes (to ALL rows, the entire dataset) by providing an array of parentIds that are designated as collapsed (or not).
     * User will have to provide an array of `parentId` and `isCollapsed` boolean and the code will only apply the ones that are tagged as collapsed, everything else will be expanded
     * @param {Array<TreeToggledItem>} treeToggledItems - array of parentId which are tagged as changed
     * @param {ToggleStateChangeType} previousFullToggleType - optionally provide the previous full toggle type ('full-expand' or 'full-collapse')
     * @param {Boolean} shouldPreProcessFullToggle - should we pre-process a full toggle on all items? defaults to True
     * @param {Boolean} shouldTriggerEvent - should we trigger a toggled item event? defaults to False
     */
    applyToggledItemStateChanges(treeToggledItems, previousFullToggleType, shouldPreProcessFullToggle = true, shouldTriggerEvent = false) {
        if (Array.isArray(treeToggledItems)) {
            const collapsedPropName = this.getTreeDataOptionPropName('collapsedPropName');
            const hasChildrenPropName = this.getTreeDataOptionPropName('hasChildrenPropName');
            // for the rows we identified as collapsed, we'll send them to the DataView with the new updated collapsed flag
            // and we'll refresh the DataView to see the collapsing applied in the grid
            this.dataView.beginUpdate(true);
            // we first need to put back the previous full toggle state (whether it was a full collapse or expand) by collapsing/expanding everything depending on the last toggled that was called `isLastFullToggleCollapsed`
            const previousFullToggle = previousFullToggleType !== null && previousFullToggleType !== void 0 ? previousFullToggleType : this._lastToggleStateChange.previousFullToggleType;
            const shouldCollapseAll = previousFullToggle === 'full-collapse';
            // when full toggle type is provided, we also need to update our internal reference of our current toggle state
            if (previousFullToggleType) {
                this._lastToggleStateChange.previousFullToggleType = previousFullToggleType;
            }
            // typically (optionally and defaults to true) if we want to reapply some toggled items we probably want to be in the full toggled state as it was at the start
            // collapse/expand from the last full toggle state, all the items which are parent items with children
            if (shouldPreProcessFullToggle) {
                (this.dataView.getItems() || []).forEach((item) => {
                    if (item[hasChildrenPropName]) {
                        item[collapsedPropName] = shouldCollapseAll;
                    }
                });
            }
            // then we reapply only the ones that changed (provided as argument to the function)
            // we also don't need to call the DataView `endUpdate()`, for the transaction ending, because it will be called inside this other method
            this.dynamicallyToggleItemState(treeToggledItems, shouldTriggerEvent);
        }
    }
    /**
     * Dynamically toggle and change state of certain parent items by providing an array of parentIds that are designated as to be collapsed (or not).
     * User will have to provide an array of `parentId` and `isCollapsed` boolean, only the provided list of items will be toggled and nothing else.
     *
     * NOTE: the `applyToggledItemStateChanges()` method is very similar but on top of toggling the `treeToggledItems` it WILL ALSO collapse everything else.
     * @param {Array<TreeToggledItem>} treeToggledItems - array of parentId which are tagged as changed
     * @param {Boolean} shouldTriggerEvent - should we trigger a toggled item event? defaults to True
     */
    dynamicallyToggleItemState(treeToggledItems, shouldTriggerEvent = true) {
        if (Array.isArray(treeToggledItems)) {
            // for the rows we identified as collapsed, we'll send them to the DataView with the new updated collapsed flag
            // and we'll refresh the DataView to see the collapsing applied in the grid
            this.dataView.beginUpdate(true);
            // then we reapply only the ones that changed (provided as argument to the function)
            for (const collapsedItem of treeToggledItems) {
                const item = this.dataView.getItemById(collapsedItem.itemId);
                this.updateToggledItem(item, collapsedItem.isCollapsed);
                if (shouldTriggerEvent) {
                    const parentFoundIdx = this._currentToggledItems.findIndex(treeChange => treeChange.itemId === collapsedItem.itemId);
                    if (parentFoundIdx >= 0) {
                        this._currentToggledItems[parentFoundIdx].isCollapsed = collapsedItem.isCollapsed;
                    }
                    else {
                        this._currentToggledItems.push({ itemId: collapsedItem.itemId, isCollapsed: collapsedItem.isCollapsed });
                    }
                    this.pubSubService.publish('onTreeItemToggled', {
                        ...this._lastToggleStateChange,
                        fromItemId: collapsedItem.itemId,
                        toggledItems: this._currentToggledItems,
                        type: collapsedItem.isCollapsed ? index_1.ToggleStateChangeType.toggleCollapse : index_1.ToggleStateChangeType.toggleExpand
                    });
                }
            }
            // close the update transaction & call a refresh which will trigger a re-render with filters applied (including expand/collapse)
            this.dataView.endUpdate();
            this.dataView.refresh();
        }
    }
    /**
     * Get the current toggle state that includes the type (toggle, full-expand, full-collapse) and toggled items (only applies when it's a parent toggle)
     * @returns {TreeToggleStateChange} treeDataToggledItems - items that were toggled (array of `parentId` and `isCollapsed` flag)
     */
    getCurrentToggleState() {
        return this._lastToggleStateChange;
    }
    getInitialSort(columnDefinitions, gridOptions) {
        var _a, _b, _c;
        const treeDataOptions = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.treeDataOptions;
        const initialColumnSorting = (_a = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.initialSort) !== null && _a !== void 0 ? _a : { columnId: (_b = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.columnId) !== null && _b !== void 0 ? _b : '', direction: 'ASC' };
        const initialSortColumn = columnDefinitions.find(col => col.id === initialColumnSorting.columnId);
        return {
            columnId: initialColumnSorting.columnId,
            sortAsc: ((_c = initialColumnSorting === null || initialColumnSorting === void 0 ? void 0 : initialColumnSorting.direction) === null || _c === void 0 ? void 0 : _c.toUpperCase()) !== 'DESC',
            sortCol: initialSortColumn,
        };
    }
    /**
     * Get the full item count of the Tree.
     * When an optional tree level is provided, it will return the count for only that dedicated level (for example providing 0 would return the item count of all parent items)
     * @param {Number} [treeLevel] - optional tree level to get item count from
     * @returns
     */
    getItemCount(treeLevel) {
        if (treeLevel !== undefined) {
            const levelPropName = this.getTreeDataOptionPropName('levelPropName');
            return this.dataView.getItems().filter(dataContext => dataContext[levelPropName] === treeLevel).length;
        }
        return this.dataView.getItemCount();
    }
    /**
     * Get the current list of Tree Data item(s) that got toggled in the grid (basically the parents that the user clicked on the toggle icon to expand/collapse the child)
     * @returns {Array<TreeToggledItem>} treeDataToggledItems - items that were toggled (array of `parentId` and `isCollapsed` flag)
     */
    getToggledItems() {
        return this._currentToggledItems;
    }
    /** Find the associated property name from the Tree Data option when found or return a default property name that we defined internally */
    getTreeDataOptionPropName(optionName) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        let propName = '';
        switch (optionName) {
            case 'childrenPropName':
                propName = (_b = (_a = this.treeDataOptions) === null || _a === void 0 ? void 0 : _a.childrenPropName) !== null && _b !== void 0 ? _b : constants_1.Constants.treeDataProperties.CHILDREN_PROP;
                break;
            case 'collapsedPropName':
                propName = (_d = (_c = this.treeDataOptions) === null || _c === void 0 ? void 0 : _c.collapsedPropName) !== null && _d !== void 0 ? _d : constants_1.Constants.treeDataProperties.COLLAPSED_PROP;
                break;
            case 'hasChildrenPropName':
                propName = (_f = (_e = this.treeDataOptions) === null || _e === void 0 ? void 0 : _e.hasChildrenPropName) !== null && _f !== void 0 ? _f : constants_1.Constants.treeDataProperties.HAS_CHILDREN_PROP;
                break;
            case 'identifierPropName':
                propName = (_k = (_h = (_g = this.treeDataOptions) === null || _g === void 0 ? void 0 : _g.identifierPropName) !== null && _h !== void 0 ? _h : (_j = this.gridOptions) === null || _j === void 0 ? void 0 : _j.datasetIdPropertyName) !== null && _k !== void 0 ? _k : 'id';
                break;
            case 'levelPropName':
                propName = (_m = (_l = this.treeDataOptions) === null || _l === void 0 ? void 0 : _l.levelPropName) !== null && _m !== void 0 ? _m : constants_1.Constants.treeDataProperties.TREE_LEVEL_PROP;
                break;
            case 'parentPropName':
                propName = (_p = (_o = this.treeDataOptions) === null || _o === void 0 ? void 0 : _o.parentPropName) !== null && _p !== void 0 ? _p : constants_1.Constants.treeDataProperties.PARENT_PROP;
                break;
        }
        return propName;
    }
    /** Clear the sorting and set it back to initial sort */
    clearSorting() {
        const initialSort = this.getInitialSort(this.sharedService.columnDefinitions, this.sharedService.gridOptions);
        this.sortService.loadGridSorters([{ columnId: initialSort.columnId, direction: initialSort.sortAsc ? 'ASC' : 'DESC' }]);
    }
    /**
     * Takes a flat dataset, converts it into a hierarchical dataset, sort it by recursion and finally return back the final and sorted flat array
     * @param {Array<Object>} flatDataset - parent/child flat dataset
     * @param {Object} gridOptions - grid options
     * @returns {Array<Object>} - tree dataset
     */
    convertFlatParentChildToTreeDatasetAndSort(flatDataset, columnDefinitions, gridOptions) {
        var _a;
        // 1- convert the flat array into a hierarchical array
        const datasetHierarchical = this.convertFlatParentChildToTreeDataset(flatDataset, gridOptions);
        // 2- sort the hierarchical array recursively by an optional "initialSort" OR if nothing is provided we'll sort by the column defined as the Tree column
        // also note that multi-column is not currently supported with Tree Data
        const columnSort = this.getInitialSort(columnDefinitions, gridOptions);
        const datasetSortResult = this.sortService.sortHierarchicalDataset(datasetHierarchical, [columnSort], true);
        // and finally add the sorting icon (this has to be done manually in SlickGrid) to the column we used for the sorting
        (_a = this._grid) === null || _a === void 0 ? void 0 : _a.setSortColumns([columnSort]);
        return datasetSortResult;
    }
    /**
     * Takes a flat dataset, converts it into a hierarchical dataset
     * @param {Array<Object>} flatDataset - parent/child flat dataset
     * @param {Object} gridOptions - grid options
     * @returns {Array<Object>} - tree dataset
     */
    convertFlatParentChildToTreeDataset(flatDataset, gridOptions) {
        var _a, _b, _c;
        const dataViewIdIdentifier = (_a = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.datasetIdPropertyName) !== null && _a !== void 0 ? _a : 'id';
        const treeDataOpt = (_b = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.treeDataOptions) !== null && _b !== void 0 ? _b : { columnId: 'id' };
        const treeDataOptions = {
            ...treeDataOpt,
            identifierPropName: (_c = treeDataOpt.identifierPropName) !== null && _c !== void 0 ? _c : dataViewIdIdentifier,
            initiallyCollapsed: this._isLastFullToggleCollapsed, // use the last full toggled flag so that if we replace the entire dataset we will still use the last toggled flag (this flag is also initialized with `initiallyCollapsed` when provided)
        };
        return (0, utilities_1.unflattenParentChildArrayToTree)(flatDataset, treeDataOptions);
    }
    /**
     * Dynamically enable (or disable) Tree Totals auto-recalc feature when Aggregators exists
     * @param {Boolean} [enableFeature=true]
     */
    enableAutoRecalcTotalsFeature(enableFeature = true) {
        if (enableFeature && this._isTreeDataEnabled) {
            this._treeDataRecalcHandler = this.recalculateTreeTotals.bind(this, this.gridOptions);
        }
        else {
            this._treeDataRecalcHandler = null;
        }
    }
    /**
     * Recalculate all Tree Data totals, this requires Aggregators to be defined.
     * NOTE: this does **not** take the current filters in consideration
     * @param gridOptions
     */
    recalculateTreeTotals(gridOptions) {
        var _a, _b;
        const treeDataOptions = gridOptions.treeDataOptions;
        const childrenPropName = ((_a = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.childrenPropName) !== null && _a !== void 0 ? _a : constants_1.Constants.treeDataProperties.CHILDREN_PROP);
        const levelPropName = (_b = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.levelPropName) !== null && _b !== void 0 ? _b : constants_1.Constants.treeDataProperties.TREE_LEVEL_PROP;
        if (treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.aggregators) {
            treeDataOptions.aggregators.forEach((aggregator) => {
                (0, utilities_1.addTreeLevelAndAggregatorsByMutation)(this.sharedService.hierarchicalDataset || [], { childrenPropName, levelPropName, aggregator });
            });
            this._grid.invalidate();
        }
    }
    /**
     * Takes a hierarchical (tree) input array and sort it (if an `initialSort` exist, it will use that to sort)
     * @param {Array<Object>} hierarchicalDataset - inpu
     * @returns {Object} sort result object that includes both the flat & tree data arrays
     */
    sortHierarchicalDataset(hierarchicalDataset, inputColumnSorts) {
        const columnSorts = inputColumnSorts !== null && inputColumnSorts !== void 0 ? inputColumnSorts : this.getInitialSort(this.sharedService.allColumns, this.gridOptions);
        const finalColumnSorts = Array.isArray(columnSorts) ? columnSorts : [columnSorts];
        return this.sortService.sortHierarchicalDataset(hierarchicalDataset, finalColumnSorts);
    }
    /**
     * Toggle the collapsed values of all parent items (the ones with children), we can optionally provide a flag to force a collapse or expand
     * @param {Boolean} collapsing - optionally force a collapse/expand (True => collapse all, False => expand all)
     * @param {Boolean} shouldTriggerEvent - defaults to true, should we trigger an event? For example, we could disable this to avoid a Grid State change event.
     * @returns {Promise<void>} - returns a void Promise, the reason we use a Promise is simply to make sure that when we add a spinner, it doesn't start/stop only at the end of the process
     */
    async toggleTreeDataCollapse(collapsing, shouldTriggerEvent = true) {
        var _a;
        if ((_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.enableTreeData) {
            const hasChildrenPropName = this.getTreeDataOptionPropName('hasChildrenPropName');
            // emit an event when full toggle starts (useful to show a spinner)
            if (shouldTriggerEvent) {
                await this.pubSubService.publish('onTreeFullToggleStart', { collapsing });
            }
            // do a bulk change data update to toggle all necessary parents (the ones with children) to the new collapsed flag value
            this.dataView.beginUpdate(true);
            // toggle the collapsed flag but only when it's a parent item with children
            (this.dataView.getItems() || []).forEach((item) => {
                if (item[hasChildrenPropName]) {
                    this.updateToggledItem(item, collapsing);
                }
            });
            this.dataView.endUpdate();
            this.dataView.refresh();
            this._isLastFullToggleCollapsed = collapsing;
        }
        const toggleType = collapsing ? index_1.ToggleStateChangeType.fullCollapse : index_1.ToggleStateChangeType.fullExpand;
        this._lastToggleStateChange = {
            type: toggleType,
            previousFullToggleType: toggleType,
            toggledItems: null
        };
        // emit an event when full toggle ends
        if (shouldTriggerEvent) {
            this.pubSubService.publish('onTreeFullToggleEnd', this._lastToggleStateChange);
        }
    }
    // --
    // protected functions
    // ------------------
    handleOnCellClick(event, args) {
        var _a;
        if (event && args) {
            const targetElm = event.target || {};
            const idPropName = (_a = this.gridOptions.datasetIdPropertyName) !== null && _a !== void 0 ? _a : 'id';
            const collapsedPropName = this.getTreeDataOptionPropName('collapsedPropName');
            const childrenPropName = this.getTreeDataOptionPropName('childrenPropName');
            if (typeof (targetElm === null || targetElm === void 0 ? void 0 : targetElm.className) === 'string') {
                const hasToggleClass = targetElm.className.indexOf('toggle') >= 0 || false;
                if (hasToggleClass) {
                    const item = this.dataView.getItem(args.row);
                    if (item) {
                        item[collapsedPropName] = !item[collapsedPropName]; // toggle the collapsed flag
                        const isCollapsed = item[collapsedPropName];
                        const itemId = item[idPropName];
                        const parentFoundIdx = this._currentToggledItems.findIndex(treeChange => treeChange.itemId === itemId);
                        if (parentFoundIdx >= 0) {
                            this._currentToggledItems[parentFoundIdx].isCollapsed = isCollapsed;
                        }
                        else {
                            this._currentToggledItems.push({ itemId, isCollapsed });
                        }
                        this.dataView.updateItem(itemId, item);
                        // since we always keep 2 arrays as reference (flat + hierarchical)
                        // we also need to update the hierarchical array with the new toggle flag
                        const searchTreePredicate = (treeItemToSearch) => treeItemToSearch[idPropName] === itemId;
                        const treeItemFound = (0, utilities_1.findItemInTreeStructure)(this.sharedService.hierarchicalDataset || [], searchTreePredicate, childrenPropName);
                        if (treeItemFound) {
                            treeItemFound[collapsedPropName] = isCollapsed;
                        }
                        // and finally we can invalidate the grid to re-render the UI
                        this._grid.invalidate();
                        this._lastToggleStateChange = {
                            type: isCollapsed ? index_1.ToggleStateChangeType.toggleCollapse : index_1.ToggleStateChangeType.toggleExpand,
                            previousFullToggleType: this._isLastFullToggleCollapsed ? 'full-collapse' : 'full-expand',
                            toggledItems: this._currentToggledItems
                        };
                        this.pubSubService.publish('onTreeItemToggled', { ...this._lastToggleStateChange, fromItemId: itemId });
                    }
                    event.stopImmediatePropagation();
                }
            }
        }
    }
    updateToggledItem(item, isCollapsed) {
        var _a, _b;
        const dataViewIdIdentifier = (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.datasetIdPropertyName) !== null && _b !== void 0 ? _b : 'id';
        const childrenPropName = this.getTreeDataOptionPropName('childrenPropName');
        const collapsedPropName = this.getTreeDataOptionPropName('collapsedPropName');
        if (item) {
            // update the flat dataset item
            item[collapsedPropName] = isCollapsed;
            this.dataView.updateItem(item[dataViewIdIdentifier], item);
            // also update the hierarchical tree item
            const searchTreePredicate = (treeItemToSearch) => treeItemToSearch[dataViewIdIdentifier] === item[dataViewIdIdentifier];
            const treeItemFound = (0, utilities_1.findItemInTreeStructure)(this.sharedService.hierarchicalDataset || [], searchTreePredicate, childrenPropName);
            if (treeItemFound) {
                treeItemFound[collapsedPropName] = isCollapsed;
            }
        }
    }
    /**
     * When using Tree Data with Aggregator and auto-recalc flag is enabled, we will define a callback handler
     * @return {Function | undefined} Tree Data totals recalculate callback when enabled
     */
    setAutoRecalcTotalsCallbackWhenFeatEnabled(gridOptions) {
        var _a, _b;
        // when using Tree Data with Aggregators, we might need to auto-recalc when necessary flag is enabled
        if ((gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.enableTreeData) && ((_a = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.treeDataOptions) === null || _a === void 0 ? void 0 : _a.autoRecalcTotalsOnFilterChange) && ((_b = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.treeDataOptions) === null || _b === void 0 ? void 0 : _b.aggregators)) {
            return this.recalculateTreeTotals.bind(this, gridOptions);
        }
        return null;
    }
}
exports.TreeDataService = TreeDataService;
//# sourceMappingURL=treeData.service.js.map