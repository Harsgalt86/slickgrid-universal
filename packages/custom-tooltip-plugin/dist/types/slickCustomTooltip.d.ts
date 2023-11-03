import type { CancellablePromiseWrapper, Column, ContainerService, CustomTooltipOption, Formatter, GridOption, RxJsFacade, SharedService, SlickDataView, SlickEventData, SlickEventHandler, SlickGrid, Subscription } from '@slickgrid-universal/common';
type CellType = 'slick-cell' | 'slick-header-column' | 'slick-headerrow-column';
/**
 * A plugin to add Custom Tooltip when hovering a cell, it subscribes to the cell "onMouseEnter" and "onMouseLeave" events.
 * The "customTooltip" is defined in the Column Definition OR Grid Options (the first found will have priority over the second)
 * To specify a tooltip when hovering a cell, extend the column definition like so:
 *
 * Available plugin options (same options are available in both column definition and/or grid options)
 * Example 1  - via Column Definition
 *  this.columnDefinitions = [
 *    {
 *      id: "action", name: "Action", field: "action", formatter: fakeButtonFormatter,
 *      customTooltip: {
 *        formatter: tooltipTaskFormatter,
 *        usabilityOverride: (args) => !!(args.dataContext.id % 2) // show it only every second row
 *      }
 *    }
 *  ];
 *
 *  OR Example 2 - via Grid Options (for all columns), NOTE: the column definition tooltip options will win over the options defined in the grid options
 *  this.gridOptions = {
 *    enableCellNavigation: true,
 *    customTooltip: {
 *    },
 *  };
 */
export declare class SlickCustomTooltip {
    protected _addonOptions?: CustomTooltipOption;
    protected _cellAddonOptions?: CustomTooltipOption;
    protected _cellNodeElm?: HTMLDivElement;
    protected _cellType: CellType;
    protected _cancellablePromise?: CancellablePromiseWrapper;
    protected _observable$?: Subscription;
    protected _rxjs?: RxJsFacade | null;
    protected _sharedService?: SharedService | null;
    protected _tooltipElm?: HTMLDivElement;
    protected _defaultOptions: CustomTooltipOption<any>;
    protected _grid: SlickGrid;
    protected _eventHandler: SlickEventHandler;
    name: 'CustomTooltip';
    constructor();
    get addonOptions(): CustomTooltipOption | undefined;
    get cancellablePromise(): CancellablePromiseWrapper<any> | undefined;
    get cellAddonOptions(): CustomTooltipOption | undefined;
    get className(): string;
    get dataView(): SlickDataView;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    /** Getter for the grid uid */
    get gridUid(): string;
    get gridUidSelector(): string;
    get tooltipElm(): HTMLDivElement | undefined;
    addRxJsResource(rxjs: RxJsFacade): void;
    init(grid: SlickGrid, containerService: ContainerService): void;
    dispose(): void;
    /**
     * hide (remove) tooltip from the DOM, it will also remove it from the DOM and also cancel any pending requests (as mentioned below).
     * When using async process, it will also cancel any opened Promise/Observable that might still be pending.
     */
    hideTooltip(): void;
    getOptions(): CustomTooltipOption | undefined;
    setOptions(newOptions: CustomTooltipOption): void;
    /**
     * Async process callback will hide any prior tooltip & then merge the new result with the item `dataContext` under a `__params` property
     * (unless a new prop name is provided) to provice as dataContext object to the asyncPostFormatter.
     */
    protected asyncProcessCallback(asyncResult: any, cell: {
        row: number;
        cell: number;
    }, value: any, columnDef: Column, dataContext: any): void;
    /** depending on the selector type, execute the necessary handler code */
    protected handleOnHeaderMouseEnterByType(event: SlickEventData, args: any, selector: CellType): void;
    protected handleOnMouseEnter(event: SlickEventData): Promise<void>;
    /**
     * Parse the Custom Formatter (when provided) or return directly the text when it is already a string.
     * We will also sanitize the text in both cases before returning it so that it can be used safely.
     */
    protected parseFormatterAndSanitize(formatterOrText: Formatter | string | undefined, cell: {
        row: number;
        cell: number;
    }, value: any, columnDef: Column, item: unknown): string;
    /**
     * Parse the cell formatter and assume it might be html
     * then create a temporary html element to easily retrieve the first [title=""] attribute text content
     * also clear the "title" attribute from the grid div text content so that it won't show also as a 2nd browser tooltip
     */
    protected renderRegularTooltip(formatterOrText: Formatter | string | undefined, cell: {
        row: number;
        cell: number;
    }, value: any, columnDef: Column, item: any): void;
    protected renderTooltipFormatter(formatter: Formatter | string | undefined, cell: {
        row: number;
        cell: number;
    }, value: any, columnDef: Column, item: unknown, tooltipText?: string, inputTitleElm?: Element | null): void;
    /**
     * Reposition the Tooltip to be top-left position over the cell.
     * By default we use an "auto" mode which will allow to position the Tooltip to the best logical position in the window, also when we mention position, we are talking about the relative position against the grid cell.
     * We can assume that in 80% of the time the default position is top-right, the default is "auto" but we can also override it and use a specific position.
     * Most of the time positioning of the tooltip will be to the "top-right" of the cell is ok but if our column is completely on the right side then we'll want to change the position to "left" align.
     * Same goes for the top/bottom position, Most of the time positioning the tooltip to the "top" but if we are hovering a cell at the top of the grid and there's no room to display it then we might need to reposition to "bottom" instead.
     */
    protected reposition(cell: {
        row: number;
        cell: number;
    }): void;
    /**
     * swap and copy the "title" attribute into a new custom attribute then clear the "title" attribute
     * from the grid div text content so that it won't show also as a 2nd browser tooltip
     */
    protected swapAndClearTitleAttribute(inputTitleElm?: Element | null, tooltipText?: string): void;
}
export {};
//# sourceMappingURL=slickCustomTooltip.d.ts.map