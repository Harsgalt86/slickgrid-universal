import type { Column, DOMMouseOrTouchEvent, ExternalResource, FormatterResultObject, GridOption, PubSubService, RowDetailView, RowDetailViewOption, SlickDataView, SlickEventHandler, SlickGrid, SlickRowDetailView as UniversalRowDetailView, UsabilityOverrideFn } from '@slickgrid-universal/common';
/***
 * A plugin to add Row Detail Panel View (for example providing order detail info when clicking on the order row in the grid)
 * Original StackOverflow question & article making this possible (thanks to violet313)
 * https://stackoverflow.com/questions/10535164/can-slickgrids-row-height-be-dynamically-altered#29399927
 * http://violet313.org/slickgrids/#intro
 */
export declare class SlickRowDetailView implements ExternalResource, UniversalRowDetailView {
    protected readonly pubSubService: PubSubService;
    protected _addonOptions: RowDetailView;
    protected _dataViewIdProperty: string;
    protected _eventHandler: SlickEventHandler;
    protected _expandableOverride: UsabilityOverrideFn | null;
    protected _expandedRows: any[];
    protected _grid: SlickGrid;
    protected _gridRowBuffer: number;
    protected _gridUid: string;
    protected _keyPrefix: string;
    protected _lastRange: {
        bottom: number;
        top: number;
    } | null;
    protected _outsideRange: number;
    protected _rowIdsOutOfViewport: Array<number | string>;
    protected _visibleRenderedCellCount: number;
    protected _defaults: RowDetailView;
    pluginName: 'RowDetailView';
    /** Fired when the async response finished */
    onAsyncEndUpdate: import("@slickgrid-universal/common").SlickEvent<any>;
    /** This event must be used with the "notify" by the end user once the Asynchronous Server call returns the item detail */
    onAsyncResponse: import("@slickgrid-universal/common").SlickEvent<any>;
    /** Fired after the row detail gets toggled */
    onAfterRowDetailToggle: import("@slickgrid-universal/common").SlickEvent<any>;
    /** Fired before the row detail gets toggled */
    onBeforeRowDetailToggle: import("@slickgrid-universal/common").SlickEvent<any>;
    /** Fired after the row detail gets toggled */
    onRowBackToViewportRange: import("@slickgrid-universal/common").SlickEvent<any>;
    /** Fired after a row becomes out of viewport range (when user can't see the row anymore) */
    onRowOutOfViewportRange: import("@slickgrid-universal/common").SlickEvent<any>;
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(pubSubService: PubSubService);
    get addonOptions(): RowDetailView;
    /** Getter of SlickGrid DataView object */
    get dataView(): SlickDataView;
    get dataViewIdProperty(): string;
    get eventHandler(): SlickEventHandler;
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions(): GridOption;
    get gridUid(): string;
    set lastRange(range: {
        bottom: number;
        top: number;
    });
    set rowIdsOutOfViewport(rowIds: Array<string | number>);
    get visibleRenderedCellCount(): number;
    /**
     * Initialize the Export Service
     * @param _grid
     * @param _containerService
     */
    init(grid: SlickGrid): void;
    /** Dispose of the Slick Row Detail View */
    dispose(): void;
    create(columnDefinitions: Column[], gridOptions: GridOption): UniversalRowDetailView | null;
    /** Get current plugin options */
    getOptions(): RowDetailViewOption;
    /** set or change some of the plugin options */
    setOptions(options: Partial<RowDetailViewOption>): void;
    /** Collapse all of the open items */
    collapseAll(): void;
    /** Colapse an Item so it is not longer seen */
    collapseDetailView(item: any, isMultipleCollapsing?: boolean): void;
    /** Expand a row given the dataview item that is to be expanded */
    expandDetailView(item: any): void;
    /** Saves the current state of the detail view */
    saveDetailView(item: any): void;
    /**
     * subscribe to the onAsyncResponse so that the plugin knows when the user server side calls finished
     * the response has to be as "args.item" (or "args.itemDetail") with it's data back
     */
    handleOnAsyncResponse(_e: Event, args: {
        item: any;
        itemDetail: any;
        detailView?: any;
    }): void;
    /**
     * TODO interface only has a GETTER not a SETTER..why?
     * Override the logic for showing (or not) the expand icon (use case example: only every 2nd row is expandable)
     * Method that user can pass to override the default behavior or making every row an expandable row.
     * In order word, user can choose which rows to be an available row detail (or not) by providing his own logic.
     * @param overrideFn: override function callback
     */
    expandableOverride(overrideFn: UsabilityOverrideFn): void;
    getExpandableOverride(): UsabilityOverrideFn | null;
    /** Get the Column Definition of the first column dedicated to toggling the Row Detail View */
    getColumnDefinition(): Column;
    /** return the currently expanded rows */
    getExpandedRows(): Array<number | string>;
    /** return the rows that are out of the viewport */
    getOutOfViewportRows(): Array<number | string>;
    /** Takes in the item we are filtering and if it is an expanded row returns it's parents row to filter on */
    getFilterItem(item: any): any;
    /** Resize the Row Detail View */
    resizeDetailView(item: any): void;
    /**
     * create the detail ctr node. this belongs to the dev & can be custom-styled as per
     */
    protected applyTemplateNewLineHeight(item: any): void;
    protected calculateOutOfRangeViews(): void;
    protected calculateOutOfRangeViewsSimplerVersion(): void;
    protected checkExpandableOverride(row: number, dataContext: any, grid: SlickGrid): boolean;
    protected checkIsRowOutOfViewportRange(rowIndex: number, renderedRange: any): boolean;
    /** Get the Row Detail padding (which are the rows dedicated to the detail panel) */
    protected getPaddingItem(parent: any, offset: any): any;
    /** The Formatter of the toggling icon of the Row Detail */
    protected detailSelectionFormatter(row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid: SlickGrid): FormatterResultObject | string;
    /** When row is getting toggled, we will handle the action of collapsing/expanding */
    protected handleAccordionShowHide(item: any): void;
    /** Handle mouse click event */
    protected handleClick(e: DOMMouseOrTouchEvent<HTMLDivElement>, args: {
        row: number;
        cell: number;
    }): void;
    protected handleScroll(): void;
    protected notifyOutOfViewport(item: any, rowId: number | string): void;
    protected notifyBackToViewportWhenDomExist(item: any, rowId: number | string): void;
    protected syncOutOfViewportArray(rowId: number | string, isAdding: boolean): (string | number)[];
    protected toggleRowSelection(rowNumber: number, dataContext: any): void;
}
//# sourceMappingURL=slickRowDetailView.d.ts.map