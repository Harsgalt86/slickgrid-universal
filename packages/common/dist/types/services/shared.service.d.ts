import type { Column, CurrentPagination, GridOption, SlickDataView, SlickGrid } from '../interfaces/index';
import type { SlickGroupItemMetadataProvider } from '../extensions/slickGroupItemMetadataProvider';
export declare class SharedService {
    protected _allColumns: Column[];
    protected _dataView: SlickDataView;
    protected _groupItemMetadataProvider: SlickGroupItemMetadataProvider;
    protected _grid: SlickGrid;
    protected _gridContainerElm: HTMLElement;
    protected _gridOptions: GridOption;
    protected _hasColumnsReordered: boolean;
    protected _currentPagination: CurrentPagination;
    protected _visibleColumns: Column[];
    protected _hideHeaderRowAfterPageLoad: boolean;
    protected _hierarchicalDataset: any[] | undefined;
    protected _externalRegisteredResources: any[];
    protected _frozenVisibleColumnId: string | number;
    /** Getter for All Columns  in the grid (hidden/visible) */
    get allColumns(): Column[];
    /** Setter for All Columns  in the grid (hidden/visible) */
    set allColumns(allColumns: Column[]);
    /** Getter for the Column Definitions pulled through the Grid Object */
    get columnDefinitions(): Column[];
    /** Getter for the Current Pagination (when Pagination is enabled) */
    get currentPagination(): CurrentPagination;
    /** Setter for the Current Pagination (when Pagination is enabled) */
    set currentPagination(currentPagination: CurrentPagination);
    /** Getter for SlickGrid DataView object */
    get dataView(): SlickDataView;
    /** Setter for SlickGrid DataView object */
    set dataView(dataView: SlickDataView);
    /** Setter to keep the frozen column id for reference if we ever show/hide column from ColumnPicker/GridMenu afterward */
    get frozenVisibleColumnId(): string | number;
    /** Getter to keep the frozen column id for reference if we ever show/hide column from ColumnPicker/GridMenu afterward */
    set frozenVisibleColumnId(columnId: string | number);
    /** Setter to know if the columns were ever reordered or not since the grid was created. */
    get hasColumnsReordered(): boolean;
    /** Getter to know if the columns were ever reordered or not since the grid was created. */
    set hasColumnsReordered(isColumnReordered: boolean);
    /** Getter for SlickGrid Grid object */
    get slickGrid(): SlickGrid;
    /** Setter for SlickGrid Grid object */
    set slickGrid(grid: SlickGrid);
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridContainerElement(): HTMLElement;
    /** Setter for the Grid Options pulled through the Grid Object */
    set gridContainerElement(gridContainerElm: HTMLElement);
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    /** Setter for the Grid Options pulled through the Grid Object */
    set gridOptions(gridOptions: GridOption);
    /** Getter for the Grid Options */
    get groupItemMetadataProvider(): SlickGroupItemMetadataProvider;
    /** Setter for the Grid Options */
    set groupItemMetadataProvider(groupItemMetadataProvider: SlickGroupItemMetadataProvider);
    /** Getter to know if user want to hide header row after 1st page load */
    get hideHeaderRowAfterPageLoad(): boolean;
    /** Setter for knowing if user want to hide header row after 1st page load */
    set hideHeaderRowAfterPageLoad(hideHeaderRowAfterPageLoad: boolean);
    /** Getter to know if user want to hide header row after 1st page load */
    get externalRegisteredResources(): any[];
    /** Setter for knowing if user want to hide header row after 1st page load */
    set externalRegisteredResources(externalRegisteredResources: any[]);
    /** Getter for the Visible Columns in the grid */
    get visibleColumns(): Column[];
    /** Setter for the Visible Columns in the grid */
    set visibleColumns(visibleColumns: Column[]);
    /** Getter for the Hierarchical Tree Data dataset when the feature is enabled */
    get hierarchicalDataset(): any[] | undefined;
    /** Getter for the Hierarchical Tree Data dataset when the feature is enabled */
    set hierarchicalDataset(hierarchicalDataset: any[] | undefined);
}
//# sourceMappingURL=shared.service.d.ts.map