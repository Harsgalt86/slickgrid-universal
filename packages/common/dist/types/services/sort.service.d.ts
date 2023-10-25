import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { Column, ColumnSort, SlickDataView, GridOption, CurrentSorter, MultiColumnSort, SingleColumnSort, SlickEventHandler, SlickGrid, SlickEventData } from '../interfaces/index';
import { EmitterType } from '../enums/index';
import type { BackendUtilityService } from './backendUtility.service';
import type { SharedService } from './shared.service';
import type { RxJsFacade, Subject } from './rxjsFacade';
export declare class SortService {
    protected readonly sharedService: SharedService;
    protected readonly pubSubService: BasePubSubService;
    protected readonly backendUtilities?: BackendUtilityService | undefined;
    protected rxjs?: RxJsFacade | undefined;
    protected _currentLocalSorters: CurrentSorter[];
    protected _eventHandler: SlickEventHandler;
    protected _dataView: SlickDataView;
    protected _grid: SlickGrid;
    protected _isBackendGrid: boolean;
    protected httpCancelRequests$?: Subject<void>;
    constructor(sharedService: SharedService, pubSubService: BasePubSubService, backendUtilities?: BackendUtilityService | undefined, rxjs?: RxJsFacade | undefined);
    /** Getter of the SlickGrid Event Handler */
    get eventHandler(): SlickEventHandler;
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get _gridOptions(): GridOption;
    /** Getter for the Column Definitions pulled through the Grid Object */
    protected get _columnDefinitions(): Column[];
    dispose(): void;
    addRxJsResource(rxjs: RxJsFacade): void;
    /**
     * Bind a backend sort (single/multi) hook to the grid
     * @param grid SlickGrid Grid object
     * @param dataView SlickGrid DataView object
     */
    bindBackendOnSort(grid: SlickGrid): void;
    /**
     * Bind a local sort (single/multi) hook to the grid
     * @param grid SlickGrid Grid object
     * @param gridOptions Grid Options object
     * @param dataView
     */
    bindLocalOnSort(grid: SlickGrid): void;
    handleLocalOnSort(_e: SlickEventData, args: SingleColumnSort | MultiColumnSort): void;
    clearSortByColumnId(event: Event | undefined, columnId: string | number): void;
    /**
     * Clear Sorting
     * - 1st, remove the SlickGrid sort icons (this setSortColumns function call really does only that)
     * - 2nd, we also need to trigger a sort change
     *   - for a backend grid, we will trigger a backend sort changed with an empty sort columns array
     *   - however for a local grid, we need to pass a sort column and so we will sort by the 1st column
     * @param trigger query event after executing clear filter?
     */
    clearSorting(triggerQueryEvent?: boolean): void;
    /**
     * Toggle the Sorting Functionality
     * @param {boolean} isSortingDisabled - optionally force a disable/enable of the Sort Functionality? Defaults to True
     * @param {boolean} clearSortingWhenDisabled - when disabling the sorting, do we also want to clear the sorting as well? Defaults to True
     */
    disableSortFunctionality(isSortingDisabled?: boolean, clearSortingWhenDisabled?: boolean): void;
    /**
     * Toggle the Sorting functionality
     * @param {boolean} clearSortingWhenDisabled - when disabling the sorting, do we also want to clear the sorting as well? Defaults to True
     */
    toggleSortFunctionality(clearSortingOnDisable?: boolean): void;
    /**
     * A simple function that will be called to emit a change when a sort changes.
     * Other services, like Pagination, can then subscribe to it.
     * @param sender
     */
    emitSortChanged(sender: EmitterType, currentLocalSorters?: CurrentSorter[]): void;
    getCurrentLocalSorters(): CurrentSorter[];
    /**
     * Get current column sorts,
     * If a column is passed as an argument, that will be exclusion so we won't add this column to our output array since it is already in the array.
     * The usage of this method is that we want to know the sort prior to calling the next sorting command
     */
    getCurrentColumnSorts(excludedColumnId?: string): ColumnSort[];
    /** Load defined Sorting (sorters) into the grid */
    loadGridSorters(sorters: CurrentSorter[]): ColumnSort[];
    /** Process the initial sort, typically it will sort ascending by the column that has the Tree Data unless user specifies a different initialSort */
    processTreeDataInitialSort(): void;
    /**
     * When working with Backend Service, we'll use the `onBeforeSort` which will return false since we want to manually apply the sort icons only after the server response
     * @param event - optional Event that triggered the sort
     * @param args - sort event arguments
     * @returns - False since we'll apply the sort icon(s) manually only after server responded
     */
    onBackendSortChanged(event: Event | undefined, args: MultiColumnSort & {
        clearSortTriggered?: boolean;
    }): void;
    /** When a Sort Changes on a Local grid (JSON dataset) */
    onLocalSortChanged(grid: SlickGrid, sortColumns: Array<ColumnSort & {
        clearSortTriggered?: boolean;
    }>, forceReSort?: boolean, emitSortChanged?: boolean): Promise<void>;
    /** Takes a hierarchical dataset and sort it recursively,  */
    sortHierarchicalDataset<T>(hierarchicalDataset: T[], sortColumns: Array<ColumnSort & {
        clearSortTriggered?: boolean;
    }>, emitSortChanged?: boolean): {
        hierarchical: T[];
        flat: Omit<T, number | typeof Symbol.iterator | "charAt" | "charCodeAt" | "concat" | "indexOf" | "lastIndexOf" | "localeCompare" | "match" | "replace" | "search" | "slice" | "split" | "substring" | "toLowerCase" | "toLocaleLowerCase" | "toUpperCase" | "toLocaleUpperCase" | "trim" | "length" | "substr" | "codePointAt" | "includes" | "endsWith" | "normalize" | "repeat" | "startsWith" | "anchor" | "big" | "blink" | "bold" | "fixed" | "fontcolor" | "fontsize" | "italics" | "link" | "small" | "strike" | "sub" | "sup" | "padStart" | "padEnd" | "trimEnd" | "trimStart" | "trimLeft" | "trimRight" | "matchAll" | "at" | "toString" | "toLocaleString" | "valueOf">[];
    };
    /** Call a local grid sort by its default sort field id (user can customize default field by configuring "defaultColumnSortFieldId" in the grid options, defaults to "id") */
    sortLocalGridByDefaultSortFieldId(): void;
    sortComparers(sortColumns: ColumnSort[], dataRow1: any, dataRow2: any): number;
    sortComparer(sortColumn: ColumnSort, dataRow1: any, dataRow2: any, querySortField?: string): number | undefined;
    sortTreeData(treeArray: any[], sortColumns: Array<ColumnSort>): void;
    /** Sort the Tree Children of a hierarchical dataset by recursion */
    sortTreeChildren(treeArray: any[], sortColumn: ColumnSort, treeLevel: number): void;
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
    updateSorting(sorters: CurrentSorter[], emitChangedEvent?: boolean, triggerBackendQuery?: boolean): void;
    /**
     * Loop through all column definitions and do the following 2 things
     * 1. disable/enable the "sortable" property of each column
     * 2. loop through each Header Menu commands and change the "hidden" commands to show/hide depending if it's enabled/disabled
     * Also note that we aren't deleting any properties, we just toggle their flags so that we can reloop through at later point in time.
     * (if we previously deleted these properties we wouldn't be able to change them back since these properties wouldn't exist anymore, hence why we just hide the commands)
     * @param {boolean} isDisabling - are we disabling the sort functionality? Defaults to true
     */
    protected disableAllSortingCommands(isDisabling?: boolean): Column[];
}
//# sourceMappingURL=sort.service.d.ts.map