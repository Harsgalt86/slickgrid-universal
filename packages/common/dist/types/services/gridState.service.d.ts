import type { BasePubSubService, EventSubscription } from '@slickgrid-universal/event-pub-sub';
import { ExtensionName } from '../enums/index';
import type { Column, CurrentColumn, CurrentFilter, CurrentPagination, CurrentRowSelection, CurrentSorter, GridOption, GridState, SlickDataView, SlickGrid, TreeToggleStateChange } from '../interfaces/index';
import type { ExtensionService } from './extension.service';
import type { FilterService } from './filter.service';
import type { SharedService } from './shared.service';
import type { SortService } from './sort.service';
import type { TreeDataService } from './treeData.service';
export declare class GridStateService {
    protected readonly extensionService: ExtensionService;
    protected readonly filterService: FilterService;
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected readonly sortService: SortService;
    protected readonly treeDataService: TreeDataService;
    protected _eventHandler: import("../interfaces/slickEventHandler.interface").SlickEventHandler;
    protected _columns: Column[];
    protected _grid: SlickGrid;
    protected _subscriptions: EventSubscription[];
    protected _selectedRowIndexes: number[] | undefined;
    protected _selectedRowDataContextIds: Array<number | string> | undefined;
    protected _wasRecheckedAfterPageChange: boolean;
    constructor(extensionService: ExtensionService, filterService: FilterService, pubSubService: BasePubSubService, sharedService: SharedService, sortService: SortService, treeDataService: TreeDataService);
    /** Getter of SlickGrid DataView object */
    get _dataView(): SlickDataView;
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get _gridOptions(): GridOption;
    /** Getter of the selected data context object IDs */
    get selectedRowDataContextIds(): Array<number | string> | undefined;
    /** Setter of the selected data context object IDs */
    set selectedRowDataContextIds(dataContextIds: Array<number | string> | undefined);
    /**
     * Initialize the Service
     * @param grid
     */
    init(grid: SlickGrid): void;
    /** Dispose of all the SlickGrid & PubSub subscriptions */
    dispose(): void;
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
    changeColumnsArrangement(definedColumns: CurrentColumn[], triggerAutoSizeColumns?: boolean, triggerColumnsFullResizeByContent?: boolean): void;
    /**
     * Get the current grid state (filters/sorters/pagination)
     * @return grid state
     */
    getCurrentGridState(): GridState;
    /**
     * Get the Columns (and their state: visibility/position) that are currently applied in the grid
     * @return current columns
     */
    getColumns(): Column[];
    /**
     * From an array of Grid Column Definitions, get the associated Current Columns
     * @param gridColumns
     */
    getAssociatedCurrentColumns(gridColumns: Column[]): CurrentColumn[];
    /**
     * From an array of Current Columns, get the associated Grid Column Definitions
     * @param grid
     * @param currentColumns
     */
    getAssociatedGridColumns(grid: SlickGrid, currentColumns: CurrentColumn[]): Column[];
    /**
     * Get the Columns (and their states: visibility/position/width) that are currently applied in the grid
     * @return current columns
     */
    getCurrentColumns(): CurrentColumn[];
    /**
     * Get the Filters (and their state, columnId, searchTerm(s)) that are currently applied in the grid
     * @return current filters
     */
    getCurrentFilters(): CurrentFilter[] | null;
    /**
     * Get current Pagination (and its state, pageNumber, pageSize) that are currently applied in the grid
     * @return current pagination state
     */
    getCurrentPagination(): CurrentPagination | null;
    /**
     * Get the current Row Selections (and its state, gridRowIndexes, dataContextIds, filteredDataContextIds) that are currently applied in the grid
     * @param boolean are we requesting a refresh of the Section FilteredRow
     * @return current row selection
     */
    getCurrentRowSelections(): CurrentRowSelection | null;
    /**
     * Get the current Sorters (and their state, columnId, direction) that are currently applied in the grid
     * @return current sorters
     */
    getCurrentSorters(): CurrentSorter[] | null;
    /**
     * Get the current list of Tree Data item(s) that got toggled in the grid
     * @returns {Array<TreeToggledItem>} treeDataToggledItems - items that were toggled (array of `parentId` and `isCollapsed` flag)
     */
    getCurrentTreeDataToggleState(): Omit<TreeToggleStateChange, 'fromItemId'> | null;
    /** Check whether the row selection needs to be preserved */
    needToPreserveRowSelection(): boolean;
    resetColumns(columnDefinitions?: Column[]): void;
    /**
     * Reset the grid to its original (all) columns, that is to display the entire set of columns with their original positions & visibilities
     * @param {Boolean} triggerAutoSizeColumns - True by default, do we also want to call the "autosizeColumns()" method to make the columns fit in the grid?
     */
    resetToOriginalColumns(triggerAutoSizeColumns?: boolean): void;
    /** if we use Row Selection or the Checkbox Selector, we need to reset any selection */
    resetRowSelectionWhenRequired(): void;
    /**
     * Subscribe to all necessary SlickGrid or Service Events that deals with a Grid change,
     * when triggered, we will publish a Grid State Event with current Grid State
     */
    subscribeToAllGridChanges(grid: SlickGrid): void;
    /**
     * Add certain column(s), when the feature is/are enabled, to an output column definitions array (by reference).
     * Basically some features (for example: Row Selection, Row Detail, Row Move) will be added as column(s) dynamically and internally by the lib,
     * we just ask the developer to enable the feature, via flags, and internally the lib will create the necessary column.
     * So specifically for these column(s) and feature(s), we need to re-add them internally when the user calls the `changeColumnsArrangement()` method.
     * @param {Array<Object>} dynamicAddonColumnByIndexPositionList - array of plugin columnId and columnIndexPosition that will be re-added (if it wasn't already found in the output array) dynamically
     * @param {Array<Column>} fullColumnDefinitions - full column definitions array that includes every columns (including Row Selection, Row Detail, Row Move when enabled)
     * @param {Array<Column>} newArrangedColumns - output array that will be use to show in the UI (it could have less columns than fullColumnDefinitions array since user might hide some columns)
     */
    protected addColumnDynamicWhenFeatureEnabled(dynamicAddonColumnByIndexPositionList: Array<{
        columnId: string;
        columnIndexPosition: number;
    }>, fullColumnDefinitions: Column[], newArrangedColumns: Column[]): void;
    /**
     * Bind a SlickGrid Extension Event to a Grid State change event
     * @param extension name
     * @param event name
     */
    protected bindExtensionAddonEventToGridStateChange(extensionName: ExtensionName, eventName: string): void;
    /**
     * Bind a Grid Event (of Column changes) to a Grid State change event
     * @param event - event name
     * @param grid - SlickGrid object
     */
    protected bindSlickGridColumnChangeEventToGridStateChange(eventName: string, grid: SlickGrid): void;
    /**
     * Bind a Grid Event (of grid option changes) to a Grid State change event, if we detect that any of the pinning (frozen) options changes then we'll trigger a Grid State change
     * @param grid - SlickGrid object
     */
    protected bindSlickGridOnSetOptionsEventToGridStateChange(grid: SlickGrid): void;
    /** Check wether the grid has the Row Selection enabled */
    protected hasRowSelectionEnabled(): false | import("..").SlickCellSelectionModel | import("..").SlickRowSelectionModel | undefined;
}
//# sourceMappingURL=gridState.service.d.ts.map