/// <reference types="node" />
import type { BasePubSubService, EventSubscription } from '@slickgrid-universal/event-pub-sub';
import type { AutoResizeOption, Column, GridOption, GridSize, ResizeByContentOption, SlickDataView, SlickEventHandler, SlickGrid } from '../interfaces/index';
import { BindingEventService } from '../services/index';
export declare class ResizerService {
    protected readonly pubSubService: BasePubSubService;
    protected _autoResizeOptions: AutoResizeOption;
    protected _bindingEventService: BindingEventService;
    protected _grid: SlickGrid;
    protected _eventHandler: SlickEventHandler;
    protected _fixedHeight?: number | string;
    protected _fixedWidth?: number | string;
    protected _gridDomElm: HTMLElement;
    protected _gridContainerElm: HTMLElement;
    protected _pageContainerElm: HTMLElement;
    protected _intervalId: NodeJS.Timeout;
    protected _intervalRetryDelay: number;
    protected _isStopResizeIntervalRequested: boolean;
    protected _hasResizedByContentAtLeastOnce: boolean;
    protected _lastDimensions?: GridSize;
    protected _totalColumnsWidthByContent: number;
    protected _timer: NodeJS.Timeout;
    protected _resizePaused: boolean;
    protected _resizeObserver: ResizeObserver;
    protected _subscriptions: EventSubscription[];
    get eventHandler(): SlickEventHandler;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    /** Getter for the SlickGrid DataView */
    get dataView(): SlickDataView;
    /** Getter for the grid uid */
    get gridUid(): string;
    get gridUidSelector(): string;
    get intervalRetryDelay(): number;
    set intervalRetryDelay(delay: number);
    get resizeByContentOptions(): ResizeByContentOption;
    constructor(pubSubService: BasePubSubService);
    /** Dispose function when service is destroyed */
    dispose(): void;
    init(grid: SlickGrid, gridParentContainerElm: HTMLElement): void;
    /** Bind an auto resize trigger on the datagrid, if that is enable then it will resize itself to the available space
     * Options: we could also provide a % factor to resize on each height/width independently
     */
    bindAutoResizeDataGrid(newSizes?: GridSize): null | void;
    handleResizeGrid(newSizes?: GridSize): void;
    resizeObserverCallback(): void;
    /**
     * Calculate the datagrid new height/width from the available space, also consider that a % factor might be applied to calculation
     * object gridOptions
     */
    calculateGridNewDimensions(gridOptions: GridOption): GridSize | null;
    /**
     * Return the last resize dimensions used by the service
     * @return {object} last dimensions (height, width)
     */
    getLastResizeDimensions(): GridSize | undefined;
    /**
     * Provide the possibility to pause the resizer for some time, until user decides to re-enabled it later if he wish to.
     * @param {boolean} isResizePaused are we pausing the resizer?
     */
    pauseResizer(isResizePaused: boolean): void;
    /**
     * Resize the datagrid to fit the browser height & width.
     * @param {number} delay to wait before resizing, defaults to 0 (in milliseconds)
     * @param {object} newSizes can optionally be passed (height, width)
     * @param {object} event that triggered the resize, defaults to null
     * @return If the browser supports it, we can return a Promise that would resolve with the new dimensions
     */
    resizeGrid(delay?: number, newSizes?: GridSize): Promise<GridSize | undefined>;
    resizeGridCallback(newSizes?: GridSize): GridSize | undefined;
    resizeGridWithDimensions(newSizes?: GridSize): GridSize | undefined;
    requestStopOfAutoFixResizeGrid(isStopRequired?: boolean): void;
    /**
     * Resize each column width by their cell text/value content (this could potentially go wider than the viewport and end up showing an horizontal scroll).
     * This operation requires to loop through each dataset item to inspect each cell content width and has a performance cost associated to this process.
     *
     * NOTE: please that for performance reasons we will only inspect the first 1000 rows,
     * however user could override it by using the grid option `resizeMaxItemToInspectCellContentWidth` to increase/decrease how many items to inspect.
     * @param {Boolean} recalculateColumnsTotalWidth - defaults to false, do we want to recalculate the necessary total columns width even if it was already calculated?
     */
    resizeColumnsByCellContent(recalculateColumnsTotalWidth?: boolean): void;
    /**
     * Step 1 - The first step will read through the entire dataset (unless max item count is reached),
     * it will analyze each cell of the grid and calculate its max width via its content and column definition info (it will do so by calling step 2 method while looping through each cell).
     * @param columnOrColumns - single or array of column definition(s)
     * @param columnWidths - column width object that will be updated by reference pointers
     * @param columnIndexOverride - an optional column index, if provided it will override the column index position
     * @returns - count of items that was read
     */
    protected calculateCellWidthByReadingDataset(columnOrColumns: Column | Column[], columnWidths: {
        [columnId in string | number]: number;
    }, maxItemToInspect?: number, columnIndexOverride?: number): number;
    /**
     * Step 2 - This step will parse any Formatter(s) if defined, it will then sanitize any HTML tags and calculate the max width from that cell content.
     * This function will be executed on every cell of the grid data.
     * @param {Object} item - item data context object
     * @param {Object} columnDef - column definition
     * @param {Number} rowIdx - row index
     * @param {Number} colIdx - column (cell) index
     * @param {Number} initialMininalColumnWidth - initial width, could be coming from `minWidth` or a default `width`
     * @returns - column width
     */
    protected calculateCellWidthByContent(item: any, columnDef: Column, rowIdx: number, colIdx: number, initialMininalColumnWidth?: number): number | undefined;
    /**
     * Step 3 - Apply the new calculated width, it might or might not use this calculated width depending on a few conditions.
     * One of those condition will be to check that the new width doesn't go over a maxWidth and/or a maxWidthThreshold
     * @param {Object} column - column definition to apply the width
     * @param {Number} calculatedColumnWidth - new calculated column width to possibly apply
     */
    protected applyNewCalculatedColumnWidthByReference(column: Column<any>, calculatedColumnWidth: number): void;
    protected handleSingleColumnResizeByContent(columnId: string): void;
    /**
     * Checks wether the new calculated column width is valid or not, if it's not then return a lower and acceptable width.
     * When using frozen (pinned) column, we cannot make our column wider than the grid viewport because it would become unusable/unscrollable
     * and so if we do reach that threshold then our calculated column width becomes officially invalid
     * @param {Object} column - column definition
     * @param {Number} newColumnWidth - calculated column width input
     * @returns boolean
     */
    protected readjustNewColumnWidthWhenOverLimit(column: Column, newColumnWidth: number): number;
    /**
     * Just check if the grid is still shown in the DOM
     * @returns is grid shown
     */
    protected checkIsGridShown(): boolean;
    /**
     * Patch for SalesForce, some issues arise when having a grid inside a Tab and user clicks in a different Tab without waiting for the grid to be rendered
     * in ideal world, we would simply call a resize when user comes back to the Tab with the grid (tab focused) but this is an extra step and we might not always have this event available.
     * The grid seems broken, the header titles seems to be showing up behind the grid data and the rendering seems broken.
     * Why it happens? Because SlickGrid can resize problem when the DOM element is hidden and that happens when user doesn't wait for the grid to be fully rendered and go in a different Tab.
     *
     * So the patch is to call a grid resize if the following 2 conditions are met
     *   1- header row is Y coordinate 0 (happens when user is not in current Tab)
     *   2- header titles are lower than the viewport of dataset (this can happen when user change Tab and DOM is not shown),
     * for these cases we'll resize until it's no longer true or until we reach a max time limit (70min)
     */
    protected resizeGridWhenStylingIsBrokenUntilCorrected(): void;
}
//# sourceMappingURL=resizer.service.d.ts.map