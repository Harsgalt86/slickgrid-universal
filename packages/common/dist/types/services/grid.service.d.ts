/// <reference types="node" />
import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
import type { CellArgs, Column, CurrentPinning, SlickDataView, GridOption, GridServiceDeleteOption, GridServiceInsertOption, GridServiceUpdateOption, HideColumnOption, OnEventArgs, SlickGrid } from '../interfaces/index';
import type { FilterService } from './filter.service';
import type { GridStateService } from './gridState.service';
import type { PaginationService } from '../services/pagination.service';
import type { SharedService } from './shared.service';
import type { SortService } from './sort.service';
import type { TreeDataService } from './treeData.service';
import { SlickRowSelectionModel } from '../extensions/slickRowSelectionModel';
export declare class GridService {
    protected readonly gridStateService: GridStateService;
    protected readonly filterService: FilterService;
    protected readonly pubSubService: BasePubSubService;
    protected readonly paginationService: PaginationService;
    protected readonly sharedService: SharedService;
    protected readonly sortService: SortService;
    protected readonly treeDataService: TreeDataService;
    protected _grid: SlickGrid;
    protected _rowSelectionPlugin?: SlickRowSelectionModel;
    protected _highlightTimer?: NodeJS.Timeout;
    protected _highlightTimerEnd?: NodeJS.Timeout;
    constructor(gridStateService: GridStateService, filterService: FilterService, pubSubService: BasePubSubService, paginationService: PaginationService, sharedService: SharedService, sortService: SortService, treeDataService: TreeDataService);
    /** Getter of SlickGrid DataView object */
    get _dataView(): SlickDataView;
    /** Getter for the Grid Options pulled through the Grid Object */
    get _gridOptions(): GridOption;
    dispose(): void;
    init(grid: SlickGrid): void;
    /** Clear all Filters & Sorts */
    clearAllFiltersAndSorts(): void;
    /** Clear any highlight timer that might have been left opened */
    clearHighlightTimer(): void;
    /** Clear all the pinning (frozen) options */
    clearPinning(resetColumns?: boolean): void;
    /**
     * Set pinning (frozen) grid options
     * @param  {Object} pinningOptions - which pinning/frozen options to modify
     * @param {Boolean} shouldAutosizeColumns - defaults to True, should we call an autosizeColumns after the pinning is done?
     * @param {Boolean} suppressRender - do we want to supress the grid re-rendering? (defaults to false)
     * @param {Boolean} suppressColumnSet - do we want to supress the columns set, via "setColumns()" method? (defaults to false)
     */
    setPinning(pinningOptions: CurrentPinning, shouldAutosizeColumns?: boolean, suppressRender?: boolean, suppressColumnSet?: boolean): void;
    /**
     * Get all column set in the grid, that is all visible/hidden columns
     * and also include any extra columns used by some plugins (like Row Selection, Row Detail, ...)
     */
    getAllColumnDefinitions(): Column<any>[];
    /** Get only visible column definitions and also include any extra columns by some plugins (like Row Selection, Row Detail, ...) */
    getVisibleColumnDefinitions(): Column[];
    /**
     * From a SlickGrid Event triggered get the Column Definition and Item Data Context
     *
     * For example the SlickGrid onClick will return cell arguments when subscribing to it.
     * From these cellArgs, we want to get the Column Definition and Item Data
     * @param cell event args
     * @return object with columnDef and dataContext
     */
    getColumnFromEventArguments(args: CellArgs): OnEventArgs;
    /** Get data item by it's row index number */
    getDataItemByRowNumber<T = any>(rowNumber: number): T;
    /** Chain the item Metadata with our implementation of Metadata at given row index */
    getItemRowMetadataToHighlight(previousItemMetadata: any): (rowNumber: number) => {
        cssClasses: string;
    };
    /** Get the Data Item from a grid row index */
    getDataItemByRowIndex<T = any>(index: number): T;
    /** Get the Data Item from an array of grid row indexes */
    getDataItemByRowIndexes<T = any>(indexes: number[]): T[];
    /** Get the currently selected row indexes */
    getSelectedRows(): number[];
    /** Get the currently selected rows item data */
    getSelectedRowsDataItem<T = any>(): T[];
    /**
     * Hide a Column from the Grid by its column definition id, the column will just become hidden and will still show up in columnPicker/gridMenu
     * @param {string | number} columnId - column definition id
     * @param {boolean} triggerEvent - do we want to trigger an event (onHeaderMenuHideColumns) when column becomes hidden? Defaults to true.
     * @return {number} columnIndex - column index position when found or -1
     */
    hideColumnById(columnId: string | number, options?: HideColumnOption): number;
    /**
     * Hide a Column from the Grid by its column definition id(s), the column will just become hidden and will still show up in columnPicker/gridMenu
     * @param {Array<string | number>} columnIds - column definition ids, can be a single string and an array of strings
     * @param {boolean} triggerEvent - do we want to trigger an event (onHeaderMenuHideColumns) when column becomes hidden? Defaults to true.
     */
    hideColumnByIds(columnIds: Array<string | number>, options?: HideColumnOption): void;
    /**
     * Highlight then fade a row for x seconds.
     * The implementation follows this SO answer: https://stackoverflow.com/a/19985148/1212166
     * @param rowNumber
     * @param fadeDelay
     */
    highlightRow(rowNumber: number | number[], fadeDelay?: number, fadeOutDelay?: number): void;
    highlightRowByMetadata(rowNumber: number, fadeDelay?: number, fadeOutDelay?: number): void;
    /** Select the selected row by a row index */
    setSelectedRow(rowIndex: number): void;
    /** Set selected rows with provided array of row indexes */
    setSelectedRows(rowIndexes: number[]): void;
    /** Re-Render the Grid */
    renderGrid(): void;
    /**
     * Reset the grid to it's original state (clear any filters, sorting & pagination if exists) .
     * The column definitions could be passed as argument to reset (this can be used after a Grid State reset)
     * The reset will clear the Filters & Sort, then will reset the Columns to their original state
     */
    resetGrid(columnDefinitions?: Column[]): void;
    /**
     * Add an item (data item) to the datagrid, by default it will highlight (flashing) the inserted row but we can disable it too
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, resortGrid, selectRow, triggerEvent)
     * @return rowIndex: typically index 0 when adding to position "top" or a different number when adding to the "bottom"
     */
    addItem<T = any>(item: T, options?: GridServiceInsertOption): number | undefined;
    /**
     * Add item array (data item) to the datagrid, by default it will highlight (flashing) the inserted row but we can disable it too
     * @param item object arrays, which must contain unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, resortGrid, selectRow, triggerEvent)
     */
    addItems<T = any>(items: T | T[], options?: GridServiceInsertOption): number[];
    /**
     * Delete an existing item from the datagrid (dataView)
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (triggerEvent)
     * @return item id deleted
     */
    deleteItem<T = any>(item: T, options?: GridServiceDeleteOption): number | string;
    /**
     * Delete an array of existing items from the datagrid
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (triggerEvent)
     * @return item id deleted
     */
    deleteItems<T = any>(items: T | T[], options?: GridServiceDeleteOption): Array<number | string>;
    /**
     * Delete an existing item from the datagrid (dataView) by it's id
     * @param itemId: item unique id
     * @param options: provide the possibility to do certain actions after or during the upsert (triggerEvent)
     * @return item id deleted
     */
    deleteItemById(itemId: string | number, options?: GridServiceDeleteOption): number | string;
    /**
     * Delete an array of existing items from the datagrid
     * @param itemIds array of item unique IDs
     * @param options: provide the possibility to do certain actions after or during the upsert (triggerEvent)
     */
    deleteItemByIds(itemIds: Array<number | string>, options?: GridServiceDeleteOption): Array<number | string>;
    /**
     * Update an existing item with new properties inside the datagrid
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, selectRow, triggerEvent)
     * @return grid row index
     */
    updateItem<T = any>(item: T, options?: GridServiceUpdateOption): number | undefined;
    /**
     * Update an array of existing items with new properties inside the datagrid
     * @param item object arrays, which must contain unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the update (highlightRow, selectRow, triggerEvent)
     * @return grid row indexes
     */
    updateItems<T = any>(items: T | T[], options?: GridServiceUpdateOption): Array<number | undefined>;
    /**
     * Update an existing item in the datagrid by it's id and new properties
     * @param itemId: item unique id
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, selectRow, triggerEvent)
     * @return grid row number
     */
    updateItemById<T = any>(itemId: number | string, item: T, options?: GridServiceUpdateOption): number | undefined;
    /**
     * Insert a row into the grid if it doesn't already exist or update if it does.
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, resortGrid, selectRow, triggerEvent)
     */
    upsertItem<T = any>(item: T, options?: GridServiceInsertOption): {
        added: number | undefined;
        updated: number | undefined;
    };
    /**
     * Update an array of existing items with new properties inside the datagrid
     * @param item object arrays, which must contain unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, resortGrid, selectRow, triggerEvent)
     * @return row numbers in the grid
     */
    upsertItems<T = any>(items: T | T[], options?: GridServiceInsertOption): {
        added: number | undefined;
        updated: number | undefined;
    }[];
    /**
     * Update an existing item in the datagrid by it's id and new properties
     * @param itemId: item unique id
     * @param item object which must contain a unique "id" property and any other suitable properties
     * @param options: provide the possibility to do certain actions after or during the upsert (highlightRow, resortGrid, selectRow, triggerEvent)
     * @return grid row number in the grid
     */
    upsertItemById<T = any>(itemId: number | string, item: T, options?: GridServiceInsertOption): {
        added: number | undefined;
        updated: number | undefined;
    };
    /**
     * When dealing with hierarchical (tree) dataset, we can invalidate all the rows and force a full resort & re-render of the hierarchical tree dataset.
     * This method will automatically be called anytime user called `addItem()` or `addItems()`.
     * However please note that it won't be called when `updateItem`, if the data that gets updated does change the tree data column then you should call this method.
     * @param {Array<Object>} [items] - optional flat array of parent/child items to use while redoing the full sort & refresh
     */
    invalidateHierarchicalDataset(items?: any[]): void;
    /** Check wether the grid has the Row Selection enabled */
    protected hasRowSelectionEnabled(): false | import("..").SlickCellSelectionModel | SlickRowSelectionModel | undefined;
}
//# sourceMappingURL=grid.service.d.ts.map