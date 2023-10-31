import { deepCopy } from '@slickgrid-universal/utils';
import { dequal } from 'dequal/lite';
import { FilterConditions, getParsedSearchTermsByFieldType } from './../filter-conditions/index';
import { EmitterType, FieldType, KeyCode, OperatorType, } from '../enums/index';
import { getSelectorStringFromElement, sanitizeHtmlToText, } from '../services/domUtilities';
import { findItemInTreeStructure, getDescendantProperty, mapOperatorByFieldType, } from './utilities';
import { Constants } from '../constants';
export class FilterService {
    constructor(filterFactory, pubSubService, sharedService, backendUtilities, rxjs) {
        this.filterFactory = filterFactory;
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this.backendUtilities = backendUtilities;
        this.rxjs = rxjs;
        this._isFilterFirstRender = true;
        this._firstColumnIdRendered = '';
        this._filtersMetadata = [];
        this._columnFilters = {};
        this._isTreePresetExecuted = false;
        this._previousFilters = [];
        this._onSearchChange = new Slick.Event();
        this._eventHandler = new Slick.EventHandler();
        if (this.rxjs) {
            this.httpCancelRequests$ = this.rxjs.createSubject();
        }
    }
    /** Getter of the SlickGrid Event Handler */
    get eventHandler() {
        return this._eventHandler;
    }
    /** Getter to know if the filter was already rendered or if it was its first time render */
    get isFilterFirstRender() {
        return this._isFilterFirstRender;
    }
    /** Getter of the SlickGrid Event Handler */
    get onSearchChange() {
        return this._onSearchChange;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get _gridOptions() {
        var _a, _b;
        return (_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions()) !== null && _b !== void 0 ? _b : {};
    }
    /** Getter for the Column Definitions pulled through the Grid Object */
    get _columnDefinitions() {
        var _a, _b;
        return (_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getColumns()) !== null && _b !== void 0 ? _b : [];
    }
    /** Getter of SlickGrid DataView object */
    get _dataView() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getData) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    addRxJsResource(rxjs) {
        this.rxjs = rxjs;
    }
    /**
     * Initialize the Service
     * @param grid
     */
    init(grid) {
        this._grid = grid;
        if (this._gridOptions && this._gridOptions.enableTreeData && this._gridOptions.treeDataOptions) {
            this._grid.setSortColumns([{ columnId: this._gridOptions.treeDataOptions.columnId, sortAsc: true }]);
        }
    }
    dispose() {
        var _a;
        // unsubscribe all SlickGrid events
        this._eventHandler.unsubscribeAll();
        if (this.httpCancelRequests$ && ((_a = this.rxjs) === null || _a === void 0 ? void 0 : _a.isObservable(this.httpCancelRequests$))) {
            this.httpCancelRequests$.next(); // this cancels any pending http requests
            this.httpCancelRequests$.complete();
        }
        this.disposeColumnFilters();
        this._onSearchChange = null;
    }
    /**
     * Dispose of the filters, since it's a singleton, we don't want to affect other grids with same columns
     */
    disposeColumnFilters() {
        this.removeAllColumnFiltersProperties();
        // also destroy each Filter instances
        if (Array.isArray(this._filtersMetadata)) {
            let filter = this._filtersMetadata.pop();
            while (filter) {
                if (typeof (filter === null || filter === void 0 ? void 0 : filter.destroy) === 'function') {
                    filter.destroy();
                }
                filter = this._filtersMetadata.pop();
            }
        }
    }
    /**
     * Bind a backend filter hook to the grid
     * @param grid SlickGrid Grid object
     */
    bindBackendOnFilter(grid) {
        this._filtersMetadata = [];
        // subscribe to SlickGrid onHeaderRowCellRendered event to create filter template
        this._eventHandler.subscribe(grid.onHeaderRowCellRendered, (_e, args) => {
            // firstColumnIdRendered is null at first, so if it changes to being filled and equal, then we would know that it was already rendered
            // this is to avoid rendering the filter twice (only the Select Filter for now), rendering it again also clears the filter which has unwanted side effect
            if (args.column.id === this._firstColumnIdRendered) {
                this._isFilterFirstRender = false;
            }
            this.addFilterTemplateToHeaderRow(args, this._isFilterFirstRender);
            if (this._firstColumnIdRendered === '') {
                this._firstColumnIdRendered = args.column.id;
            }
        });
        // destroy Filter(s) to avoid leak and not keep orphan filters in the DOM tree
        this.subscribeToOnHeaderRowCellRendered(grid);
        // subscribe to the SlickGrid event and call the backend execution
        if (this._onSearchChange) {
            this._eventHandler.subscribe(this._onSearchChange, this.onBackendFilterChange.bind(this));
        }
    }
    /**
     * Bind a local filter hook to the grid
     * @param grid SlickGrid Grid object
     * @param gridOptions Grid Options object
     * @param dataView
     */
    bindLocalOnFilter(grid) {
        this._filtersMetadata = [];
        this._dataView.setFilterArgs({ columnFilters: this._columnFilters, grid: this._grid, dataView: this._dataView });
        this._dataView.setFilter(this.customLocalFilter.bind(this));
        // bind any search filter change (e.g. input filter input change event)
        if (this._onSearchChange) {
            this._eventHandler.subscribe(this._onSearchChange, async (_e, args) => {
                var _a;
                const isClearFilterEvent = (_a = args === null || args === void 0 ? void 0 : args.clearFilterTriggered) !== null && _a !== void 0 ? _a : false;
                // emit an onBeforeFilterChange event except when it's called by a clear filter
                if (!isClearFilterEvent) {
                    await this.emitFilterChanged(EmitterType.local, true);
                }
                // When using Tree Data, we need to do it in 2 steps
                // step 1. we need to prefilter (search) the data prior, the result will be an array of IDs which are the node(s) and their parent nodes when necessary.
                // step 2. calling the DataView.refresh() is what triggers the final filtering, with "customLocalFilter()" which will decide which rows should persist
                if (this._gridOptions.enableTreeData === true) {
                    this._tmpPreFilteredData = this.preFilterTreeData(this._dataView.getItems(), this._columnFilters);
                }
                if (args.columnId !== null) {
                    this._dataView.refresh();
                }
                // emit an onFilterChanged event except when it's called by a clear filter
                if (!isClearFilterEvent) {
                    await this.emitFilterChanged(EmitterType.local);
                }
                // keep a copy of the filters in case we need to rollback
                this._previousFilters = this.extractBasicFilterDetails(this._columnFilters);
            });
        }
        // subscribe to SlickGrid onHeaderRowCellRendered event to create filter template
        this._eventHandler.subscribe(grid.onHeaderRowCellRendered, (_e, args) => {
            this.addFilterTemplateToHeaderRow(args);
        });
        // destroy Filter(s) to avoid leak and not keep orphan filters
        this.subscribeToOnHeaderRowCellRendered(grid);
    }
    async clearFilterByColumnId(event, columnId) {
        var _a;
        await this.pubSubService.publish('onBeforeFilterClear', { columnId }, 0);
        const isBackendApi = (_a = this._gridOptions.backendServiceApi) !== null && _a !== void 0 ? _a : false;
        const emitter = isBackendApi ? EmitterType.remote : EmitterType.local;
        // get current column filter before clearing, this allow us to know if the filter was empty prior to calling the clear filter
        const currentFilterColumnIds = Object.keys(this._columnFilters);
        let currentColFilter;
        if (Array.isArray(currentFilterColumnIds)) {
            currentColFilter = currentFilterColumnIds.find(name => name === `${columnId}`);
        }
        // find the filter object and call its clear method with true (the argument tells the method it was called by a clear filter)
        const colFilter = this._filtersMetadata.find((filter) => filter.columnDef.id === columnId);
        if (colFilter === null || colFilter === void 0 ? void 0 : colFilter.clear) {
            colFilter.clear(true);
        }
        // when using a backend service, we need to manually trigger a filter change but only if the filter was previously filled
        if (isBackendApi) {
            if (currentColFilter !== undefined) {
                this.onBackendFilterChange(event, { grid: this._grid, columnFilters: this._columnFilters });
            }
        }
        // emit an event when filter is cleared
        await this.emitFilterChanged(emitter);
        return true;
    }
    /** Clear the search filters (below the column titles) */
    async clearFilters(triggerChange = true) {
        var _a, _b, _c;
        // emit an event before the process start
        if (triggerChange) {
            await this.pubSubService.publish('onBeforeFilterClear', true, 0);
        }
        this._filtersMetadata.forEach((filter) => {
            if (filter === null || filter === void 0 ? void 0 : filter.clear) {
                // clear element but don't trigger individual clear change,
                // we'll do 1 trigger for all filters at once afterward
                filter.clear(false);
            }
        });
        // also delete the columnFilters object and remove any filters from the object
        this.removeAllColumnFiltersProperties();
        // also remove any search terms directly on each column definitions
        if (Array.isArray(this._columnDefinitions)) {
            this._columnDefinitions.forEach((columnDef) => {
                var _a;
                if ((_a = columnDef.filter) === null || _a === void 0 ? void 0 : _a.searchTerms) {
                    delete columnDef.filter.searchTerms;
                }
            });
        }
        // we also need to refresh the dataView and optionally the grid (it's optional since we use DataView)
        if (this._dataView && this._grid) {
            this._dataView.refresh();
            this._grid.invalidate();
        }
        // when using backend service, we need to query only once so it's better to do it here
        const backendApi = this._gridOptions.backendServiceApi;
        if (backendApi && triggerChange) {
            const callbackArgs = { clearFilterTriggered: true, shouldTriggerQuery: triggerChange, grid: this._grid, columnFilters: this._columnFilters };
            const queryResponse = backendApi.service.processOnFilterChanged(undefined, callbackArgs);
            const query = queryResponse;
            const totalItems = (_b = (_a = this._gridOptions.pagination) === null || _a === void 0 ? void 0 : _a.totalItems) !== null && _b !== void 0 ? _b : 0;
            (_c = this.backendUtilities) === null || _c === void 0 ? void 0 : _c.executeBackendCallback(backendApi, query, callbackArgs, new Date(), totalItems, {
                errorCallback: this.resetToPreviousSearchFilters.bind(this),
                successCallback: (responseArgs) => this._previousFilters = this.extractBasicFilterDetails(responseArgs.columnFilters),
                emitActionChangedCallback: this.emitFilterChanged.bind(this)
            });
        }
        else {
            // keep a copy of the filters in case we need to rollback
            this._previousFilters = this.extractBasicFilterDetails(this._columnFilters);
        }
        // emit an event when filters are all cleared
        if (triggerChange) {
            this.pubSubService.publish('onFilterCleared', true);
        }
    }
    /** Local Grid Filter search */
    customLocalFilter(item, args) {
        var _a, _b, _c, _d, _f, _g, _h;
        const grid = args === null || args === void 0 ? void 0 : args.grid;
        const columnFilters = (_a = args === null || args === void 0 ? void 0 : args.columnFilters) !== null && _a !== void 0 ? _a : {};
        const isGridWithTreeData = (_b = this._gridOptions.enableTreeData) !== null && _b !== void 0 ? _b : false;
        const treeDataOptions = this._gridOptions.treeDataOptions;
        // when the column is a Tree Data structure and the parent is collapsed, we won't go further and just continue with next row
        // so we always run this check even when there are no filter search, the reason is because the user might click on the expand/collapse
        if (isGridWithTreeData && treeDataOptions) {
            const collapsedPropName = (_c = treeDataOptions.collapsedPropName) !== null && _c !== void 0 ? _c : Constants.treeDataProperties.COLLAPSED_PROP;
            const parentPropName = (_d = treeDataOptions.parentPropName) !== null && _d !== void 0 ? _d : Constants.treeDataProperties.PARENT_PROP;
            const childrenPropName = (_f = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.childrenPropName) !== null && _f !== void 0 ? _f : Constants.treeDataProperties.CHILDREN_PROP;
            const primaryDataId = (_g = this._gridOptions.datasetIdPropertyName) !== null && _g !== void 0 ? _g : 'id';
            const autoRecalcTotalsOnFilterChange = (_h = treeDataOptions.autoRecalcTotalsOnFilterChange) !== null && _h !== void 0 ? _h : false;
            // typically when a parent is collapsed we can exit early (by returning false) but we can't do that when we use auto-recalc totals
            // if that happens, we need to keep a ref and recalculate total for all tree leafs then only after we can exit
            let isParentCollapsed = false; // will be used only when auto-recalc is enabled
            if (item[parentPropName] !== null) {
                let parent = this._dataView.getItemById(item[parentPropName]);
                while (parent) {
                    if (parent[collapsedPropName]) {
                        if (autoRecalcTotalsOnFilterChange) {
                            isParentCollapsed = true; // when auto-recalc tree totals is enabled, we need to keep ref without exiting the loop just yet
                        }
                        else {
                            // not using auto-recalc, we can exit early and not display any row that have their parent collapsed
                            return false;
                        }
                    }
                    parent = this._dataView.getItemById(parent[parentPropName]);
                }
            }
            // filter out any row items that aren't part of our pre-processed "preFilterTreeData()" result
            if (this._tmpPreFilteredData instanceof Set) {
                const filtered = this._tmpPreFilteredData.has(item[primaryDataId]); // return true when found, false otherwise
                // when user enables Tree Data auto-recalc, we need to keep ref (only in hierarchical tree) of which datacontext was filtered or not
                if (autoRecalcTotalsOnFilterChange) {
                    const treeItem = findItemInTreeStructure(this.sharedService.hierarchicalDataset, x => x[primaryDataId] === item[primaryDataId], childrenPropName);
                    if (treeItem) {
                        treeItem.__filteredOut = !filtered;
                    }
                    if (isParentCollapsed) {
                        return false; // now that we are done analyzing "__filteredOut", we can now return false to not show collapsed children
                    }
                }
                return filtered;
            }
        }
        else {
            if (typeof columnFilters === 'object') {
                for (const columnId of Object.keys(columnFilters)) {
                    const columnFilter = columnFilters[columnId];
                    const conditionOptions = this.preProcessFilterConditionOnDataContext(item, columnFilter, grid);
                    if (typeof conditionOptions === 'boolean') {
                        return conditionOptions;
                    }
                    let parsedSearchTerms = columnFilter === null || columnFilter === void 0 ? void 0 : columnFilter.parsedSearchTerms; // parsed term could be a single value or an array of values
                    // in the rare case that it's empty (it can happen when creating an external grid global search)
                    // then get the parsed terms, once it's filled it typically won't ask for it anymore
                    if (parsedSearchTerms === undefined) {
                        parsedSearchTerms = getParsedSearchTermsByFieldType(columnFilter.searchTerms, columnFilter.columnDef.type || FieldType.string); // parsed term could be a single value or an array of values
                        if (parsedSearchTerms !== undefined) {
                            columnFilter.parsedSearchTerms = parsedSearchTerms;
                        }
                    }
                    // execute the filtering conditions check (all cell values vs search term(s))
                    if (!FilterConditions.executeFilterConditionTest(conditionOptions, parsedSearchTerms)) {
                        return false;
                    }
                }
            }
        }
        // if it reaches here, that means the row is valid and passed all filter
        return true;
    }
    /**
     * Loop through each form input search filter and parse their searchTerms,
     * for example a CompoundDate Filter will be parsed as a Moment object.
     * Also if we are dealing with a text filter input,
     * an operator can optionally be part of the filter itself and we need to extract it from there,
     * for example a filter of "John*" will be analyzed as { operator: StartsWith, searchTerms: ['John'] }
     * @param inputSearchTerms - filter search terms
     * @param columnFilter - column filter object (the object properties represent each column id and the value is the filter metadata)
     * @returns FilterConditionOption
     */
    parseFormInputFilterConditions(inputSearchTerms, columnFilter) {
        var _a, _b, _c, _d;
        const searchValues = deepCopy(inputSearchTerms) || [];
        let fieldSearchValue = (Array.isArray(searchValues) && searchValues.length === 1) ? searchValues[0] : '';
        const columnDef = columnFilter.columnDef;
        const fieldType = (_c = (_b = (_a = columnDef.filter) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : columnDef.type) !== null && _c !== void 0 ? _c : FieldType.string;
        let matches = null;
        if (fieldType !== FieldType.object) {
            fieldSearchValue = (fieldSearchValue === undefined || fieldSearchValue === null) ? '' : `${fieldSearchValue}`; // make sure it's a string
            // run regex to find possible filter operators unless the user disabled the feature
            const autoParseInputFilterOperator = (_d = columnDef.autoParseInputFilterOperator) !== null && _d !== void 0 ? _d : this._gridOptions.autoParseInputFilterOperator;
            matches = autoParseInputFilterOperator !== false
                ? fieldSearchValue.match(/^([<>!=\*]{0,2})(.*[^<>!=\*])?([\*]?)$/) // group 1: Operator, 2: searchValue, 3: last char is '*' (meaning starts with, ex.: abc*)
                : [fieldSearchValue, '', fieldSearchValue, '']; // when parsing is disabled, we'll only keep the search value in the index 2 to make it easy for code reuse
        }
        let operator = (matches === null || matches === void 0 ? void 0 : matches[1]) || columnFilter.operator;
        const searchTerm = (matches === null || matches === void 0 ? void 0 : matches[2]) || '';
        const inputLastChar = (matches === null || matches === void 0 ? void 0 : matches[3]) || (operator === '*z' ? '*' : '');
        if (typeof fieldSearchValue === 'string') {
            fieldSearchValue = fieldSearchValue.replace(`'`, `''`); // escape any single quotes by doubling them
            if (operator === '*' || operator === '*z') {
                operator = OperatorType.endsWith;
            }
            else if (operator === 'a*' || inputLastChar === '*') {
                operator = OperatorType.startsWith;
            }
        }
        // if search value has a regex match we will only keep the value without the operator
        // in this case we need to overwrite the returned search values to truncate operator from the string search
        if (Array.isArray(matches) && matches.length >= 1 && (Array.isArray(searchValues) && searchValues.length === 1)) {
            searchValues[0] = searchTerm;
        }
        return {
            dataKey: columnDef.dataKey,
            fieldType,
            searchTerms: searchValues || [],
            operator: operator,
            searchInputLastChar: inputLastChar,
            filterSearchType: columnDef.filterSearchType,
            defaultFilterRangeOperator: this._gridOptions.defaultFilterRangeOperator,
        };
    }
    /**
     * PreProcess the filter(s) condition(s) on each item data context, the result might be a boolean or FilterConditionOption object.
     * It will be a boolean when the searchTerms are invalid or the column is not found (it so it will return True and the item won't be filtered out from the grid)
     * or else a FilterConditionOption object with the necessary info for the test condition needs to be processed in a further stage.
     * @param item - item data context
     * @param columnFilter - column filter object (the object properties represent each column id and the value is the filter metadata)
     * @param grid - SlickGrid object
     * @returns FilterConditionOption or boolean
     */
    preProcessFilterConditionOnDataContext(item, columnFilter, grid) {
        var _a, _b, _c, _d, _f, _g;
        const columnDef = columnFilter.columnDef;
        const columnId = columnFilter.columnId;
        let columnIndex = grid.getColumnIndex(columnId);
        // it might be a hidden column, if so it won't be part of the getColumns (because it could be hidden via setColumns())
        // when that happens we can try to get the column definition from all defined columns
        if (!columnDef && this.sharedService && Array.isArray(this.sharedService.allColumns)) {
            columnIndex = this.sharedService.allColumns.findIndex(col => col.field === columnId);
        }
        // if we still don't have a column definition then we should return then row anyway (true)
        if (!columnDef) {
            return true;
        }
        // Row Detail View plugin, if the row is padding we just get the value we're filtering on from it's parent
        if (this._gridOptions.enableRowDetailView) {
            const metadataPrefix = this._gridOptions.rowDetailView && this._gridOptions.rowDetailView.keyPrefix || '__';
            if (item[`${metadataPrefix}isPadding`] && item[`${metadataPrefix}parent`]) {
                item = item[`${metadataPrefix}parent`];
            }
        }
        let queryFieldName = ((_a = columnDef.filter) === null || _a === void 0 ? void 0 : _a.queryField) || columnDef.queryFieldFilter || columnDef.queryField || columnDef.field || '';
        if (typeof columnDef.queryFieldNameGetterFn === 'function') {
            queryFieldName = columnDef.queryFieldNameGetterFn(item);
        }
        const fieldType = (_d = (_c = (_b = columnDef.filter) === null || _b === void 0 ? void 0 : _b.type) !== null && _c !== void 0 ? _c : columnDef.type) !== null && _d !== void 0 ? _d : FieldType.string;
        let cellValue = item[queryFieldName];
        // when item is a complex object (dot "." notation), we need to filter the value contained in the object tree
        if ((queryFieldName === null || queryFieldName === void 0 ? void 0 : queryFieldName.indexOf('.')) >= 0) {
            cellValue = getDescendantProperty(item, queryFieldName);
        }
        const operator = columnFilter.operator;
        const searchValues = columnFilter.searchTerms || [];
        // no need to query if search value is empty or if the search value is in fact equal to the operator
        if (!searchValues || (Array.isArray(searchValues) && (searchValues.length === 0 || searchValues.length === 1 && operator === searchValues[0]))) {
            return true;
        }
        // filter search terms should always be string type (even though we permit the end user to input numbers)
        // so make sure each term are strings, if user has some default search terms, we will cast them to string
        if (searchValues && Array.isArray(searchValues) && fieldType !== FieldType.object) {
            for (let k = 0, ln = searchValues.length; k < ln; k++) {
                // make sure all search terms are strings
                searchValues[k] = ((searchValues[k] === undefined || searchValues[k] === null) ? '' : searchValues[k]) + '';
            }
        }
        // when using localization (i18n), we should use the formatter output to search as the new cell value
        if (((_f = columnDef === null || columnDef === void 0 ? void 0 : columnDef.params) === null || _f === void 0 ? void 0 : _f.useFormatterOuputToFilter) === true) {
            const dataView = grid.getData();
            const primaryDataId = this._gridOptions.datasetIdPropertyName || 'id';
            const rowIndex = (dataView && typeof dataView.getIdxById === 'function') ? dataView.getIdxById(item[primaryDataId]) : 0;
            const formattedCellValue = (columnDef && typeof columnDef.formatter === 'function') ? columnDef.formatter(rowIndex || 0, columnIndex, cellValue, columnDef, item, this._grid) : '';
            cellValue = sanitizeHtmlToText(formattedCellValue);
        }
        // make sure cell value is always a string
        if (typeof cellValue === 'number') {
            cellValue = cellValue.toString();
        }
        return {
            dataKey: columnDef.dataKey,
            fieldType,
            searchTerms: searchValues,
            cellValue,
            operator: operator,
            searchInputLastChar: columnFilter.searchInputLastChar,
            filterSearchType: columnDef.filterSearchType,
            ignoreAccentOnStringFilterAndSort: (_g = this._gridOptions.ignoreAccentOnStringFilterAndSort) !== null && _g !== void 0 ? _g : false,
            defaultFilterRangeOperator: this._gridOptions.defaultFilterRangeOperator,
        };
    }
    /**
     * When using Tree Data, we need to prefilter (search) the data prior, the result will be an array of IDs which are the node(s) and their parent nodes when necessary.
     * This will then be passed to the DataView setFilter(customLocalFilter), which will itself loop through the list of IDs and display/hide the row when found.
     * We do this in 2 steps so that we can still use the DataSet setFilter()
     */
    preFilterTreeData(inputItems, columnFilters) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const treeDataOptions = this._gridOptions.treeDataOptions;
        const collapsedPropName = (_a = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.collapsedPropName) !== null && _a !== void 0 ? _a : Constants.treeDataProperties.COLLAPSED_PROP;
        const parentPropName = (_b = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.parentPropName) !== null && _b !== void 0 ? _b : Constants.treeDataProperties.PARENT_PROP;
        const hasChildrenPropName = (_c = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.hasChildrenPropName) !== null && _c !== void 0 ? _c : Constants.treeDataProperties.HAS_CHILDREN_PROP;
        const primaryDataId = (_d = this._gridOptions.datasetIdPropertyName) !== null && _d !== void 0 ? _d : 'id';
        const treeDataToggledItems = (_g = (_f = this._gridOptions.presets) === null || _f === void 0 ? void 0 : _f.treeData) === null || _g === void 0 ? void 0 : _g.toggledItems;
        const isInitiallyCollapsed = (_j = (_h = this._gridOptions.treeDataOptions) === null || _h === void 0 ? void 0 : _h.initiallyCollapsed) !== null && _j !== void 0 ? _j : false;
        const treeDataColumnId = (_k = this._gridOptions.treeDataOptions) === null || _k === void 0 ? void 0 : _k.columnId;
        const excludeChildrenWhenFilteringTree = (_l = this._gridOptions.treeDataOptions) === null || _l === void 0 ? void 0 : _l.excludeChildrenWhenFilteringTree;
        const isNotExcludingChildAndValidateOnlyTreeColumn = !excludeChildrenWhenFilteringTree && ((_m = this._gridOptions.treeDataOptions) === null || _m === void 0 ? void 0 : _m.autoApproveParentItemWhenTreeColumnIsValid) === true;
        const treeObj = {};
        const filteredChildrenAndParents = new Set(); // use Set instead of simple array to avoid duplicates
        // a Map of unique itemId/value pair where the value is a boolean which tells us if the parent matches the filter criteria or not
        // we will use this when the Tree Data option `excludeChildrenWhenFilteringTree` is enabled
        const filteredParents = new Map();
        if (Array.isArray(inputItems)) {
            for (const inputItem of inputItems) {
                treeObj[inputItem[primaryDataId]] = inputItem;
                // as the filtered data is then used again as each subsequent letter
                // we need to delete the .__used property, otherwise the logic below
                // in the while loop (which checks for parents) doesn't work
                delete treeObj[inputItem[primaryDataId]].__used;
            }
            // Step 1. prepare search filter by getting their parsed value(s), for example if it's a date filter then parse it to a Moment object
            // loop through all column filters once and get parsed filter search value then save a reference in the columnFilter itself
            // it is much more effective to do it outside and prior to Step 2 so that we don't re-parse search filter for no reason while checking every row
            for (const columnId of Object.keys(columnFilters)) {
                const columnFilter = columnFilters[columnId];
                const searchValues = (columnFilter === null || columnFilter === void 0 ? void 0 : columnFilter.searchTerms) ? deepCopy(columnFilter.searchTerms) : [];
                const inputSearchConditions = this.parseFormInputFilterConditions(searchValues, columnFilter);
                const columnDef = columnFilter.columnDef;
                const fieldType = (_q = (_p = (_o = columnDef === null || columnDef === void 0 ? void 0 : columnDef.filter) === null || _o === void 0 ? void 0 : _o.type) !== null && _p !== void 0 ? _p : columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) !== null && _q !== void 0 ? _q : FieldType.string;
                const parsedSearchTerms = getParsedSearchTermsByFieldType(inputSearchConditions.searchTerms, fieldType); // parsed term could be a single value or an array of values
                if (parsedSearchTerms !== undefined) {
                    columnFilter.parsedSearchTerms = parsedSearchTerms;
                }
            }
            // Step 2. loop through every item data context to execute filter condition check
            for (const item of inputItems) {
                const hasChildren = item[hasChildrenPropName];
                let matchFilter = true; // valid until proven otherwise
                // loop through all column filters and execute filter condition(s)
                for (const columnId of Object.keys(columnFilters)) {
                    const columnFilter = columnFilters[columnId];
                    const conditionOptionResult = this.preProcessFilterConditionOnDataContext(item, columnFilter, this._grid);
                    if (conditionOptionResult) {
                        const parsedSearchTerms = columnFilter === null || columnFilter === void 0 ? void 0 : columnFilter.parsedSearchTerms; // parsed term could be a single value or an array of values
                        const conditionResult = (typeof conditionOptionResult === 'boolean') ? conditionOptionResult : FilterConditions.executeFilterConditionTest(conditionOptionResult, parsedSearchTerms);
                        // when using `excludeChildrenWhenFilteringTree: false`, we can auto-approve current item if it's the column holding the Tree structure and is a Parent that passes the first filter criteria
                        // in other words, if we're on the column with the Tree and its filter is valid (and is a parent), then skip any other filter(s)
                        if (conditionResult && isNotExcludingChildAndValidateOnlyTreeColumn && hasChildren && columnFilter.columnId === treeDataColumnId) {
                            filteredParents.set(item[primaryDataId], true);
                            break;
                        }
                        // if item is valid OR we aren't excluding children and its parent is valid then we'll consider this valid
                        // however we don't return true, we need to continue and loop through next filter(s) since we still need to check other keys in columnFilters
                        if (conditionResult || (!excludeChildrenWhenFilteringTree && (filteredParents.get(item[parentPropName]) === true))) {
                            if (hasChildren && columnFilter.columnId === treeDataColumnId) {
                                filteredParents.set(item[primaryDataId], true); // when it's a Parent item, we'll keep a Map ref as being a Parent with valid criteria
                            }
                            // if our filter is valid OR we're on the Tree column then let's continue
                            if (conditionResult || (!excludeChildrenWhenFilteringTree && columnFilter.columnId === treeDataColumnId)) {
                                continue;
                            }
                        }
                        else {
                            // when it's a Parent item AND its Parent isn't valid AND we aren't on the Tree column
                            // we'll keep reference of the parent via a Map key/value pair and make its value as False because this Parent item is considered invalid
                            if (hasChildren && filteredParents.get(item[parentPropName]) !== true && columnFilter.columnId !== treeDataColumnId) {
                                filteredParents.set(item[primaryDataId], false);
                            }
                        }
                    }
                    // if we reach this line then our filter is invalid
                    matchFilter = false;
                    continue;
                }
                // build an array from the matched filters, anything valid from filter condition
                // will be pushed to the filteredChildrenAndParents array
                if (matchFilter) {
                    // add child (id):
                    filteredChildrenAndParents.add(item[primaryDataId]);
                    let parent = (_r = treeObj[item[parentPropName]]) !== null && _r !== void 0 ? _r : false;
                    // if there are any presets of collapsed parents, let's processed them
                    const presetToggleShouldBeCollapsed = !isInitiallyCollapsed;
                    if (!this._isTreePresetExecuted && Array.isArray(treeDataToggledItems) && treeDataToggledItems.some(collapsedItem => collapsedItem.itemId === parent.id && collapsedItem.isCollapsed === presetToggleShouldBeCollapsed)) {
                        parent[collapsedPropName] = presetToggleShouldBeCollapsed;
                    }
                    while (parent) {
                        // only add parent (id) if not already added:
                        (_s = parent.__used) !== null && _s !== void 0 ? _s : filteredChildrenAndParents.add(parent[primaryDataId]);
                        // mark each parent as used to not use them again later:
                        treeObj[parent[primaryDataId]].__used = true;
                        // try to find parent of the current parent, if exists:
                        parent = (_t = treeObj[parent[parentPropName]]) !== null && _t !== void 0 ? _t : false;
                    }
                }
            }
        }
        this._isTreePresetExecuted = true;
        return filteredChildrenAndParents;
    }
    getColumnFilters() {
        return this._columnFilters;
    }
    getPreviousFilters() {
        return this._previousFilters;
    }
    getFiltersMetadata() {
        return this._filtersMetadata;
    }
    getCurrentLocalFilters() {
        var _a, _b;
        const currentFilters = [];
        if (this._columnFilters) {
            for (const colId of Object.keys(this._columnFilters)) {
                const columnFilter = this._columnFilters[colId];
                const filter = { columnId: colId || '' };
                const columnDef = this.sharedService.allColumns.find(col => col.id === filter.columnId);
                const emptySearchTermReturnAllValues = (_b = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.filter) === null || _a === void 0 ? void 0 : _a.emptySearchTermReturnAllValues) !== null && _b !== void 0 ? _b : true;
                if (columnFilter === null || columnFilter === void 0 ? void 0 : columnFilter.searchTerms) {
                    filter.searchTerms = columnFilter.searchTerms;
                }
                if (columnFilter.operator) {
                    filter.operator = columnFilter.operator;
                }
                if (columnFilter.targetSelector) {
                    filter.targetSelector = columnFilter.targetSelector;
                }
                if (Array.isArray(filter.searchTerms) && filter.searchTerms.length > 0 && (!emptySearchTermReturnAllValues || filter.searchTerms[0] !== '')) {
                    currentFilters.push(filter);
                }
            }
        }
        return currentFilters;
    }
    /**
     * A simple function that will be called to emit a change when a filter changes.
     * Other services, like Pagination, can then subscribe to it.
     * @param caller
     */
    emitFilterChanged(caller, isBeforeExecution = false) {
        const eventName = isBeforeExecution ? 'onBeforeFilterChange' : 'onFilterChanged';
        if (caller === EmitterType.remote && this._gridOptions.backendServiceApi) {
            let currentFilters = [];
            const backendService = this._gridOptions.backendServiceApi.service;
            if (backendService === null || backendService === void 0 ? void 0 : backendService.getCurrentFilters) {
                currentFilters = backendService.getCurrentFilters();
            }
            return this.pubSubService.publish(eventName, currentFilters);
        }
        else if (caller === EmitterType.local) {
            return this.pubSubService.publish(eventName, this.getCurrentLocalFilters());
        }
    }
    async onBackendFilterChange(event, args) {
        var _a, _b, _c;
        const isTriggeringQueryEvent = args === null || args === void 0 ? void 0 : args.shouldTriggerQuery;
        if (isTriggeringQueryEvent) {
            await this.emitFilterChanged(EmitterType.remote, true);
        }
        if (!args || !args.grid) {
            throw new Error('Something went wrong when trying to bind the "onBackendFilterChange(event, args)" function, it seems that "args" is not populated correctly');
        }
        const backendApi = this._gridOptions.backendServiceApi;
        if (!backendApi || !backendApi.process || !backendApi.service) {
            throw new Error(`BackendServiceApi requires at least a "process" function and a "service" defined`);
        }
        // keep start time & end timestamps & return it after process execution
        const startTime = new Date();
        // run a preProcess callback if defined
        if (backendApi.preProcess) {
            backendApi.preProcess();
        }
        // query backend, except when it's called by a ClearFilters then we won't
        if (isTriggeringQueryEvent) {
            const query = await backendApi.service.processOnFilterChanged(event, args);
            const totalItems = (_b = (_a = this._gridOptions.pagination) === null || _a === void 0 ? void 0 : _a.totalItems) !== null && _b !== void 0 ? _b : 0;
            (_c = this.backendUtilities) === null || _c === void 0 ? void 0 : _c.executeBackendCallback(backendApi, query, args, startTime, totalItems, {
                errorCallback: this.resetToPreviousSearchFilters.bind(this),
                successCallback: (responseArgs) => this._previousFilters = this.extractBasicFilterDetails(responseArgs.columnFilters),
                emitActionChangedCallback: this.emitFilterChanged.bind(this),
                httpCancelRequestSubject: this.httpCancelRequests$
            });
        }
    }
    /**
     * When user passes an array of preset filters, we need to pre-populate each column filter searchTerm(s)
     * The process is to loop through the preset filters array, find the associated column from columnDefinitions and fill in the filter object searchTerm(s)
     * This is basically the same as if we would manually add searchTerm(s) to a column filter object in the column definition, but we do it programmatically.
     * At the end of the day, when creating the Filter (DOM Element), it will use these searchTerm(s) so we can take advantage of that without recoding each Filter type (DOM element)
     * @param grid
     */
    populateColumnFilterSearchTermPresets(filters) {
        if (Array.isArray(filters)) {
            this._columnDefinitions.forEach((columnDef) => {
                var _a;
                // clear any columnDef searchTerms before applying Presets
                if ((_a = columnDef.filter) === null || _a === void 0 ? void 0 : _a.searchTerms) {
                    delete columnDef.filter.searchTerms;
                }
                // from each presets, we will find the associated columnDef and apply the preset searchTerms & operator if there is
                const columnPreset = filters.find((presetFilter) => presetFilter.columnId === columnDef.id);
                if (columnPreset && Array.isArray(columnPreset === null || columnPreset === void 0 ? void 0 : columnPreset.searchTerms)) {
                    columnDef.filter = columnDef.filter || {};
                    columnDef.filter.operator = columnPreset.operator || columnDef.filter.operator || '';
                    columnDef.filter.searchTerms = columnPreset.searchTerms;
                }
            });
            // when we have a Filter Presets on a Tree Data View grid, we need to call the pre-filtering of tree data
            if (this._gridOptions.enableTreeData) {
                this.refreshTreeDataFilters();
            }
            // keep reference of the filters
            this._previousFilters = this.extractBasicFilterDetails(this._columnFilters);
        }
        return this._columnDefinitions;
    }
    /**
     * when we have a Filter Presets on a Tree Data View grid, we need to call the pre-filtering of tree data
     * we need to do this because Tree Data is the only type of grid that requires a pre-filter (preFilterTreeData) to be executed before the final filtering
     * @param {Array<Object>} [items] - optional flat array of parent/child items to use while redoing the full sort & refresh
     */
    refreshTreeDataFilters(items) {
        var _a, _b, _c;
        const inputItems = (_c = items !== null && items !== void 0 ? items : (_b = (_a = this._dataView) === null || _a === void 0 ? void 0 : _a.getItems) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : [];
        if (this._dataView && this._gridOptions.enableTreeData && inputItems.length > 0) {
            this._tmpPreFilteredData = this.preFilterTreeData(inputItems, this._columnFilters);
            this._dataView.refresh(); // and finally this refresh() is what triggers a DataView filtering check
        }
        else if (inputItems.length === 0 && Array.isArray(this.sharedService.hierarchicalDataset) && this.sharedService.hierarchicalDataset.length > 0) {
            // in some occasion, we might be dealing with a dataset that is hierarchical from the start (the source dataset is already a tree structure)
            // and we did not have time to convert it to a flat dataset yet (for SlickGrid to use),
            // we would end up calling the pre-filter too early because these pre-filter works only a flat dataset
            // for that use case (like Example 6), we need to delay for at least a cycle the pre-filtering (so we can simply recall the same method after a delay of 0 which equal to 1 CPU cycle)
            setTimeout(() => this.refreshTreeDataFilters());
        }
    }
    /**
     * Toggle the Filter Functionality
     * @param {boolean} isFilterDisabled - optionally force a disable/enable of the Sort Functionality? Defaults to True
     * @param {boolean} clearFiltersWhenDisabled - when disabling the Filter, do we also want to clear all the filters as well? Defaults to True
     */
    disableFilterFunctionality(isFilterDisabled = true, clearFiltersWhenDisabled = true) {
        const prevShowFilterFlag = this._gridOptions.enableFiltering;
        const newShowFilterFlag = !prevShowFilterFlag;
        if (newShowFilterFlag !== isFilterDisabled) {
            if (clearFiltersWhenDisabled && isFilterDisabled) {
                this.clearFilters();
            }
            this.disableAllFilteringCommands(isFilterDisabled);
            this._grid.setOptions({ enableFiltering: newShowFilterFlag }, false, true);
            this._grid.setHeaderRowVisibility(newShowFilterFlag);
            this._gridOptions.enableFiltering = !isFilterDisabled;
            this.sharedService.gridOptions = this._gridOptions;
            // when displaying header row, we'll call "setColumns" which in terms will recreate the header row filters
            this._grid.setColumns(this.sharedService.columnDefinitions);
        }
    }
    /**
     * Reset (revert) to previous filters, it could be because you prevented `onBeforeSearchChange` OR a Backend Error was thrown.
     * It will reapply the previous filter state in the UI.
     */
    resetToPreviousSearchFilters() {
        this.updateFilters(this._previousFilters, false, false, false);
    }
    /**
     * Toggle the Filter Functionality (show/hide the header row filter bar as well)
     * @param {boolean} clearFiltersWhenDisabled - when disabling the filters, do we want to clear the filters before hiding the filters? Defaults to True
     */
    toggleFilterFunctionality(clearFiltersWhenDisabled = true) {
        const prevShowFilterFlag = this._gridOptions.enableFiltering;
        this.disableFilterFunctionality(prevShowFilterFlag, clearFiltersWhenDisabled);
    }
    /**
     * Toggle the Header Row filter bar (this does not disable the Filtering itself, you can use "toggleFilterFunctionality()" instead, however this will reset any column positions)
     */
    toggleHeaderFilterRow() {
        var _a;
        let showHeaderRow = (_a = this._gridOptions.showHeaderRow) !== null && _a !== void 0 ? _a : false;
        showHeaderRow = !showHeaderRow; // inverse show header flag
        this._grid.setHeaderRowVisibility(showHeaderRow);
        // when displaying header row, we'll call "setColumns" which in terms will recreate the header row filters
        if (showHeaderRow === true) {
            this._grid.setColumns(this.sharedService.columnDefinitions);
        }
    }
    /**
     * Set the sort icons in the UI (ONLY the icons, it does not do any sorting)
     * The column sort icons are not necessarily inter-connected to the sorting functionality itself,
     * you can change the sorting icons separately by passing an array of columnId/sortAsc and that will change ONLY the icons
     * @param sortColumns
     */
    setSortColumnIcons(sortColumns) {
        if (this._grid && Array.isArray(sortColumns)) {
            this._grid.setSortColumns(sortColumns);
        }
    }
    /**
     * Update Filters dynamically just by providing an array of filter(s).
     * You can also choose emit (default) a Filter Changed event that will be picked by the Grid State Service.
     *
     * Also for backend service only, you can choose to trigger a backend query (default) or not if you wish to do it later,
     * this could be useful when using updateFilters & updateSorting and you wish to only send the backend query once.
     * @param filters array
     * @param triggerEvent defaults to True, do we want to emit a filter changed event?
     * @param triggerBackendQuery defaults to True, which will query the backend.
     * @param triggerOnSearchChangeEvent defaults to False, can be useful with Tree Data structure where the onSearchEvent has to run to execute a prefiltering step
     */
    async updateFilters(filters, emitChangedEvent = true, triggerBackendQuery = true, triggerOnSearchChangeEvent = false) {
        var _a;
        if (!this._filtersMetadata || this._filtersMetadata.length === 0 || !this._gridOptions || !this._gridOptions.enableFiltering) {
            throw new Error('[Slickgrid-Universal] in order to use "updateFilters" method, you need to have Filterable Columns defined in your grid and "enableFiltering" set in your Grid Options');
        }
        if (Array.isArray(filters)) {
            // start by clearing all filters (without triggering an event) before applying any new filters
            this.clearFilters(false);
            // pre-fill (value + operator) and render all filters in the DOM
            // loop through each Filters provided (which has a columnId property)
            // then find their associated Filter instances that were originally created in the grid
            filters.forEach((newFilter) => {
                const uiFilter = this._filtersMetadata.find((filter) => newFilter.columnId === filter.columnDef.id);
                if (newFilter && uiFilter) {
                    const newOperator = newFilter.operator || uiFilter.defaultOperator;
                    this.updateColumnFilters(newFilter.searchTerms, uiFilter.columnDef, newOperator);
                    uiFilter.setValues(newFilter.searchTerms || [], newOperator);
                    if (triggerOnSearchChangeEvent || this._gridOptions.enableTreeData) {
                        this.callbackSearchEvent(undefined, { columnDef: uiFilter.columnDef, operator: newOperator, searchTerms: newFilter.searchTerms, shouldTriggerQuery: true, forceOnSearchChangeEvent: true });
                    }
                }
            });
            const backendApi = this._gridOptions.backendServiceApi;
            const emitterType = backendApi ? EmitterType.remote : EmitterType.local;
            // trigger the onBeforeFilterChange event before the process
            if (emitChangedEvent) {
                await this.emitFilterChanged(emitterType, true);
            }
            // refresh the DataView and trigger an event after all filters were updated and rendered
            this._dataView.refresh();
            if (backendApi) {
                const backendApiService = backendApi === null || backendApi === void 0 ? void 0 : backendApi.service;
                if (backendApiService === null || backendApiService === void 0 ? void 0 : backendApiService.updateFilters) {
                    backendApiService.updateFilters(filters, true);
                    if (triggerBackendQuery) {
                        (_a = this.backendUtilities) === null || _a === void 0 ? void 0 : _a.refreshBackendDataset(this._gridOptions);
                    }
                }
            }
            if (emitChangedEvent) {
                await this.emitFilterChanged(emitterType);
            }
        }
        return true;
    }
    /**
     * **NOTE**: This should only ever be used when having a global external search and hidding the grid inline filters (with `enableFiltering: true` and `showHeaderRow: false`).
     * For inline filters, please use `updateFilters()` instead.
     *
     * Update a Single Filter dynamically just by providing (columnId, operator and searchTerms)
     * You can also choose emit (default) a Filter Changed event that will be picked by the Grid State Service.
     * Also for backend service only, you can choose to trigger a backend query (default) or not if you wish to do it later,
     * this could be useful when using updateFilters & updateSorting and you wish to only send the backend query once.
     * @param filters array
     * @param triggerEvent defaults to True, do we want to emit a filter changed event?
     * @param triggerBackendQuery defaults to True, which will query the backend.
     */
    async updateSingleFilter(filter, emitChangedEvent = true, triggerBackendQuery = true) {
        var _a, _b, _c, _d;
        const columnDef = this.sharedService.allColumns.find(col => col.id === filter.columnId);
        if (columnDef && filter.columnId) {
            this._columnFilters = {};
            const emptySearchTermReturnAllValues = (_b = (_a = columnDef.filter) === null || _a === void 0 ? void 0 : _a.emptySearchTermReturnAllValues) !== null && _b !== void 0 ? _b : true;
            if (Array.isArray(filter.searchTerms) && (filter.searchTerms.length > 1 || (filter.searchTerms.length === 1 && (!emptySearchTermReturnAllValues || filter.searchTerms[0] !== '')))) {
                // pass a columnFilter object as an object which it's property name must be a column field name (e.g.: 'duration': {...} )
                this._columnFilters[filter.columnId] = {
                    columnId: filter.columnId,
                    operator: filter.operator,
                    searchTerms: filter.searchTerms,
                    columnDef,
                    type: (_c = columnDef.type) !== null && _c !== void 0 ? _c : FieldType.string,
                };
            }
            const backendApi = this._gridOptions.backendServiceApi;
            const emitterType = backendApi ? EmitterType.remote : EmitterType.local;
            // trigger the onBeforeFilterChange event before the process
            if (emitChangedEvent) {
                await this.emitFilterChanged(emitterType, true);
            }
            if (backendApi) {
                const backendApiService = backendApi === null || backendApi === void 0 ? void 0 : backendApi.service;
                if (backendApiService === null || backendApiService === void 0 ? void 0 : backendApiService.updateFilters) {
                    backendApiService.updateFilters(this._columnFilters, true);
                    if (triggerBackendQuery) {
                        (_d = this.backendUtilities) === null || _d === void 0 ? void 0 : _d.refreshBackendDataset(this._gridOptions);
                    }
                }
            }
            else {
                this._dataView.setFilterArgs({
                    columnFilters: this._columnFilters,
                    grid: this._grid
                });
                // when using Tree Data, we also need to refresh the filters because of the tree structure with recursion
                if (this._gridOptions.enableTreeData) {
                    this.refreshTreeDataFilters();
                }
                this._dataView.refresh();
            }
            if (emitChangedEvent) {
                await this.emitFilterChanged(emitterType);
            }
        }
        return true;
    }
    /**
     * Draw DOM Element Filter on custom HTML element
     * @param column - column id or column object
     * @param filterContainer - id element HTML or DOM element filter
     */
    drawFilterTemplate(column, filterContainer) {
        var _a;
        let filterContainerElm;
        if (typeof filterContainer === 'string') {
            filterContainerElm = document.querySelector(filterContainer);
            if (filterContainerElm === null) {
                return null;
            }
        }
        else {
            filterContainerElm = filterContainer;
        }
        const columnDef = typeof column === 'string' ? this.sharedService.allColumns.find(col => col.id === column) : column;
        const columnId = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.id) !== null && _a !== void 0 ? _a : '';
        if (columnId !== 'selector' && (columnDef === null || columnDef === void 0 ? void 0 : columnDef.filterable)) {
            let searchTerms;
            let operator;
            const newFilter = this.filterFactory.createFilter(columnDef.filter);
            operator = (columnDef && columnDef.filter && columnDef.filter.operator) || (newFilter && newFilter.operator);
            if (this._columnFilters[columnDef.id]) {
                searchTerms = this._columnFilters[columnDef.id].searchTerms || undefined;
                operator = this._columnFilters[columnDef.id].operator || undefined;
            }
            else if (columnDef.filter) {
                // when hiding/showing (with Column Picker or Grid Menu), it will try to re-create yet again the filters (since SlickGrid does a re-render)
                // because of that we need to first get searchTerm(s) from the columnFilters (that is what the user last typed in a filter search input)
                searchTerms = columnDef.filter.searchTerms || undefined;
                this.updateColumnFilters(searchTerms, columnDef, operator);
            }
            const filterArguments = {
                grid: this._grid,
                operator,
                searchTerms,
                columnDef,
                filterContainerElm,
                callback: this.callbackSearchEvent.bind(this)
            };
            if (newFilter) {
                newFilter.init(filterArguments);
                // when hiding/showing (with Column Picker or Grid Menu), it will try to re-create yet again the filters (since SlickGrid does a re-render)
                // we need to also set again the values in the DOM elements if the values were set by a searchTerm(s)
                if (searchTerms && newFilter.setValues) {
                    newFilter.setValues(searchTerms, operator);
                }
            }
            return newFilter;
        }
        return null;
    }
    // --
    // protected functions
    // -------------------
    /** Add all created filters (from their template) to the header row section area */
    addFilterTemplateToHeaderRow(args, isFilterFirstRender = true) {
        var _a;
        const columnDef = args.column;
        const columnId = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.id) !== null && _a !== void 0 ? _a : '';
        if (columnId !== 'selector' && (columnDef === null || columnDef === void 0 ? void 0 : columnDef.filterable)) {
            let searchTerms;
            let operator;
            const newFilter = this.filterFactory.createFilter(columnDef.filter);
            operator = (columnDef && columnDef.filter && columnDef.filter.operator) || (newFilter && newFilter.operator);
            if (this._columnFilters[columnDef.id]) {
                searchTerms = this._columnFilters[columnDef.id].searchTerms || undefined;
                operator = this._columnFilters[columnDef.id].operator || undefined;
            }
            else if (columnDef.filter) {
                // when hiding/showing (with Column Picker or Grid Menu), it will try to re-create yet again the filters (since SlickGrid does a re-render)
                // because of that we need to first get searchTerm(s) from the columnFilters (that is what the user last typed in a filter search input)
                searchTerms = columnDef.filter.searchTerms || undefined;
                this.updateColumnFilters(searchTerms, columnDef, operator);
            }
            const filterArguments = {
                grid: this._grid,
                operator,
                searchTerms,
                columnDef,
                filterContainerElm: this._grid.getHeaderRowColumn(columnId),
                callback: this.callbackSearchEvent.bind(this)
            };
            if (newFilter) {
                newFilter.init(filterArguments, isFilterFirstRender);
                const filterExistIndex = this._filtersMetadata.findIndex((filter) => newFilter.columnDef.id === filter.columnDef.id);
                // add to the filters arrays or replace it when found
                if (filterExistIndex === -1) {
                    this._filtersMetadata.push(newFilter);
                }
                else {
                    this._filtersMetadata[filterExistIndex] = newFilter;
                }
                // when hiding/showing (with Column Picker or Grid Menu), it will try to re-create yet again the filters (since SlickGrid does a re-render)
                // we need to also set again the values in the DOM elements if the values were set by a searchTerm(s)
                if (searchTerms && newFilter.setValues) {
                    newFilter.setValues(searchTerms, operator);
                }
            }
        }
    }
    /**
     * Callback method that is called and executed by the individual Filter (DOM element),
     * for example when user starts typing chars on a search input (which uses InputFilter), this Filter will execute the callback from an input change event.
     */
    callbackSearchEvent(event, args) {
        var _a, _b, _c, _d, _f, _g;
        if (args) {
            const searchTerm = ((event === null || event === void 0 ? void 0 : event.target) ? event.target.value : undefined);
            const searchTerms = (args.searchTerms && Array.isArray(args.searchTerms)) ? args.searchTerms : (searchTerm ? [searchTerm] : undefined);
            const columnDef = args.columnDef || null;
            const columnId = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.id) !== null && _a !== void 0 ? _a : '';
            const fieldType = (_d = (_c = (_b = columnDef === null || columnDef === void 0 ? void 0 : columnDef.filter) === null || _b === void 0 ? void 0 : _b.type) !== null && _c !== void 0 ? _c : columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) !== null && _d !== void 0 ? _d : FieldType.string;
            const operator = args.operator || undefined;
            const hasSearchTerms = searchTerms && Array.isArray(searchTerms);
            const termsCount = hasSearchTerms && searchTerms && searchTerms.length;
            const oldColumnFilters = { ...this._columnFilters };
            const emptySearchTermReturnAllValues = (_g = (_f = columnDef.filter) === null || _f === void 0 ? void 0 : _f.emptySearchTermReturnAllValues) !== null && _g !== void 0 ? _g : true;
            let parsedSearchTerms;
            if (columnDef && columnId) {
                if (!hasSearchTerms || termsCount === 0 || (termsCount === 1 && Array.isArray(searchTerms) && emptySearchTermReturnAllValues && searchTerms[0] === '')) {
                    // delete the property from the columnFilters when it becomes empty
                    // without doing this, it would leave an incorrect state of the previous column filters when filtering on another column
                    delete this._columnFilters[columnId];
                }
                else {
                    const colId = `${columnId}`;
                    const colFilter = {
                        columnId: colId,
                        columnDef,
                        parsedSearchTerms: [],
                        type: fieldType,
                        targetSelector: getSelectorStringFromElement(event === null || event === void 0 ? void 0 : event.target)
                    };
                    const inputSearchConditions = this.parseFormInputFilterConditions(searchTerms, colFilter);
                    colFilter.operator = operator || inputSearchConditions.operator || mapOperatorByFieldType(fieldType);
                    parsedSearchTerms = getParsedSearchTermsByFieldType(inputSearchConditions.searchTerms, fieldType);
                    if (parsedSearchTerms !== undefined) {
                        colFilter.parsedSearchTerms = parsedSearchTerms;
                    }
                    // use searchTerms only coming from the input search result because original terms might include extra operator symbols within their string
                    // and the input search result would be correctly stripped them from input result and assigned to the appropriate operator
                    // for example we might have: { searchTerms: ['*doe'] } and that should be reassigned to: { operator: EndsWith, searchTerms: 'doe' }
                    colFilter.searchTerms = inputSearchConditions.searchTerms || [];
                    this._columnFilters[colId] = colFilter;
                }
            }
            // event might have been created as a CustomEvent (e.g. CompoundDateFilter), without being a valid Slick.EventData,
            // if so we will create a new Slick.EventData and merge it with that CustomEvent to avoid having SlickGrid errors
            const eventData = ((event && typeof event.isPropagationStopped !== 'function') ? Slick.Utils.extend({}, new Slick.EventData(), event) : event);
            // trigger an event only if Filters changed or if ENTER key was pressed
            const eventKey = event === null || event === void 0 ? void 0 : event.key;
            const eventKeyCode = event === null || event === void 0 ? void 0 : event.keyCode;
            if (this._onSearchChange && (args.forceOnSearchChangeEvent || eventKey === 'Enter' || eventKeyCode === KeyCode.ENTER || !dequal(oldColumnFilters, this._columnFilters))) {
                const eventArgs = {
                    clearFilterTriggered: args.clearFilterTriggered,
                    shouldTriggerQuery: args.shouldTriggerQuery,
                    columnId,
                    columnDef,
                    columnFilters: this._columnFilters,
                    operator: operator || mapOperatorByFieldType(fieldType),
                    searchTerms,
                    parsedSearchTerms,
                    grid: this._grid,
                    target: event === null || event === void 0 ? void 0 : event.target
                };
                const onBeforeDispatchResult = this.pubSubService.publish('onBeforeSearchChange', eventArgs);
                if (onBeforeDispatchResult === false) {
                    if (this._gridOptions.resetFilterSearchValueAfterOnBeforeCancellation) {
                        this.resetToPreviousSearchFilters();
                    }
                }
                else {
                    this._onSearchChange.notify(eventArgs, eventData);
                }
            }
        }
    }
    /**
     * Loop through all column definitions and do the following thing
     * 1. loop through each Header Menu commands and change the "hidden" commands to show/hide depending if it's enabled/disabled
     * Also note that we aren't deleting any properties, we just toggle their flags so that we can reloop through at later point in time.
     * (if we previously deleted these properties we wouldn't be able to change them back since these properties wouldn't exist anymore, hence why we just hide the commands)
     * @param {boolean} isDisabling - are we disabling the filter functionality? Defaults to true
     */
    disableAllFilteringCommands(isDisabling = true) {
        var _a;
        const columnDefinitions = this._grid.getColumns();
        // loop through column definition to hide/show header menu commands
        columnDefinitions.forEach((col) => {
            var _a, _b;
            if ((_a = col === null || col === void 0 ? void 0 : col.header) === null || _a === void 0 ? void 0 : _a.menu) {
                (_b = (col.header.menu.commandItems || col.header.menu.items)) === null || _b === void 0 ? void 0 : _b.forEach(menuItem => {
                    if (menuItem && typeof menuItem !== 'string') {
                        const menuCommand = menuItem.command;
                        if (menuCommand === 'clear-filter') {
                            menuItem.hidden = isDisabling;
                        }
                    }
                });
            }
        });
        // loop through column definition to hide/show grid menu commands
        const commandItems = (_a = this._gridOptions.gridMenu) === null || _a === void 0 ? void 0 : _a.commandItems;
        if (commandItems) {
            commandItems.forEach((menuItem) => {
                if (menuItem && typeof menuItem !== 'string') {
                    const menuCommand = menuItem.command;
                    if (menuCommand === 'clear-filter' || menuCommand === 'toggle-filter') {
                        menuItem.hidden = isDisabling;
                    }
                }
            });
        }
        return columnDefinitions;
    }
    /**
     * From a ColumnFilters object, extra only the basic filter details (columnId, operator & searchTerms)
     * @param {Object} columnFiltersObject - columnFilters object
     * @returns - basic details of a column filter
     */
    extractBasicFilterDetails(columnFiltersObject) {
        const filters = [];
        if (columnFiltersObject && typeof columnFiltersObject === 'object') {
            for (const columnId of Object.keys(columnFiltersObject)) {
                const { operator, searchTerms } = columnFiltersObject[`${columnId}`];
                filters.push({ columnId, operator, searchTerms });
            }
        }
        return filters;
    }
    /**
     * When clearing or disposing of all filters, we need to loop through all columnFilters and delete them 1 by 1
     * only trying to make columnFilter an empty (without looping) would not trigger a dataset change
     */
    removeAllColumnFiltersProperties() {
        if (typeof this._columnFilters === 'object') {
            for (const columnId in this._columnFilters) {
                if (columnId && this._columnFilters[columnId]) {
                    delete this._columnFilters[columnId];
                }
            }
        }
    }
    /**
     * Subscribe to `onBeforeHeaderRowCellDestroy` to destroy Filter(s) to avoid leak and not keep orphan filters
     * @param {Object} grid - Slick Grid object
     */
    subscribeToOnHeaderRowCellRendered(grid) {
        this._eventHandler.subscribe(grid.onBeforeHeaderRowCellDestroy, (_e, args) => {
            var _a;
            const colFilter = this._filtersMetadata.find((filter) => filter.columnDef.id === args.column.id);
            (_a = colFilter === null || colFilter === void 0 ? void 0 : colFilter.destroy) === null || _a === void 0 ? void 0 : _a.call(colFilter);
        });
    }
    updateColumnFilters(searchTerms, columnDef, operator) {
        var _a, _b, _c;
        const fieldType = (_c = (_b = (_a = columnDef.filter) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : columnDef.type) !== null && _c !== void 0 ? _c : FieldType.string;
        const parsedSearchTerms = getParsedSearchTermsByFieldType(searchTerms, fieldType); // parsed term could be a single value or an array of values
        if (searchTerms && columnDef) {
            this._columnFilters[columnDef.id] = {
                columnId: columnDef.id,
                columnDef,
                searchTerms,
                operator,
                parsedSearchTerms,
                type: fieldType,
            };
        }
    }
}
//# sourceMappingURL=filter.service.js.map