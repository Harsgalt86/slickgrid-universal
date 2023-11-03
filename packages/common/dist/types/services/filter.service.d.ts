import { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import { type FilterFactory } from './../filters/filterFactory';
import { EmitterType, OperatorType, type OperatorString, type SearchTerm } from '../enums/index';
import type { Column, ColumnFilters, CurrentFilter, SlickDataView, Filter, FilterCallbackArg, FilterConditionOption, GridOption, SearchColumnFilter, SlickEvent, SlickEventHandler, SlickGrid } from './../interfaces/index';
import type { BackendUtilityService } from './backendUtility.service';
import type { SharedService } from './shared.service';
import type { RxJsFacade, Subject } from './rxjsFacade';
interface OnSearchChangeEventArgs {
    clearFilterTriggered?: boolean;
    shouldTriggerQuery?: boolean;
    columnId: string | number;
    columnDef: Column;
    columnFilters: ColumnFilters;
    operator: OperatorType | OperatorString | undefined;
    parsedSearchTerms?: SearchTerm | SearchTerm[] | undefined;
    searchTerms: SearchTerm[] | undefined;
    grid: SlickGrid;
    target?: HTMLElement;
}
export declare class FilterService {
    protected filterFactory: FilterFactory;
    protected pubSubService: BasePubSubService;
    protected sharedService: SharedService;
    protected backendUtilities?: BackendUtilityService | undefined;
    protected rxjs?: RxJsFacade | undefined;
    protected _eventHandler: SlickEventHandler;
    protected _isFilterFirstRender: boolean;
    protected _firstColumnIdRendered: string | number;
    protected _filtersMetadata: Array<Filter>;
    protected _columnFilters: ColumnFilters;
    protected _grid: SlickGrid;
    protected _isTreePresetExecuted: boolean;
    protected _previousFilters: CurrentFilter[];
    protected _onSearchChange: SlickEvent<OnSearchChangeEventArgs> | null;
    protected _tmpPreFilteredData?: Set<number | string>;
    protected httpCancelRequests$?: Subject<void>;
    constructor(filterFactory: FilterFactory, pubSubService: BasePubSubService, sharedService: SharedService, backendUtilities?: BackendUtilityService | undefined, rxjs?: RxJsFacade | undefined);
    /** Getter of the SlickGrid Event Handler */
    get eventHandler(): SlickEventHandler;
    /** Getter to know if the filter was already rendered or if it was its first time render */
    get isFilterFirstRender(): boolean;
    /** Getter of the SlickGrid Event Handler */
    get onSearchChange(): SlickEvent | null;
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get _gridOptions(): GridOption;
    /** Getter for the Column Definitions pulled through the Grid Object */
    protected get _columnDefinitions(): Column[];
    /** Getter of SlickGrid DataView object */
    protected get _dataView(): SlickDataView;
    addRxJsResource(rxjs: RxJsFacade): void;
    /**
     * Initialize the Service
     * @param grid
     */
    init(grid: SlickGrid): void;
    dispose(): void;
    /**
     * Dispose of the filters, since it's a singleton, we don't want to affect other grids with same columns
     */
    disposeColumnFilters(): void;
    /**
     * Bind a backend filter hook to the grid
     * @param grid SlickGrid Grid object
     */
    bindBackendOnFilter(grid: SlickGrid): void;
    /**
     * Bind a local filter hook to the grid
     * @param grid SlickGrid Grid object
     * @param gridOptions Grid Options object
     * @param dataView
     */
    bindLocalOnFilter(grid: SlickGrid): void;
    clearFilterByColumnId(event: Event, columnId: number | string): Promise<boolean>;
    /** Clear the search filters (below the column titles) */
    clearFilters(triggerChange?: boolean): Promise<void>;
    /** Local Grid Filter search */
    customLocalFilter(item: any, args: {
        columnFilters: ColumnFilters;
        dataView: SlickDataView;
        grid: SlickGrid;
    }): boolean;
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
    parseFormInputFilterConditions(inputSearchTerms: SearchTerm[] | undefined, columnFilter: Omit<SearchColumnFilter, 'searchTerms'>): Omit<FilterConditionOption, 'cellValue'>;
    /**
     * PreProcess the filter(s) condition(s) on each item data context, the result might be a boolean or FilterConditionOption object.
     * It will be a boolean when the searchTerms are invalid or the column is not found (it so it will return True and the item won't be filtered out from the grid)
     * or else a FilterConditionOption object with the necessary info for the test condition needs to be processed in a further stage.
     * @param item - item data context
     * @param columnFilter - column filter object (the object properties represent each column id and the value is the filter metadata)
     * @param grid - SlickGrid object
     * @returns FilterConditionOption or boolean
     */
    preProcessFilterConditionOnDataContext(item: any, columnFilter: SearchColumnFilter, grid: SlickGrid): FilterConditionOption | boolean;
    /**
     * When using Tree Data, we need to prefilter (search) the data prior, the result will be an array of IDs which are the node(s) and their parent nodes when necessary.
     * This will then be passed to the DataView setFilter(customLocalFilter), which will itself loop through the list of IDs and display/hide the row when found.
     * We do this in 2 steps so that we can still use the DataSet setFilter()
     */
    preFilterTreeData(inputItems: any[], columnFilters: ColumnFilters): Set<string | number>;
    getColumnFilters(): ColumnFilters;
    getPreviousFilters(): CurrentFilter[];
    getFiltersMetadata(): Filter[];
    getCurrentLocalFilters(): CurrentFilter[];
    /**
     * A simple function that will be called to emit a change when a filter changes.
     * Other services, like Pagination, can then subscribe to it.
     * @param caller
     */
    emitFilterChanged(caller: EmitterType, isBeforeExecution?: boolean): void | boolean | Promise<boolean>;
    onBackendFilterChange(event: KeyboardEvent, args: OnSearchChangeEventArgs): Promise<void>;
    /**
     * When user passes an array of preset filters, we need to pre-populate each column filter searchTerm(s)
     * The process is to loop through the preset filters array, find the associated column from columnDefinitions and fill in the filter object searchTerm(s)
     * This is basically the same as if we would manually add searchTerm(s) to a column filter object in the column definition, but we do it programmatically.
     * At the end of the day, when creating the Filter (DOM Element), it will use these searchTerm(s) so we can take advantage of that without recoding each Filter type (DOM element)
     * @param grid
     */
    populateColumnFilterSearchTermPresets(filters: CurrentFilter[]): Column<any>[];
    /**
     * when we have a Filter Presets on a Tree Data View grid, we need to call the pre-filtering of tree data
     * we need to do this because Tree Data is the only type of grid that requires a pre-filter (preFilterTreeData) to be executed before the final filtering
     * @param {Array<Object>} [items] - optional flat array of parent/child items to use while redoing the full sort & refresh
     */
    refreshTreeDataFilters(items?: any[]): void;
    /**
     * Toggle the Filter Functionality
     * @param {boolean} isFilterDisabled - optionally force a disable/enable of the Sort Functionality? Defaults to True
     * @param {boolean} clearFiltersWhenDisabled - when disabling the Filter, do we also want to clear all the filters as well? Defaults to True
     */
    disableFilterFunctionality(isFilterDisabled?: boolean, clearFiltersWhenDisabled?: boolean): void;
    /**
     * Reset (revert) to previous filters, it could be because you prevented `onBeforeSearchChange` OR a Backend Error was thrown.
     * It will reapply the previous filter state in the UI.
     */
    resetToPreviousSearchFilters(): void;
    /**
     * Toggle the Filter Functionality (show/hide the header row filter bar as well)
     * @param {boolean} clearFiltersWhenDisabled - when disabling the filters, do we want to clear the filters before hiding the filters? Defaults to True
     */
    toggleFilterFunctionality(clearFiltersWhenDisabled?: boolean): void;
    /**
     * Toggle the Header Row filter bar (this does not disable the Filtering itself, you can use "toggleFilterFunctionality()" instead, however this will reset any column positions)
     */
    toggleHeaderFilterRow(): void;
    /**
     * Set the sort icons in the UI (ONLY the icons, it does not do any sorting)
     * The column sort icons are not necessarily inter-connected to the sorting functionality itself,
     * you can change the sorting icons separately by passing an array of columnId/sortAsc and that will change ONLY the icons
     * @param sortColumns
     */
    setSortColumnIcons(sortColumns: {
        columnId: string;
        sortAsc: boolean;
    }[]): void;
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
    updateFilters(filters: CurrentFilter[], emitChangedEvent?: boolean, triggerBackendQuery?: boolean, triggerOnSearchChangeEvent?: boolean): Promise<boolean>;
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
    updateSingleFilter(filter: CurrentFilter, emitChangedEvent?: boolean, triggerBackendQuery?: boolean): Promise<boolean>;
    /**
     * Draw DOM Element Filter on custom HTML element
     * @param column - column id or column object
     * @param filterContainer - id element HTML or DOM element filter
     */
    drawFilterTemplate(column: Column | string, filterContainer: HTMLDivElement | string): Filter | null | undefined;
    /** Add all created filters (from their template) to the header row section area */
    protected addFilterTemplateToHeaderRow(args: {
        column: Column;
        grid: SlickGrid;
        node: HTMLElement;
    }, isFilterFirstRender?: boolean): void;
    /**
     * Callback method that is called and executed by the individual Filter (DOM element),
     * for example when user starts typing chars on a search input (which uses InputFilter), this Filter will execute the callback from an input change event.
     */
    protected callbackSearchEvent(event: Event | undefined, args: FilterCallbackArg): void;
    /**
     * Loop through all column definitions and do the following thing
     * 1. loop through each Header Menu commands and change the "hidden" commands to show/hide depending if it's enabled/disabled
     * Also note that we aren't deleting any properties, we just toggle their flags so that we can reloop through at later point in time.
     * (if we previously deleted these properties we wouldn't be able to change them back since these properties wouldn't exist anymore, hence why we just hide the commands)
     * @param {boolean} isDisabling - are we disabling the filter functionality? Defaults to true
     */
    protected disableAllFilteringCommands(isDisabling?: boolean): Column[];
    /**
     * From a ColumnFilters object, extra only the basic filter details (columnId, operator & searchTerms)
     * @param {Object} columnFiltersObject - columnFilters object
     * @returns - basic details of a column filter
     */
    protected extractBasicFilterDetails(columnFiltersObject: ColumnFilters): CurrentFilter[];
    /**
     * When clearing or disposing of all filters, we need to loop through all columnFilters and delete them 1 by 1
     * only trying to make columnFilter an empty (without looping) would not trigger a dataset change
     */
    protected removeAllColumnFiltersProperties(): void;
    /**
     * Subscribe to `onBeforeHeaderRowCellDestroy` to destroy Filter(s) to avoid leak and not keep orphan filters
     * @param {Object} grid - Slick Grid object
     */
    protected subscribeToOnHeaderRowCellRendered(grid: SlickGrid): void;
    protected updateColumnFilters(searchTerms: SearchTerm[] | undefined, columnDef: any, operator?: OperatorType | OperatorString): void;
}
export {};
//# sourceMappingURL=filter.service.d.ts.map